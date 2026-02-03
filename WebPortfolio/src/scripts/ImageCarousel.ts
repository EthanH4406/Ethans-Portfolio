export class ImageCarousel {
    private images: string[];
    private projectTitle: string;
    private element: HTMLElement;
    private currentIndex: number = 0;
    private autoplayInterval: number | null = null;

    constructor(images: string[], projectTitle: string) {
        this.images = images;
        this.projectTitle = projectTitle;
        this.element = document.createElement('div');
    }


    render(): HTMLElement {
        this.element.className = 'image-carousel';
        this.element.innerHTML = `
            <div class="carousel-track">
                ${this.images.map((image, index) => `
                <div
                    class="carousel-slide ${index === 0 ? 'active' : ''}"
                    data-index="${index}"
                    style="background-image: url('${image}')"
                ></div>
            `).join('')}

            </div>
            
            ${this.images.length > 1 ? `
                <button class="carousel-btn carousel-prev" aria-label="Previous image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="carousel-btn carousel-next" aria-label="Next image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                
                <div class="carousel-indicators">
                    ${this.images.map((_, index) => `
                        <button class="carousel-indicator ${index === 0 ? 'active' : ''}"
                            data-index="${index}"
                            aria-label="Go to image ${index + 1}"></button>
                    `).join('')}
                </div>
                ` : ''}
        `;

        this.setupEventListeners();
        if (this.images.length > 1) {
            this.startAutoplay();
        }

        return this.element;
    }

    private setupEventListeners(): void {
        const prevBtn = this.element.querySelector('.carousel-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        const nextBtn = this.element.querySelector('.carousel-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        const indicators = this.element.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goTo(index));
        });

        this.element.addEventListener('mouseenter', () => this.stopAutoplay());
        this.element.addEventListener('mouseleave', () => this.startAutoplay());

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previous();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    }

    private next(): void {
        this.goTo((this.currentIndex + 1) % this.images.length);
    }

    private previous(): void {
        this.goTo((this.currentIndex - 1 + this.images.length) % this.images.length);
    }

    private goTo(index: number): void {
        if (index === this.currentIndex) return;

        const slides = this.element.querySelectorAll('.carousel-slide');
        const indicators = this.element.querySelectorAll('.carousel-indicator');

        slides[this.currentIndex]?.classList.remove('active');
        indicators[this.currentIndex]?.classList.remove('active');

        slides[index]?.classList.add('active');
        indicators[index]?.classList.add('active');

        this.currentIndex = index;
    }

    private startAutoplay(): void {
        if (this.autoplayInterval !== null || this.images.length <= 1) return;

        this.autoplayInterval = window.setInterval(() => {
            this.next();
        }, 5000);
    }

    private stopAutoplay(): void {
        if (this.autoplayInterval !== null) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    destroy(): void {
        this.stopAutoplay();
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}