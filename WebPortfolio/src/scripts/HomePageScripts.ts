declare const bootstrap: any;

class BootstrapNavbar {

    navbar: HTMLElement;
    navLinks: NodeListOf<HTMLElement>;
    scrollThreshold: number;
    navbarCollapse: HTMLElement;

    constructor() {
        this.navbar = document.getElementById('mainNavbar')!;
        this.navLinks = document.querySelectorAll('.nav-link');
        this.scrollThreshold = 50;
        this.navbarCollapse = document.getElementById('navbarNav')!;

        this.init();
    }

    init() {
        this.setupScrollListener();
        this.setupNavLinks();
        this.setupMobileMenu();
    }

    setupScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if(!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        })
    }

    handleScroll() {
        const scrollPosition = window.scrollY;

        if(scrollPosition > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    setupNavLinks() {
        this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Smooth scroll for anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href) as HTMLElement | null;
                if(target) {
                    const navbarHeight = this.navbar.offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }

            // Update active class
            this.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Collapse mobile menu (only hide if menu is open)
            const bsCollapse = bootstrap.Collapse.getInstance(this.navbarCollapse);
            if(bsCollapse && this.navbarCollapse.classList.contains('show')) {
                bsCollapse.hide();
            }
        });
    });
    }

    setupMobileMenu() {
        this.navbarCollapse.addEventListener('show.bs.collapse', () => {
            if(window.innerWidth < 992) {
                document.body.style.overflow = 'hidden';
            }
        });

        this.navbarCollapse.addEventListener('hide.bs.collapse', () => {
            document.body.style.overflow = '';
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BootstrapNavbar();
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
},
{
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.2
});

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    observer.observe(el);
});


export {};