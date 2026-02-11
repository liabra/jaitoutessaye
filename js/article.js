/**
 * ARTICLE FUNCTIONALITY
 * J'ai tout essayé
 */

// ============================================
// SOCIAL SHARING
// ============================================

function shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.querySelector('.post-title').textContent);
    const text = encodeURIComponent(document.querySelector('.post-subtitle').textContent);

    let shareUrl;

    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
            break;
        default:
            return;
    }

    // Ouvrir dans une nouvelle fenêtre
    window.open(shareUrl, '_blank', 'width=600,height=400');

    // Track sharing (privacy-first analytics)
    if (window.offlineAnalytics) {
        window.offlineAnalytics.track('share', { platform, article: title });
    }
}

// ============================================
// COPY LINK
// ============================================

function copyLink() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('✅ Lien copié dans le presse-papier !');
        }).catch(err => {
            fallbackCopyLink(url);
        });
    } else {
        fallbackCopyLink(url);
    }
}

function fallbackCopyLink(url) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('✅ Lien copié !');
    } catch (err) {
        showNotification('❌ Erreur de copie');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--face-accent);
        color: var(--face-primary);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// READING PROGRESS BAR
// ============================================

class ReadingProgressBar {
    constructor() {
        this.createProgressBar();
        this.init();
    }

    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--pile-accent), var(--face-accent));
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(this.progressBar);
    }

    init() {
        window.addEventListener('scroll', () => this.updateProgress());
        this.updateProgress();
    }

    updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        
        this.progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
}

// ============================================
// TABLE OF CONTENTS (optional)
// ============================================

class TableOfContents {
    constructor() {
        this.headings = document.querySelectorAll('.post-content h2, .post-content h3');
        if (this.headings.length > 3) {
            this.createTOC();
        }
    }

    createTOC() {
        const toc = document.createElement('nav');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h4>📑 Table des matières</h4><ul></ul>';
        
        const list = toc.querySelector('ul');
        
        this.headings.forEach((heading, index) => {
            // Ajouter un ID au heading
            const id = `section-${index}`;
            heading.id = id;
            
            // Créer l'item de TOC
            const li = document.createElement('li');
            li.className = heading.tagName.toLowerCase();
            
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            
            li.appendChild(link);
            list.appendChild(li);
        });

        // Insérer avant le contenu
        const postContent = document.querySelector('.post-content');
        postContent.insertBefore(toc, postContent.firstChild);
        
        this.styleTOC(toc);
    }

    styleTOC(toc) {
        toc.style.cssText = `
            background: var(--pile-primary);
            border-radius: 12px;
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            border-left: 4px solid var(--pile-accent);
        `;

        const h4 = toc.querySelector('h4');
        h4.style.cssText = `
            font-family: var(--font-mono);
            color: var(--pile-accent);
            margin-bottom: var(--spacing-xs);
        `;

        const ul = toc.querySelector('ul');
        ul.style.cssText = `
            list-style: none;
            margin: 0;
            padding: 0;
        `;

        const links = toc.querySelectorAll('a');
        links.forEach(link => {
            link.style.cssText = `
                color: var(--pile-dark);
                text-decoration: none;
                display: block;
                padding: 0.5rem 0;
                transition: var(--transition-fast);
            `;
            
            link.addEventListener('mouseenter', () => {
                link.style.color = 'var(--pile-accent)';
                link.style.paddingLeft = '1rem';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.color = 'var(--pile-dark)';
                link.style.paddingLeft = '0';
            });
        });

        const h3Items = toc.querySelectorAll('.h3');
        h3Items.forEach(item => {
            item.style.paddingLeft = '1rem';
            item.style.fontSize = '0.9rem';
        });
    }
}

// ============================================
// HIGHLIGHT CODE BLOCKS
// ============================================

class CodeHighlighter {
    constructor() {
        this.codeBlocks = document.querySelectorAll('pre code');
        this.addCopyButtons();
    }

    addCopyButtons() {
        this.codeBlocks.forEach(block => {
            const wrapper = block.parentElement;
            
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.textContent = '📋 Copier';
            button.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: var(--face-accent);
                color: var(--face-primary);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-family: var(--font-mono);
                font-size: 0.8rem;
                cursor: pointer;
                transition: var(--transition-fast);
            `;

            wrapper.style.position = 'relative';
            wrapper.appendChild(button);

            button.addEventListener('click', () => {
                const code = block.textContent;
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(code).then(() => {
                        button.textContent = '✅ Copié !';
                        setTimeout(() => {
                            button.textContent = '📋 Copier';
                        }, 2000);
                    });
                }
            });

            button.addEventListener('mouseenter', () => {
                button.style.background = 'var(--face-accent-2)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = 'var(--face-accent)';
            });
        });
    }
}

// ============================================
// LAZY LOAD IMAGES
// ============================================

class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadWithObserver();
        } else {
            this.lazyLoadFallback();
        }
    }

    lazyLoadWithObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        this.images.forEach(img => observer.observe(img));
    }

    lazyLoadFallback() {
        this.images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ============================================
// READING TIME ESTIMATOR
// ============================================

function estimateReadingTime() {
    const content = document.querySelector('.post-content');
    if (!content) return;

    const text = content.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    const readingTimeElement = document.querySelector('.reading-time');
    if (readingTimeElement) {
        readingTimeElement.textContent = `⏱ ${minutes} min de lecture`;
    }
}

// ============================================
// BOOKMARK ARTICLE (Local Storage)
// ============================================

function toggleBookmark() {
    const url = window.location.href;
    const title = document.querySelector('.post-title').textContent;
    
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    const index = bookmarks.findIndex(b => b.url === url);
    
    if (index > -1) {
        // Remove bookmark
        bookmarks.splice(index, 1);
        showNotification('🗑️ Article retiré des favoris');
    } else {
        // Add bookmark
        bookmarks.push({
            url,
            title,
            date: new Date().toISOString()
        });
        showNotification('⭐ Article ajouté aux favoris');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// ============================================
// PRINT ARTICLE
// ============================================

function printArticle() {
    window.print();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    new ReadingProgressBar();
    new TableOfContents();
    new CodeHighlighter();
    new LazyImageLoader();
    
    // Estimate reading time
    estimateReadingTime();

    // Track article view (privacy-first)
    if (window.offlineAnalytics) {
        const title = document.querySelector('.post-title')?.textContent;
        window.offlineAnalytics.track('article_view', { title });
    }

    console.log('%c📖 Article chargé', 'font-size: 14px; color: #FF85A1;');
});

// Make functions globally available
window.shareArticle = shareArticle;
window.copyLink = copyLink;
window.toggleBookmark = toggleBookmark;
window.printArticle = printArticle;
