import { GithubRepoData, CachedRepoData, GithubLanguageStats } from './PortfolioTypes';

export class GitHubAPIManager {
    private static readonly CACHE_KEY = 'portfolio_github_cache';
    private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
    private static readonly PREVIEW_FOLDER = 'repo_Previews';

    private static getCache(): CachedRepoData {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return {};
            return JSON.parse(cached);
        } catch (error) {
            console.error('Error reading cache:', error);
            return {};
        }
    }

    private static setCache(cache: CachedRepoData): void {
        try {
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Error writing cache:', error);
        }
    }

    private static isCacheValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    static async fetchRepoData(
        owner: string,
        repo: string,
        githubToken?: string
    ): Promise<GithubRepoData> {
        const repoUrl = `https://github.com/${owner}/${repo}`;
        const cache = this.getCache();

        // Check if we have valid cached data
        if (cache[repoUrl] && this.isCacheValid(cache[repoUrl].timestamp)) {
            console.log(`Using cached data for ${owner}/${repo}`);
            return cache[repoUrl].data;
        }

        console.log(`Fetching fresh data for ${owner}/${repo}`);

        try {
            // Fetch data from GitHub API
            const repoData = await this.fetchFromGitHub(owner, repo, githubToken);

            // Update cache
            cache[repoUrl] = {
                timestamp: Date.now(),
                data: repoData
            };
            this.setCache(cache);

            return repoData;
        } catch (error) {
            console.error(`Error fetching GitHub data for ${owner}/${repo}:`, error);

            // If we have stale cached data, use it as fallback
            if (cache[repoUrl]) {
                console.log(`Using stale cached data for ${owner}/${repo} as fallback`);
                return cache[repoUrl].data;
            }

            // Return empty data if no cache available
            return {
                lastUpdated: new Date().toISOString(),
                languages: {},
                previewImages: []
            };
        }
    }

    private static async fetchFromGitHub(
        owner: string,
        repo: string,
        githubToken?: string
    ): Promise<GithubRepoData> {
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`;
        }

        // Fetch repository info
        const repoResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}`,
            { headers }
        );

        if (!repoResponse.ok) {
            throw new Error(`GitHub API error: ${repoResponse.status}`);
        }

        const repoInfo = await repoResponse.json();

        // Fetch language statistics
        const languagesResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/languages`,
            { headers }
        );

        let languages: GithubLanguageStats = {};
        if (languagesResponse.ok) {
            languages = await languagesResponse.json();
        }

        // Fetch preview images from repo_Previews folder
        const previewImages = await this.fetchPreviewImages(owner, repo, headers);

        return {
            lastUpdated: repoInfo.updated_at || repoInfo.pushed_at,
            languages,
            previewImages
        };
    }

    private static async fetchPreviewImages(
        owner: string,
        repo: string,
        headers: HeadersInit
    ): Promise<string[]> {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${this.PREVIEW_FOLDER}`,
                { headers }
            );

            if (!response.ok) {
                return [];
            }

            const contents = await response.json();

            if (!Array.isArray(contents)) {
                return [];
            }

            // Filter for image files and return their download URLs
            return contents
                .filter((file: any) =>
                    file.type === 'file' &&
                    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
                )
                .map((file: any) => file.download_url);
        } catch (error) {
            console.error('Error fetching preview images:', error);
            return [];
        }
    }

    static clearCache(): void {
        localStorage.removeItem(this.CACHE_KEY);
    }

    static getCacheStatus(owner: string, repo: string): {
        cached: boolean;
        valid: boolean;
        age?: number;
    } {
        const repoUrl = `https://github.com/${owner}/${repo}`;
        const cache = this.getCache();

        if (!cache[repoUrl]) {
            return { cached: false, valid: false };
        }

        const age = Date.now() - cache[repoUrl].timestamp;
        const valid = this.isCacheValid(cache[repoUrl].timestamp);

        return { cached: true, valid, age };
    }
}