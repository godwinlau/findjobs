import { resolveSkillCluster } from "@/lib/constants/skillTaxonomy";
import { normalizeSkill } from "./skills";

// ─── Cluster affinity scoring ───

/**
 * Compute user's affinity to each skill cluster based on their skills.
 * Returns a Map of clusterId → affinity (0.0-1.0).
 */
export function computeClusterAffinities(userSkills: string[]): Map<string, number> {
  const affinities = new Map<string, number>();
  if (!userSkills || userSkills.length === 0) return affinities;

  const normalizedSkills = userSkills.map((s) => normalizeSkill(s));
  const clusterCounts: Record<string, number> = {};

  for (const skill of normalizedSkills) {
    const clusterId = resolveSkillCluster(skill, normalizedSkills);
    if (clusterId) {
      clusterCounts[clusterId] = (clusterCounts[clusterId] ?? 0) + 1;
    }
  }

  const total = normalizedSkills.length;
  for (const [cluster, count] of Object.entries(clusterCounts)) {
    affinities.set(cluster, count / total);
  }

  return affinities;
}

/**
 * Compute cluster-based boost for a job based on user's cluster affinities.
 * Returns 0.0 to 0.15 boost value.
 */
export function computeClusterBoost(
  jobSkills: string[],
  userAffinities: Map<string, number>,
): number {
  if (userAffinities.size === 0 || !jobSkills || jobSkills.length === 0) return 0;

  // Determine job's cluster distribution
  const jobClusterCounts: Record<string, number> = {};
  for (const skill of jobSkills) {
    const clusterId = resolveSkillCluster(normalizeSkill(skill), jobSkills.map(normalizeSkill));
    if (clusterId) {
      jobClusterCounts[clusterId] = (jobClusterCounts[clusterId] ?? 0) + 1;
    }
  }

  // Find job's primary cluster (most skills)
  let jobPrimary = "";
  let jobPrimaryCount = 0;
  const jobClusterIds: string[] = [];
  for (const [cluster, count] of Object.entries(jobClusterCounts)) {
    jobClusterIds.push(cluster);
    if (count > jobPrimaryCount) {
      jobPrimary = cluster;
      jobPrimaryCount = count;
    }
  }

  if (!jobPrimary) return 0;

  // Sort user affinities descending to find primary/secondary
  const sorted = Array.from(userAffinities.entries()).sort((a, b) => b[1] - a[1]);
  const userPrimary = sorted[0]?.[0];
  const userSecondary = sorted[1]?.[0];

  // "Unicorn job" — matches 2+ of user's clusters
  const userClusterIds = new Set(sorted.filter(([, v]) => v > 0).map(([k]) => k));
  const matchingClusters = jobClusterIds.filter((c) => userClusterIds.has(c));

  if (matchingClusters.length >= 2) return 0.12;
  if (jobPrimary === userPrimary) return 0.15;
  if (jobPrimary === userSecondary) return 0.08;

  return 0;
}
