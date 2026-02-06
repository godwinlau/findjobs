// YouTube video/playlist mappings for learning resources
// Cluster-level defaults + skill-specific overrides
// Curated: specific high-quality videos (not channel URLs)

export const CLUSTER_YOUTUBE: Record<string, { url: string; channel: string }> = {
  DEV:   { url: "https://www.youtube.com/watch?v=nu_pCVPKzTk", channel: "freeCodeCamp" },
  DES:   { url: "https://www.youtube.com/watch?v=68w2vhDuQ_g", channel: "freeCodeCamp" },
  DATA:  { url: "https://www.youtube.com/playlist?list=PLUaB-1hjhk8FE_XZ87vPPSfHqb6OcM0cF", channel: "Alex The Analyst" },
  BPO:   { url: "https://www.youtube.com/watch?v=5QNOWMFPJaY", channel: "Don Georgevich" },
  MKT:   { url: "https://www.youtube.com/watch?v=xpVkEBi92Cg", channel: "Ahrefs" },
  VA:    { url: "https://www.youtube.com/watch?v=EfHUBqFoaxI", channel: "Learnit Training" },
  FIN:   { url: "https://www.youtube.com/watch?v=yYX4bvQSqbo", channel: "Accounting Stuff" },
  SALES: { url: "https://www.youtube.com/watch?v=i6U2V1-hQl8", channel: "Salesforce" },
  ENG:   { url: "https://www.youtube.com/watch?v=VtLSiSmRiuM", channel: "SourceCAD" },
  HC:    { url: "https://www.youtube.com/watch?v=OaQ5jLGiSJo", channel: "Osmosis" },
  EDU:   { url: "https://www.youtube.com/watch?v=Q2tBR4mJkCw", channel: "Devlin Peck" },
  TRADE: { url: "https://www.youtube.com/watch?v=0hMl3GHFQmU", channel: "Electrician U" },
};

// Skill-specific overrides — curated single best tutorial per skill
export const SKILL_YOUTUBE: Record<string, { url: string; channel: string }> = {
  // DEV overrides
  "javascript":   { url: "https://www.youtube.com/watch?v=lfmDcL4qOSs", channel: "Bro Code" },
  "typescript":   { url: "https://www.youtube.com/watch?v=gp5H0Vw39yw", channel: "Dave Gray" },
  "react":        { url: "https://www.youtube.com/watch?v=LDB4uaJ87e0", channel: "Traversy Media" },
  "next.js":      { url: "https://www.youtube.com/watch?v=vCOSTG10Y4o", channel: "Lama Dev" },
  "python":       { url: "https://www.youtube.com/watch?v=rfscVS0vtbw", channel: "freeCodeCamp" },
  "node.js":      { url: "https://www.youtube.com/watch?v=Oe421EPjeBE", channel: "freeCodeCamp" },
  "docker":       { url: "https://www.youtube.com/watch?v=3c-iBn73dDE", channel: "TechWorld with Nana" },
  "aws":          { url: "https://www.youtube.com/watch?v=NhDYbskXRgc", channel: "freeCodeCamp" },
  "git":          { url: "https://www.youtube.com/watch?v=RGOj5yH7evk", channel: "freeCodeCamp" },
  // DATA overrides
  "excel":            { url: "https://www.youtube.com/watch?v=Vl0H-qTclOg", channel: "Leila Gharani" },
  "excel (advanced)": { url: "https://www.youtube.com/watch?v=HJABdOo5ECA", channel: "Leila Gharani" },
  "power bi":         { url: "https://www.youtube.com/watch?v=AGrl-H87pRU", channel: "Kevin Stratvert" },
  "tableau":          { url: "https://www.youtube.com/watch?v=TPMlZxRRaBQ", channel: "freeCodeCamp" },
  // FIN overrides
  "quickbooks":       { url: "https://www.youtube.com/watch?v=xV4dJMxbo9I", channel: "Hector Garcia CPA" },
  "bookkeeping":      { url: "https://www.youtube.com/watch?v=yYX4bvQSqbo", channel: "Accounting Stuff" },
  // VA overrides
  "notion":           { url: "https://www.youtube.com/watch?v=oTahLEX3NXo", channel: "Thomas Frank" },
  "google workspace": { url: "https://www.youtube.com/watch?v=EfHUBqFoaxI", channel: "Learnit Training" },
  // ENG overrides
  "autocad":          { url: "https://www.youtube.com/watch?v=VtLSiSmRiuM", channel: "SourceCAD" },
  "solidworks":       { url: "https://www.youtube.com/watch?v=qtgmGkEPXs0", channel: "CAD CAM Tutorials" },
  // DES overrides
  "figma":            { url: "https://www.youtube.com/watch?v=68w2vhDuQ_g", channel: "freeCodeCamp" },
  "canva":            { url: "https://www.youtube.com/watch?v=rCMdoGGzCow", channel: "The Social Guide" },
  "adobe photoshop":  { url: "https://www.youtube.com/watch?v=IyR_uYsRdPs", channel: "PiXimperfect" },
  // MKT overrides
  "seo":              { url: "https://www.youtube.com/watch?v=xpVkEBi92Cg", channel: "Ahrefs" },
  // SALES overrides
  "salesforce crm":   { url: "https://www.youtube.com/watch?v=i6U2V1-hQl8", channel: "Salesforce" },
};

export function getYoutubeForSkill(
  skill: string,
  clusterId: string
): { url: string; channel: string } | null {
  return SKILL_YOUTUBE[skill.toLowerCase()] ?? CLUSTER_YOUTUBE[clusterId] ?? null;
}

/**
 * Creates a sync lookup function from server-fetched YouTube maps.
 * Use this on the client when maps have been passed as serializable props.
 */
export function createYoutubeLookup(
  maps: { clusters: Record<string, { url: string; channel: string }>; skills: Record<string, { url: string; channel: string }> }
) {
  return (skill: string, clusterId: string): { url: string; channel: string } | null => {
    return maps.skills[skill.toLowerCase()] ?? maps.clusters[clusterId] ?? null;
  };
}
