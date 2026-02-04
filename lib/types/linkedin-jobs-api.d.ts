declare module "linkedin-jobs-api" {
  interface QueryOptions {
    keyword?: string;
    location?: string;
    dateSincePosted?: string;
    jobType?: string;
    remoteFilter?: string;
    salary?: string;
    experienceLevel?: string;
    limit?: string;
    sortBy?: string;
    page?: string;
    has_verification?: boolean;
    under_10_applicants?: boolean;
  }

  interface JobResult {
    position: string;
    company: string;
    companyLogo: string;
    location: string;
    date: string;
    agoTime: string;
    salary: string;
    jobUrl: string;
  }

  interface LinkedInJobsApi {
    query(options: QueryOptions): Promise<JobResult[]>;
  }

  const linkedIn: LinkedInJobsApi;
  export default linkedIn;
}
