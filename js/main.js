/**
 * J'AI TOUT ESSAYÉ - Main JavaScript
 * Interactivité et fonctionnalités du site
 */

// ============================================
// THEME TOGGLE
// ============================================

class ThemeManager {
    constructor() {
        this.toggle = document.querySelector('.theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.toggle?.addEventListener('click', () => this.switchTheme());
    }

    switchTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, var(--bg-dark) 0%, #1A1F3A 100%)';
            document.body.style.color = 'var(--text-dark)';
        } else {
            document.body.style.background = 'linear-gradient(135deg, var(--bg-light) 0%, #FFF5F8 100%)';
            document.body.style.color = 'var(--text-light)';
        }
    }
}

// ============================================
// ANIMATIONS ON SCROLL
// ============================================

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.article-card, .tip-card, .badge');
        this.init();
    }

    init() {
        this.createObserver();
    }

    createObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// ============================================
// TIPS CAROUSEL
// ============================================

class TipsCarousel {
    constructor() {
        this.carousel = document.querySelector('.tips-carousel');
        this.cards = document.querySelectorAll('.tip-card');
        this.currentIndex = 0;
        this.init();
    }

    init() {
        if (!this.carousel || this.cards.length === 0) return;
        
        // Auto-rotate tips on mobile
        if (window.innerWidth < 768) {
            setInterval(() => this.rotate(), 5000);
        }
    }

    rotate() {
        this.cards.forEach((card, index) => {
            card.style.opacity = index === this.currentIndex ? '1' : '0.5';
        });
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================

class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        } else {
            // Fallback pour navigateurs anciens
            this.lazyLoadFallback();
        }

        // Prefetch links
        this.prefetchLinks();
    }

    lazyLoadFallback() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    prefetchLinks() {
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = link.href;
                document.head.appendChild(prefetchLink);
            }, { once: true });
        });
    }
}

// ============================================
// COMMENTS SYSTEM (Privacy-First)
// ============================================

class CommentsSystem {
    constructor() {
        this.commentsContainer = document.querySelector('#comments');
        this.init();
    }

    init() {
        if (!this.commentsContainer) return;
        
        // Utiliser un système de commentaires respectueux de la vie privée
        // comme Isso, Commento ou un système statique avec Staticman
        this.loadComments();
    }

    loadComments() {
        // Placeholder pour le système de commentaires
        // À remplacer par l'intégration réelle
        console.log('Comments system ready');
    }

    postComment(data) {
        // Logique pour poster un commentaire
        // Stockage local ou via API backend minimal
    }
}

// ============================================
// OFFLINE NOTIFICATION
// ============================================

class OfflineNotification {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('online', () => this.showStatus('online'));
        window.addEventListener('offline', () => this.showStatus('offline'));
    }

    showStatus(status) {
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.textContent = status === 'online' 
            ? '✅ Connexion rétablie' 
            : '📱 Mode hors ligne activé';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${status === 'online' ? '#00FFC6' : '#FF006E'};
            color: #0A0E27;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ============================================
// ANALYTICS (Privacy-First)
// ============================================

class PrivacyAnalytics {
    constructor() {
        this.init();
    }

    init() {
        // Utiliser une solution respectueuse de la vie privée
        // comme Plausible, Fathom, ou Simple Analytics
        // Pas de Google Analytics ni cookies tiers
        this.trackPageView();
    }

    trackPageView() {
        // Placeholder pour analytics respectueux
        // Ne stocke que des données anonymes et agrégées
        console.log('Privacy-first analytics initialized');
    }

    trackEvent(eventName, properties = {}) {
        // Track custom events sans identifier les utilisateurs
        console.log(`Event: ${eventName}`, properties);
    }
}

// ============================================
// EASTER EGGS
// ============================================

class EasterEggs {
    constructor() {
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.konamiIndex = 0;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.activateKonami();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
            }
        });
    }

    activateKonami() {
        // Easter egg: mode pixel art
        document.body.style.imageRendering = 'pixelated';
        document.body.style.filter = 'contrast(1.2) saturate(1.3)';
        
        const message = document.createElement('div');
        message.textContent = '🎮 PIXEL MODE ACTIVATED! 🎮';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #00FFC6;
            color: #0A0E27;
            padding: 2rem 3rem;
            border-radius: 16px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 1.5rem;
            font-weight: 600;
            z-index: 10000;
            animation: pulse 1s ease-in-out;
            box-shadow: 0 0 40px rgba(0, 255, 198, 0.6);
        `;

        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
            setTimeout(() => {
                document.body.style.imageRendering = '';
                document.body.style.filter = '';
            }, 5000);
        }, 2000);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new ThemeManager();
    new ScrollAnimations();
    new TipsCarousel();
    new SmoothScroll();
    new PerformanceOptimizer();
    new CommentsSystem();
    new OfflineNotification();
    new PrivacyAnalytics();
    new EasterEggs();

    console.log('%c💝 J\'ai tout essayé 💻', 'font-size: 20px; font-weight: bold; color: #FF85A1;');
    console.log('%cMade with ❤️ by a coding mom', 'font-size: 12px; color: #00FFC6;');
});

// ============================================
// EXPORT FOR MODULES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        ScrollAnimations,
        TipsCarousel,
        SmoothScroll,
        PerformanceOptimizer
    };
}
