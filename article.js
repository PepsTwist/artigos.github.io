// Funcionalidades para Artigos Individuais - Aventuras de Guto

class ArticleManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTableOfContents();
        this.setupSmoothScroll();
        this.setupReadingProgress();
        this.setupSocialShare();
        this.setupImageLightbox();
    }
    
    setupTableOfContents() {
        const tocLinks = document.querySelectorAll('.toc-list a');
        const sections = document.querySelectorAll('section[id]');
        
        // Highlight current section in TOC
        const observerOptions = {
            rootMargin: '-20% 0px -80% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const tocLink = document.querySelector(`.toc-list a[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    tocLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current link
                    if (tocLink) {
                        tocLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    setupSmoothScroll() {
        const tocLinks = document.querySelectorAll('.toc-list a[href^="#"]');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupReadingProgress() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
        document.body.appendChild(progressBar);
        
        // Add CSS for progress bar
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(255, 107, 53, 0.2);
                z-index: 9999;
            }
            .reading-progress-bar {
                height: 100%;
                background: #ff6b35;
                width: 0%;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
        
        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const article = document.querySelector('.article-text');
            if (!article) return;
            
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;
            
            const progress = Math.min(
                Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
                1
            );
            
            document.querySelector('.reading-progress-bar').style.width = `${progress * 100}%`;
        });
    }
    
    setupSocialShare() {
        // Create floating share buttons
        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-floating';
        shareContainer.innerHTML = `
            <div class="share-btn" data-platform="facebook" title="Compartilhar no Facebook">
                <span>f</span>
            </div>
            <div class="share-btn" data-platform="twitter" title="Compartilhar no Twitter">
                <span>t</span>
            </div>
            <div class="share-btn" data-platform="whatsapp" title="Compartilhar no WhatsApp">
                <span>w</span>
            </div>
            <div class="share-btn" data-platform="copy" title="Copiar link">
                <span>🔗</span>
            </div>
        `;
        
        // Add CSS for floating share buttons
        const shareStyle = document.createElement('style');
        shareStyle.textContent = `
            .social-share-floating {
                position: fixed;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 1000;
            }
            .share-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #ff6b35;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
                font-size: 18px;
            }
            .share-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
            }
            @media (max-width: 1024px) {
                .social-share-floating {
                    display: none;
                }
            }
        `;
        document.head.appendChild(shareStyle);
        document.body.appendChild(shareContainer);
        
        // Add click handlers
        shareContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.share-btn');
            if (!btn) return;
            
            const platform = btn.dataset.platform;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            switch (platform) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
                    break;
                case 'whatsapp':
                    window.open(`https://wa.me/?text=${title} ${url}`, '_blank');
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        this.showCopySuccess(btn);
                    });
                    break;
            }
        });
    }
    
    showCopySuccess(btn) {
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span>✓</span>';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.background = '#ff6b35';
        }, 2000);
    }
    
    setupImageLightbox() {
        const images = document.querySelectorAll('.article-text img, .article-hero-image img');
        
        images.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                this.openLightbox(img.src, img.alt);
            });
        });
    }
    
    openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay">
                <div class="lightbox-content">
                    <img src="${src}" alt="${alt}">
                    <button class="lightbox-close">&times;</button>
                </div>
            </div>
        `;
        
        // Add CSS for lightbox
        const lightboxStyle = document.createElement('style');
        lightboxStyle.textContent = `
            .image-lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .lightbox-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            .lightbox-content img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 10px;
            }
            .lightbox-close {
                position: absolute;
                top: -40px;
                right: -40px;
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .lightbox-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        `;
        
        if (!document.querySelector('.lightbox-styles')) {
            lightboxStyle.className = 'lightbox-styles';
            document.head.appendChild(lightboxStyle);
        }
        
        document.body.appendChild(lightbox);
        
        // Close lightbox handlers
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) {
                document.body.removeChild(lightbox);
            }
        });
        
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        
        // Close with Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(lightbox);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArticleManager();
});

// Add estimated reading time calculation
document.addEventListener('DOMContentLoaded', () => {
    const articleText = document.querySelector('.article-text');
    if (articleText) {
        const wordCount = articleText.textContent.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
        
        const readTimeElements = document.querySelectorAll('.read-time');
        readTimeElements.forEach(element => {
            element.textContent = `${readingTime} min de leitura`;
        });
    }
});

// Smooth scroll for all internal links
document.addEventListener('DOMContentLoaded', () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

