/**
 * Project Card Component
 * Handles rendering and interaction for individual project cards
 */

import { CompleteProject, LanguageBreakdown } from './PortfolioTypes';
import { LanguageUtils } from './LanguageUtils';
import { ImageCarousel } from './ImageCarousel';
import { LanguageBreakdownView } from './LanguageBreakdown';

export class ProjectCard {
    private project: CompleteProject;
    private element: HTMLElement;
    private carousel: ImageCarousel | null = null;
    private languageView: LanguageBreakdownView | null = null;
    private isExpanded: boolean = false;
    private animationDelay: number;

    constructor(project: CompleteProject, index: number = 0) {
        this.project = project;
        this.element = document.createElement('div');
        this.animationDelay = index * 100; // Stagger animations
    }

    /**
     * Render the project card
     */
    render(): HTMLElement {
        this.element.className = 'project-card';
        this.element.style.animationDelay = `${this.animationDelay}ms`;

        this.element.innerHTML = `
      <div class="project-card-inner">
        ${this.renderHeader()}
        ${this.renderCarousel()}
        ${this.renderCollapsedContent()}
        ${this.renderExpandedContent()}
      </div>
    `;

        // Initialize carousel if there are images
        if (this.project.githubData?.previewImages && this.project.githubData.previewImages.length > 0) {
            const carouselElement = this.element.querySelector('.carousel-container');
            if (carouselElement) {
                this.carousel = new ImageCarousel(
                    this.project.githubData.previewImages,
                    this.project.metadata.title
                );
                carouselElement.appendChild(this.carousel.render());
            }
        }

        // Setup event listeners
        this.setupEventListeners();

        return this.element;
    }

    /**
     * Render card header with title and date
     */
    private renderHeader(): string {
        const lastUpdated = this.project.githubData?.lastUpdated
            ? this.formatDate(this.project.githubData.lastUpdated)
            : 'Unknown';

        return `
      <div class="project-card-header">
        <h3 class="project-title">${this.escapeHtml(this.project.metadata.title)}</h3>
        <div class="project-date">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${lastUpdated}</span>
        </div>
      </div>
    `;
    }

    /**
     * Render image carousel container
     */
    private renderCarousel(): string {
        if (!this.project.githubData?.previewImages || this.project.githubData.previewImages.length === 0) {
            return `
        <div class="project-placeholder">
          <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>No Preview Available</span>
        </div>
      `;
        }

        return '<div class="carousel-container"></div>';
    }

    /**
     * Render collapsed content (always visible)
     */
    private renderCollapsedContent(): string {
        return `
      <div class="project-card-body">
        <button class="btn-expand" aria-expanded="false" aria-label="Expand project details">
          <span class="expand-text">View Details</span>
          <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    `;
    }

    /**
     * Render expanded content (shown when card is expanded)
     */
    private renderExpandedContent(): string {
        const languageBreakdown = this.project.githubData?.languages
            ? LanguageUtils.calculateBreakdown(this.project.githubData.languages)
            : [];

        return `
      <div class="project-card-expanded" hidden>
        <div class="project-description">
          <h4>Description</h4>
          <p>${this.escapeHtml(this.project.metadata.description)}</p>
        </div>

        ${this.project.metadata.role ? `
          <div class="project-role">
            <h4>Role</h4>
            <p>${this.escapeHtml(this.project.metadata.role)}</p>
          </div>
        ` : ''}

        ${this.project.metadata.features.length > 0 ? `
          <div class="project-features">
            <h4>Key Features</h4>
            <ul>
              ${this.project.metadata.features.map(feature =>
            `<li>${this.escapeHtml(feature)}</li>`
        ).join('')}
            </ul>
          </div>
        ` : ''}

        ${languageBreakdown.length > 0 ? `
          <div class="project-languages">
            <button class="btn-language-toggle" aria-expanded="false">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <span>Language Breakdown</span>
              <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="language-breakdown-container" hidden></div>
          </div>
        ` : ''}

        <div class="project-actions">
          <a href="${this.escapeHtml(this.project.metadata.repoLink)}" 
             class="btn-repo" 
             target="_blank" 
             rel="noopener noreferrer">
            <span>View Repository</span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    `;
    }

    /**
     * Setup event listeners for card interactions
     */
    private setupEventListeners(): void {
        // Expand/collapse main card
        const expandBtn = this.element.querySelector('.btn-expand');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.toggleExpanded());
        }

        // Language breakdown toggle
        const languageBtn = this.element.querySelector('.btn-language-toggle');
        if (languageBtn) {
            languageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLanguageBreakdown();
            });
        }
    }

    /**
     * Toggle card expanded state
     */
    private toggleExpanded(): void {
        this.isExpanded = !this.isExpanded;

        const expandedContent = this.element.querySelector('.project-card-expanded') as HTMLElement;
        const expandBtn = this.element.querySelector('.btn-expand') as HTMLButtonElement;
        const expandIcon = this.element.querySelector('.expand-icon') as HTMLElement;
        const expandText = this.element.querySelector('.expand-text') as HTMLElement;

        if (expandedContent && expandBtn && expandIcon && expandText) {
            if (this.isExpanded) {
                expandedContent.hidden = false;
                expandBtn.setAttribute('aria-expanded', 'true');
                expandIcon.style.transform = 'rotate(180deg)';
                expandText.textContent = 'Hide Details';
                this.element.classList.add('expanded');
            } else {
                expandedContent.hidden = true;
                expandBtn.setAttribute('aria-expanded', 'false');
                expandIcon.style.transform = 'rotate(0deg)';
                expandText.textContent = 'View Details';
                this.element.classList.remove('expanded');
            }
        }
    }

    /**
     * Toggle language breakdown view
     */
    private toggleLanguageBreakdown(): void {
        const container = this.element.querySelector('.language-breakdown-container') as HTMLElement;
        const toggleBtn = this.element.querySelector('.btn-language-toggle') as HTMLButtonElement;
        const toggleIcon = toggleBtn?.querySelector('.toggle-icon') as HTMLElement;

        if (!container || !toggleBtn) return;

        const isHidden = container.hidden;

        if (isHidden) {
            // Show language breakdown
            if (!this.languageView && this.project.githubData?.languages) {
                const breakdown = LanguageUtils.calculateBreakdown(this.project.githubData.languages);
                this.languageView = new LanguageBreakdownView(breakdown);
                container.appendChild(this.languageView.render());
            }
            container.hidden = false;
            toggleBtn.setAttribute('aria-expanded', 'true');
            if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
        } else {
            // Hide language breakdown
            container.hidden = true;
            toggleBtn.setAttribute('aria-expanded', 'false');
            if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
        }
    }

    /**
     * Update project data
     */
    updateData(project: CompleteProject): void {
        this.project = project;
        // Re-render the card
        const parent = this.element.parentNode;
        const newElement = this.render();
        if (parent) {
            parent.replaceChild(newElement, this.element);
        }
    }

    /**
     * Format date to readable string
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}