interface ProjectCard {
    element: HTMLElement;
    expandBtn: HTMLButtonElement;
    isExpanded: boolean;
}

const CONFIG = {
    selectors: {
        projectCard: '.project-card',
        cardHeader: '.project-card-header',
        expandBtn: '.expand-btn',
    },
    classes: {
        expanded: 'expanded',
    },
    animationDuration: 400,
} as const;

class ProjectCardManager {
    private cards: Map<string, ProjectCard> = new Map();

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const cardElements = document.querySelectorAll<HTMLElement>(CONFIG.selectors.projectCard);

        cardElements.forEach((element, index) => {
            const expandBtn = element.querySelector<HTMLButtonElement>(CONFIG.selectors.expandBtn);
            const cardHeader = element.querySelector<HTMLElement>(CONFIG.selectors.cardHeader);

            if (!expandBtn || !cardHeader) {
                console.warn(`Project card ${index} is missing required elements`);
                return;
            }

            const cardId = element.dataset.project || `card-${index}`;
            const projectCard: ProjectCard = {
                element,
                expandBtn,
                isExpanded: false,
            };

            this.cards.set(cardId, projectCard);
            this.attachEventListeners(projectCard, cardHeader);
        });
    }

    private attachEventListeners(card: ProjectCard, header: HTMLElement): void {
        const toggleHandler = (event: Event) => {
            event.preventDefault();
            this.toggleCard(card);
        };

        header.addEventListener('click', toggleHandler);

        header.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleCard(card);
            }
        });

        if (!header.hasAttribute('tabindex')) {
            header.setAttribute('tabindex', '0');
        }
    }

    private toggleCard(card: ProjectCard): void {
        card.isExpanded = !card.isExpanded;

        if (card.isExpanded) {
            this.expandCard(card);
        } else {
            this.collapseCard(card);
        }

        card.expandBtn.setAttribute('aria-expanded', card.isExpanded.toString());
    }

    private expandCard(card: ProjectCard): void {
        card.element.classList.add(CONFIG.classes.expanded);

        this.announceChange(card, 'expanded');

        setTimeout(() => {
            this.ensureCardVisible(card);
        }, CONFIG.animationDuration / 2);
    }

    private collapseCard(card: ProjectCard): void {
        card.element.classList.remove(CONFIG.classes.expanded);

        this.announceChange(card, 'collapsed');
    }

    private ensureCardVisible(card: ProjectCard): void {
        const rect = card.element.getBoundingClientRect();
        const isPartiallyHidden = rect.bottom > window.innerHeight;

        if (isPartiallyHidden) {
            card.element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }

    private announceChange(card: ProjectCard, state: 'expanded' | 'collapsed'): void {
        const projectTitle = card.element.querySelector('.project-title')?.textContent;
        const announcement = `Project ${projectTitle} ${state}`;

        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.className = 'sr-only';
        liveRegion.textContent = announcement;

        document.body.appendChild(liveRegion);

        setTimeout(() => {
            document.body.removeChild(liveRegion);
        }, 1000);
    }

    public expandAll(): void {
        this.cards.forEach((card) => {
            if (!card.isExpanded) {
                this.toggleCard(card);
            }
        })
    }

    public collapseAll(): void {
        this.cards.forEach((card) => {
            if (card.isExpanded) {
                this.toggleCard(card);
            }
        })
    }

    public getCard(id: string): ProjectCard | undefined {
        return this.cards.get(id);
    }
}

function enhanceScollBehavior(): void {
    document.querySelectorAll('a[href^="#"').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(
                (anchor as HTMLAnchorElement).getAttribute('href') || ''
            );

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
}

function addScrollAnimations(): void {
    const observerOptions: IntersectionObserverInit = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
}

function logPerformanceMetrics(): void {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            console.group('Performance Metrics');
            console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
            console.log(`Page Load: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            console.groupEnd();
        });
    }
}

function initializeApp(): void {
    const cardManager = new ProjectCardManager();
    enhanceScollBehavior();

    if(process.env.NODE_ENV === 'development') {
        logPerformanceMetrics();
    }

    (window as any).cardManager = cardManager;
}

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

export {ProjectCardManager, CONFIG};