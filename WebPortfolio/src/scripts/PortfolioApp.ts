/**
 * Main Application Entry Point
 * Initializes and manages the portfolio display
 */

import { PortfolioManager } from './PortfolioManager';
import { CompleteProject } from './PortfolioTypes';
import { ProjectCard } from './Projectcard';

class PortfolioApp {
    private manager: PortfolioManager;
    private container: HTMLElement | null;
    private projectCards: ProjectCard[] = [];

    constructor(containerId: string = 'portfolio-projects', githubToken?: string) {
        this.manager = new PortfolioManager(githubToken);
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error(`Container element with id "${containerId}" not found`);
        }
    }

    /**
     * Initialize the portfolio with project markdown files
     */
    async init(projectPaths: string[]): Promise<void> {
        try {
            // Show loading state
            this.showLoading();

            // Load all projects
            const projects = await this.manager.loadProjects(projectPaths);

            // Sort by last updated
            this.manager.sortByLastUpdated();

            // Render projects
            this.renderProjects(projects);

            // Setup auto-refresh (optional - every hour)
            this.setupAutoRefresh();
        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
            this.showError('Failed to load projects. Please refresh the page.');
        }
    }

    /**
     * Render all project cards
     */
    private renderProjects(projects: CompleteProject[]): void {
        if (!this.container) return;

        // Clear existing content
        this.container.innerHTML = '';
        this.projectCards = [];

        if (projects.length === 0) {
            this.container.innerHTML = `
        <div class="alert alert-info">
          No projects found. Add markdown files to display your projects.
        </div>
      `;
            return;
        }

        // Create a row for Bootstrap grid
        const row = document.createElement('div');
        row.className = 'row g-4';

        // Create project cards
        projects.forEach((project, index) => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4';

            const card = new ProjectCard(project, index);
            col.appendChild(card.render());
            row.appendChild(col);

            this.projectCards.push(card);
        });

        this.container.appendChild(row);
    }

    /**
     * Show loading state
     */
    private showLoading(): void {
        if (!this.container) return;

        this.container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading projects...</p>
      </div>
    `;
    }

    /**
     * Show error message
     */
    private showError(message: string): void {
        if (!this.container) return;

        this.container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        ${message}
      </div>
    `;
    }

    /**
     * Setup automatic refresh every hour
     */
    private setupAutoRefresh(): void {
        setInterval(async () => {
            console.log('Auto-refreshing GitHub data...');
            await this.manager.refreshGitHubData();

            // Update existing cards with new data
            const projects = this.manager.getProjects();
            this.projectCards.forEach((card, index) => {
                if (projects[index]) {
                    card.updateData(projects[index]);
                }
            });
        }, 60 * 60 * 1000); // 1 hour
    }

    /**
     * Manually refresh all GitHub data
     */
    async refresh(): Promise<void> {
        await this.manager.refreshGitHubData();
        const projects = this.manager.getProjects();
        this.renderProjects(projects);
    }

    /**
     * Clear cache and reload
     */
    async clearCacheAndReload(projectPaths: string[]): Promise<void> {
        this.manager.clearCache();
        await this.init(projectPaths);
    }
}

// Export for global use
(window as any).PortfolioApp = PortfolioApp;

export default PortfolioApp;