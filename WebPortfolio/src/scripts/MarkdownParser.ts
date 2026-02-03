/**
 * Markdown Parser for Project Files
 * Parses project markdown files to extract metadata
 */

import { ProjectMetadata } from './PortfolioTypes';

export class MarkdownParser {
    /**
     * Parses markdown content and extracts project metadata
     * 
     * Expected markdown format:
     * # Project Title
     * ## Description
     * Your description here
     * ## Role
     * Your role here
     * ## Features
     * - Feature 1
     * - Feature 2
     * ## Repository
     * https://github.com/username/repo
     */
    static parseProject(markdown: string): ProjectMetadata {
        const lines = markdown.split('\n');
        const project: ProjectMetadata = {
            title: '',
            description: '',
            role: '',
            features: [],
            repoLink: ''
        };

        let currentSection: 'title' | 'description' | 'role' | 'features' | 'repo' | null = null;

        for (const line of lines) {
            const trimmed = line.trim();

            // Check for headers
            if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
                project.title = trimmed.substring(2).trim();
                currentSection = 'title';
            } else if (trimmed.toLowerCase().startsWith('## description')) {
                currentSection = 'description';
            } else if (trimmed.toLowerCase().startsWith('## role')) {
                currentSection = 'role';
            } else if (trimmed.toLowerCase().startsWith('## features')) {
                currentSection = 'features';
            } else if (trimmed.toLowerCase().startsWith('## repository') ||
                trimmed.toLowerCase().startsWith('## repo')) {
                currentSection = 'repo';
            } else if (trimmed && currentSection) {
                // Process content based on current section
                switch (currentSection) {
                    case 'description':
                        if (!trimmed.startsWith('##')) {
                            project.description += (project.description ? ' ' : '') + trimmed;
                        }
                        break;
                    case 'role':
                        if (!trimmed.startsWith('##')) {
                            project.role += (project.role ? ' ' : '') + trimmed;
                        }
                        break;
                    case 'features':
                        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                            project.features.push(trimmed.substring(2).trim());
                        } else if (trimmed.match(/^\d+\.\s/)) {
                            project.features.push(trimmed.replace(/^\d+\.\s/, '').trim());
                        }
                        break;
                    case 'repo':
                        const urlMatch = trimmed.match(/https?:\/\/github\.com\/[^\s)]+/);
                        if (urlMatch) {
                            project.repoLink = urlMatch[0];
                        }
                        break;
                }
            }
        }

        return project;
    }

    /**
     * Extracts the GitHub repo owner and name from a GitHub URL
     */
    static extractRepoInfo(repoUrl: string): { owner: string; repo: string } | null {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\s#?]+)/);
        if (!match) return null;

        return {
            owner: match[1],
            repo: match[2]
        };
    }
}