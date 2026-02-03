export interface ProjectMetadata {
    title: string;
    description: string;
    role: string;
    features: string[];
    repoLink: string;
}

export interface GithubLanguageStats {
    [language: string]: number;
}

export interface GithubRepoData {
    lastUpdated: string;
    languages: GithubLanguageStats;
    previewImages: string[];
}

export interface CachedRepoData {
    [repoUrl: string]: {
        timestamp: number;
        data: GithubRepoData;
    };
}

export interface CompleteProject {
    metadata: ProjectMetadata;
    githubData: GithubRepoData | null;
    markdownPath: string;
}

export interface LanguageBreakdown {
    language: string;
    percentage: number;
    bytes: number;
    color: string;
}