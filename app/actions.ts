"use server";

import { getTrendingRoles, getTopHiringCompanies } from "@/lib/jobs";
import type { TrendingRole, CompanyInfo } from "@/lib/types/home";

export async function fetchCategoryData(
  category: string
): Promise<{ roles: TrendingRole[]; companies: CompanyInfo[] }> {
  const [roles, companies] = await Promise.all([
    getTrendingRoles(category),
    getTopHiringCompanies(category),
  ]);

  return { roles, companies };
}
