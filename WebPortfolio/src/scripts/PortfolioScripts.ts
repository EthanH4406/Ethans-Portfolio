interface RepoConfig {
    username: string;
    repositories: string[];
}

const CONFIG: RepoConfig = {
    username: 'EthanH4406',
    repositories: [
        'PublicJunkyardJunction'
    ]
};

//card gen
interface GitHubRepo {
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    topics: string[];
    private: boolean;
    updated_at: string;
    created_at: string;
    homepage: string | null;
}

class GitHubPortfolio {
    private container: HTMLElement;
    private loadingIndicator: HTMLElement;
    private errorMessage: HTMLElement;

    constructor() {
        this.container = document.getElementById('repoCardsContainer') as HTMLElement;
        this.loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
        this.errorMessage = document.getElementById('errorMessage') as HTMLElement;

        this.init();
    }

    private init(): void {
        //auto load
        this.loadRepositories();
    }

    private async loadRepositories(): Promise<void> {
        this.showLoading();
        this.hideError();
        this.container.innerHTML = '';

        try {
            const repos = await this.fetchRepositories(CONFIG.username, CONFIG.repositories);
            this.hideLoading();

            if(repos.length === 0) {
                this.showError('No repos found. Check config.');
            } else {
                this.renderRepoCards(repos);
            }
        } catch (error) {
            this.hideLoading();
            this.showError(error instanceof Error ? error.message : 'An error occurred when fetching repos');
        }
    }

    private async fetchRepositories(username: string, repoNames: string[]): Promise<GitHubRepo[]> {
        const repos: GitHubRepo[] = [];
        const errors: string[] = [];

        for(const repoName of repoNames) {
            try {
                const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);

                if(response.status === 404) {
                    errors.push(`Repo "${repoName}" not found`);
                    continue;
                }

                if(response.status === 403) {
                    throw new Error(`Github API rate limit exceeded`);
                }

                if(!response.ok) {
                    errors.push(`Failed to fetch "${repoName}": ${response.statusText}`);
                    continue;
                }

                const data: GitHubRepo = await response.json();
                repos.push(data);
            } catch(error) {
                if(error instanceof Error && error.message.includes(`rate limit`)) {
                    throw error;
                }
                errors.push(`Error fetching "${repoName}": ${error instanceof Error ? error.message : 'Unknown Error'}`);
            }
        }

        if(errors.length > 0 && repos.length === 0) {
            throw new Error(errors.join('; '));
        }

        return repos;
    }

    private renderRepoCards(repos: GitHubRepo[]) : void {
        repos.forEach((repo, index) => {
            const card = this.createRepoCard(repo);
            card.style.animationDelay = `${index * 0.1}s`;
            this.container.appendChild(card);
        });
    }

    private createRepoCard(repo: GitHubRepo): HTMLElement {
        const card = document.createElement('div');
        card.className = 'repo-card';
        card.addEventListener('click', () => window.open(repo.html_url, '_blank'));

        const languageClass = repo.language
            ? `lang-${repo.language.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            : '';
        
        const updatedDate = this.formatDate(repo.updated_at);
        card.innerHTML = `
            <div class="repo-card-header"> 
                <div class="repo-icon">
                </div>
                <span class="repo-visibility ${repo.private ? 'visibility-private' : 'visibility-public'}">
                    ${repo.private ? 'Private' : 'Public'}
                </span>
            </div>
            
            <h3 class="repo-name">${this.escapeHtml(repo.name)}</h3>
            <p class="repo-description">${repo.description ? this.escapeHtml(repo.description) : 'No description provided'}</p>
            
            <div class="repo-meta">
                ${repo.language ? `
                    <div class="meta-item">
                        <span class="language-dot ${languageClass}"></span>
                        <span>${this.escapeHtml(repo.language)}</span>
                    </div>
                ` : ''}
                
                <div class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>${repo.stargazers_count}</span>
                </div>
                
                <div class="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 8v4m0 4v1m9-7h-1m-16 0H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path>
                    </svg>
                    <span>${repo.forks_count}</span>
                </div>

                ${repo.open_issues_count > 0 ? `
                    <div class="meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>${repo.open_issues_count}</span>
                    </div>
                ` : ''}
            </div>

            ${repo.topics && repo.topics.length > 0 ? `
                <div class="repo-topics">
                    ${repo.topics.slice(0, 5).map(topic => 
                        `<span class="topic-tag">${this.escapeHtml(topic)}</span>`
                    ).join('')}
                </div>
            ` : ''}

            <div class="repo-footer">
                <span class="repo-updated">Updated ${updatedDate}</span>
                <a href="${repo.html_url}" class="repo-link" target="_blank" onclick="event.stopPropagation()">
                    View Repo
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </a>
            </div>
        `;

        return card;            
    }

    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime()- date.getTime());
        const diffDays = Math.floor(diffTime/ (1000 * 60 *60 *24));

        if(diffDays === 0) {
            return 'today';
        } else if(diffDays === 1) {
            return 'yesterday';
        } else if(diffDays < 7) {
            return `${diffDays} days ago`;
        } else if(diffDays < 30) {
            const weeks = Math.floor(diffDays/7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} ${years === 1 ? 'year' : 'years'} ago`;
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private showLoading() : void {
        this.loadingIndicator.style.display = 'flex';
    }

    private hideLoading() : void {
        this.loadingIndicator.style.display = 'none';
    }

    private showError(message: string) : void {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    private hideError() : void {
        this.errorMessage.style.display = 'none';
        this.errorMessage.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GitHubPortfolio();
});

export {};