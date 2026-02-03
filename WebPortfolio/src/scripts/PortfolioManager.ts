/**
 * Portfolio Manager
 * Main coordinator for loading and managing portfolio projects
 */

import { CompleteProject, ProjectMetadata, GithubRepoData } from './PortfolioTypes';
import { MarkdownParser } from './MarkdownParser';
import { GitHubAPIManager } from './GithubApi';

export class PortfolioManager {
    private projects: CompleteProject[] = [];
    private githubToken?: string;

    constructor(githubToken?: string) {
        this.githubToken = githubToken;
    }

    /**
     * Load a project from a markdown file
     */
    async loadProjectFromFile(markdownPath: string): Promise<CompleteProject> {
        try {
            // Fetch the markdown file
            const response = await fetch(markdownPath);
            if (!response.ok) {
                throw new Error(`Failed to load ${markdownPath}: ${response.status}`);
            }

            const markdownContent = await response.text();
            const metadata = MarkdownParser.parseProject(markdownContent);

            // Fetch GitHub data if repo link exists
            let githubData: GithubRepoData | null = null;
            if (metadata.repoLink) {
                const repoInfo = MarkdownParser.extractRepoInfo(metadata.repoLink);
                if (repoInfo) {
                    try {
                        githubData = await GitHubAPIManager.fetchRepoData(
                            repoInfo.owner,
                            repoInfo.repo,
                            this.githubToken
                        );
                    } catch (error) {
                        console.error(`Failed to fetch GitHub data for ${metadata.repoLink}:`, error);
                    }
                }
            }

            return {
                metadata,
                githubData,
                markdownPath
            };
        } catch (error) {
            console.error(`Error loading project from ${markdownPath}:`, error);
            throw error;
        }
    }

    /**
     * Load multiple projects from an array of markdown file paths
     */
    async loadProjects(markdownPaths: string[]): Promise<CompleteProject[]> {
        const promises = markdownPaths.map(path => this.loadProjectFromFile(path));
        this.projects = await Promise.all(promises);
        return this.projects;
    }

    /**
     * Get all loaded projects
     */
    getProjects(): CompleteProject[] {
        return this.projects;
    }

    /**
     * Refresh GitHub data for all projects
     */
    async refreshGitHubData(): Promise<void> {
        for (const project of this.projects) {
            if (project.metadata.repoLink) {
                const repoInfo = MarkdownParser.extractRepoInfo(project.metadata.repoLink);
                if (repoInfo) {
                    try {
                        project.githubData = await GitHubAPIManager.fetchRepoData(
                            repoInfo.owner,
                            repoInfo.repo,
                            this.githubToken
                        );
                    } catch (error) {
                        console.error(`Failed to refresh GitHub data for ${project.metadata.title}:`, error);
                    }
                }
            }
        }
    }

    /**
     * Clear all GitHub API cache
     */
    clearCache(): void {
        GitHubAPIManager.clearCache();
    }

    /**
     * Sort projects by last updated date (most recent first)
     */
    sortByLastUpdated(): void {
        this.projects.sort((a, b) => {
            const dateA = a.githubData?.lastUpdated ? new Date(a.githubData.lastUpdated).getTime() : 0;
            const dateB = b.githubData?.lastUpdated ? new Date(b.githubData.lastUpdated).getTime() : 0;
            return dateB - dateA;
        });
    }

    /**
     * Sort projects alphabetically by title
     */
    sortByTitle(): void {
        this.projects.sort((a, b) =>
            a.metadata.title.localeCompare(b.metadata.title)
        );
    }
}