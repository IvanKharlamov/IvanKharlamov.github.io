// Common JS: Navigation, Translations, Utilities

document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeMobileMenu = document.getElementById('close-mobile-menu');

    function openMobileMenu() {
        if (mobileMenu) mobileMenu.classList.add('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
        if (menuToggle) menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenuFunc() {
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                closeMobileMenuFunc();
            } else {
                openMobileMenu();
            }
        });
    }

    if (closeMobileMenu) {
        closeMobileMenu.addEventListener('click', closeMobileMenuFunc);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenuFunc);
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenuFunc();
        });
    });

    // Mobile cart toggle
    const cartToggleMobile = document.getElementById('cart-toggle-mobile');
    if (cartToggleMobile) {
        cartToggleMobile.addEventListener('click', () => {
            if (window.cartUI) window.cartUI.open();
        });
    }

    // --- Translations ---
    const translations = { en: {}, es: {} };
    if (window.TRANSLATIONS_RAW) {
        Object.keys(window.TRANSLATIONS_RAW).forEach(key => {
            translations.en[key] = window.TRANSLATIONS_RAW[key].en;
            translations.es[key] = window.TRANSLATIONS_RAW[key].es;
        });
    }

    window.currentLang = localStorage.getItem('upstage_lang') || 'es';

    window.changeLanguage = function (lang) {
        if (!translations[lang]) return;
        window.currentLang = lang;
        localStorage.setItem('upstage_lang', lang);

        document.querySelectorAll('.lang-opt').forEach(el => {
            el.classList.toggle('active', el.dataset.lang === lang);
        });

        // Text Content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang][key]) {
                if (key === 'hero.title') {
                    el.innerHTML = translations[lang][key]; // Allow HTML for hero title breaks
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Select options
        document.querySelectorAll('option[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // If inventory page, re-render products to update empty message etc
        if (typeof window.renderProducts === 'function' && window.products) {
            // Re-apply filters which triggers render
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        }

        // CRITICAL: Trigger cart re-render to update dynamic content
        if (window.cartUI) {
            window.cartUI.render();
        }
    };

    document.querySelectorAll('.lang-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            window.changeLanguage(btn.dataset.lang);
        });
    });

    // Init Language
    window.changeLanguage(window.currentLang);

    // --- Toast Notification System ---
    window.showToast = function (message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = '';
        if (type === 'success') icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        else if (type === 'error') icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        else icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, 4000);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(toast);
        });

        function removeToast(el) {
            el.style.animation = 'fadeOutToast 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1)';
            el.addEventListener('animationend', () => {
                if (el.parentElement) el.parentElement.removeChild(el);
            });
        }
    };
});