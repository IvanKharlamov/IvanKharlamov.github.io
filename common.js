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
                if (key === 'hero.title' || key.includes('modalText')) {
                    el.innerHTML = translations[lang][key]; // Allow HTML for hero title breaks and rich text modals
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
        }, 40000);

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
    const initSocialSharing = () => {
        const shareLinks = document.querySelectorAll('.share-link');
        if (shareLinks.length === 0) return;

        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);

        shareLinks.forEach(link => {
            if (link.classList.contains('facebook')) {
                link.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            } else if (link.classList.contains('x-twitter')) {
                link.href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            } else if (link.classList.contains('linkedin')) {
                link.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            } else if (link.classList.contains('whatsapp')) {
                link.href = `https://api.whatsapp.com/send?text=${text}%20${url}`;
            }
        });
    };

    initSocialSharing();
});
/* === MERGED FROM cart.js === */
let activeDatePicker = null;

function t(key) {
    const lang = window.currentLang || 'es';
    return window.TRANSLATIONS_RAW && window.TRANSLATIONS_RAW[key] ? window.TRANSLATIONS_RAW[key][lang] : key;
}

// --- DatePicker Class (Shared between Cart and Inventory) ---
class DatePicker {
    constructor(pickerElement) {
        this.picker = pickerElement;
        this.display = pickerElement.querySelector('.date-picker-display');
        this.calendar = pickerElement.querySelector('.calendar-content');
        this.daysGrid = pickerElement.querySelector('.calendar-days-grid');
        this.currentMonthDisplay = pickerElement.querySelector('.calendar-current-month');
        this.rangeText = pickerElement.querySelector('.date-range-text');

        this.currentDate = new Date();
        this.viewDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);

        this.startDate = null;
        this.endDate = null;
        this.onDateChange = null;
        
        // Save previous valid dates to restore if user cancels
        this.savedStartDate = null;
        this.savedEndDate = null;

        this.init();
    }

    init() {
        if (!this.picker || !this.display || !this.calendar) return;

        const prevBtn = this.calendar.querySelector('.calendar-nav-btn:first-child');
        const nextBtn = this.calendar.querySelector('.calendar-nav-btn:last-child');

        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeMonth(-1);
        });
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeMonth(1);
        });


		this.display.addEventListener('click', (e) => {
			e.stopPropagation();

			const wasActive = this.picker.classList.contains('active');

			if (activeDatePicker && activeDatePicker !== this)
				activeDatePicker.picker.classList.remove('active');

			if (wasActive) {
				this.picker.classList.remove('active');
				activeDatePicker = null;
				return;
			}

			this.picker.classList.add('active');
			activeDatePicker = this;

			if (this.startDate && this.endDate) {
				this.savedStartDate = this.startDate;
				this.savedEndDate = this.endDate;
			}

			e.stopImmediatePropagation();
		});


        document.addEventListener('click', (e) => {
            if (this.picker && !this.picker.contains(e.target) && this.picker.classList.contains('active')) {
                if (this.startDate && !this.endDate && this.savedStartDate && this.savedEndDate) {
                    this.startDate = this.savedStartDate;
                    this.endDate = this.savedEndDate;
                    this.updateDisplay();
                    this.render();
                }
                this.picker.classList.remove('active');
				activeDatePicker = null;
            }
        });

        this.render();
    }

    changeMonth(offset) {
        this.viewDate.setMonth(this.viewDate.getMonth() + offset);
        this.render();
    }

    render() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const currentLang = window.currentLang || 'es';

        const monthNames = window.TRANSLATIONS_RAW["calendar.months"][currentLang];
        this.currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

        const dayHeaders = this.calendar.querySelectorAll('.calendar-grid-header span');
        const dayNames = window.TRANSLATIONS_RAW["calendar.days"][currentLang];
        dayHeaders.forEach((header, i) => {
            if (dayNames && dayNames[i]) {
                header.textContent = dayNames[i];
            }
        });

        this.daysGrid.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDay = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < startingDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            this.daysGrid.appendChild(empty);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            if (date < today) {
                dayEl.classList.add('disabled');
            } else {
                dayEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectDate(new Date(date));
                });
            }

            if (date.getTime() === today.getTime()) {
                dayEl.classList.add('today');
            }

            this.updateDayStyling(dayEl, date);
            this.daysGrid.appendChild(dayEl);
        }
    }

    updateDayStyling(el, date) {
        const time = date.getTime();
        if (this.startDate && time === this.startDate.getTime()) {
            el.classList.add('selected', 'range-start');
        }
        if (this.endDate && time === this.endDate.getTime()) {
            el.classList.add('selected', 'range-end');
        }
        if (this.startDate && this.endDate && time > this.startDate.getTime() && time < this.endDate.getTime()) {
            el.classList.add('range');
        }
    }

    selectDate(date) {
        if (!this.startDate || (this.startDate && this.endDate)) {
            this.startDate = date;
            this.endDate = null;
        } else if (date < this.startDate) {
            this.startDate = date;
        } else if (date.getTime() === this.startDate.getTime()) {
            this.startDate = null;
        } else {
            this.endDate = date;
            // Clear saved dates since we have a new complete selection
            this.savedStartDate = this.startDate;
            this.savedEndDate = this.endDate;
			this.picker.classList.remove('active');
			activeDatePicker = null;
        }

        this.updateDisplay();
        this.render();
        
        if (this.onDateChange && typeof this.onDateChange === 'function') {
            this.onDateChange(this.getDates());
        }
    }

    updateDisplay() {
        const currentLang = window.currentLang || 'es';
        const locale = currentLang === 'es' ? 'es-ES' : 'en-GB';
        const options = { day: 'numeric', month: 'short' };
        const selectText = t('pricing.selectDates');

        if (this.startDate && this.endDate) {
            this.rangeText.textContent = `${this.startDate.toLocaleDateString(locale, options)} - ${this.endDate.toLocaleDateString(locale, options)}`;
            this.rangeText.classList.add('has-dates');
        } else if (this.startDate) {
            this.rangeText.textContent = `${this.startDate.toLocaleDateString(locale, options)} - ...`;
            this.rangeText.classList.add('has-dates');
        } else {
            this.rangeText.textContent = selectText;
            this.rangeText.classList.remove('has-dates');
        }
    }

    reset() {
        this.startDate = null;
        this.endDate = null;
        this.viewDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        this.updateDisplay();
        this.render();
    }

    getDates() {
        return {
            start: this.startDate ? this.startDate.toISOString().split('T')[0] : null,
            end: this.endDate ? this.endDate.toISOString().split('T')[0] : null
        };
    }
}

// Export DatePicker globally so inventory.js can use it
window.DatePicker = DatePicker;

// --- CartManager Class ---
class CartManager {
    constructor() {
        this.storageKey = 'upstage_cart';
        this.cart = this.loadCart();
        this.listeners = [];
    }

    loadCart() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    addItem(item) {
        if (!item.productId || !item.start || !item.end || !item.days) {
            console.error('Invalid cart item:', item);
            return false;
        }

		this.cart.push({
			productId: item.productId,
			start: item.start,
			end: item.end,
			days: item.days,
			multiplier: item.multiplier || 0,
			quantity: item.quantity || 1,
			basePrice: item.basePrice || 0,
			totalPrice: item.totalPrice || 0,
			isCustom: item.isCustom || false,
			addedAt: new Date().toISOString()
		});

        this.saveCart();
        return true;
    }

    updateQuantity(index, change) {
        if (!this.cart[index]) return false;

        const item = this.cart[index];
        item.quantity += change;

        if (item.quantity < 1) {
            item.quantity = 1;
            return false;
        }

        if (!item.isCustom && window.products) {
            const product = window.products.find(p => p.id === item.productId);
            if (product) {
				item.basePrice = product.priceDay * item.days * item.quantity;
				item.totalPrice = product.priceDay * item.multiplier * item.quantity;
            }
        }

        this.saveCart();
        return true;
    }

    updateDates(index, startDate, endDate) {
        if (!this.cart[index]) return false;

        const item = this.cart[index];
        item.start = startDate;
        item.end = endDate;

        if (item.start && item.end) {
            const start = new Date(item.start);
            const end = new Date(item.end);

            if (end < start) {
                return false;
            }

            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            item.days = diffDays;
            item.isCustom = diffDays > 7;

            if (!item.isCustom && window.products) {
                item.multiplier = this.getRentalMultiplier(diffDays);
                const product = window.products.find(p => p.id === item.productId);
                if (product) {
					item.basePrice = product.priceDay * item.days * item.quantity;
					item.totalPrice = product.priceDay * item.multiplier * item.quantity;
				}
            } else {
                item.totalPrice = 0;
            }
        }

        this.saveCart();
        return true;
    }

    removeItem(index) {
        if (this.cart[index]) {
            this.cart.splice(index, 1);
            this.saveCart();
            return true;
        }
        return false;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getItems() {
        return [...this.cart];
    }

    getCount() {
        return this.cart.reduce((acc, item) => acc + item.quantity, 0);
    }

    getTotal() {
        return this.cart.reduce((acc, item) => {
            return acc + (item.isCustom ? 0 : item.totalPrice);
        }, 0);
    }

    hasCustomItems() {
        return this.cart.some(item => item.isCustom);
    }

    getRentalMultiplier(days) {
        if (days === 0) return 0;
        if (days === 7) return 3;

        let multiplier = 1;
        multiplier += 0.5 * Math.min(Math.max(days - 1, 0), 3);
        multiplier += 0.25 * Math.min(Math.max(days - 4, 0), 2);

        return multiplier;
    }
}

window.cartManager = new CartManager();

// Cart UI Controller
class CartUI {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.drawer = null;
        this.overlay = null;
        this.itemsContainer = null;
        this.totalElement = null;
        this.countElement = null;
        this.datePickers = {};
        this.init();
    }

    init() {
        this.drawer = document.getElementById('cart-drawer');
        this.overlay = document.getElementById('cart-overlay');
        this.itemsContainer = document.getElementById('cart-items');
        this.totalElement = document.getElementById('cart-total-price');
        this.countElement = document.getElementById('cart-count');

        this.cartManager.subscribe(() => this.render());

        const cartToggle = document.getElementById('cart-toggle');
        const closeCart = document.getElementById('close-cart');

        if (cartToggle) cartToggle.addEventListener('click', () => this.open());
        if (closeCart) closeCart.addEventListener('click', () => this.close());
        if (this.overlay) this.overlay.addEventListener('click', () => this.close());

        this.render();
    }

    open() {
        if (this.drawer) this.drawer.classList.add('active');
        if (this.overlay) this.overlay.classList.add('active');
    }

    close() {
        if (this.drawer) this.drawer.classList.remove('active');
        if (this.overlay) this.overlay.classList.remove('active');
    }

    render() {
        // Update count badge
        if (this.countElement) {
            const count = this.cartManager.getCount();
            this.countElement.textContent = count;
            this.countElement.style.display = count > 0 ? 'block' : 'none';
        }

        // Update total
        if (this.totalElement) {
            const total = this.cartManager.getTotal();
            const hasCustom = this.cartManager.hasCustomItems();
            this.totalElement.textContent = hasCustom 
                ? `€${total.toLocaleString()} + ${t('cart.customRate')}`
                : `€${total.toLocaleString()}`;
        }

        // Render items
        if (!this.itemsContainer) return;

        const items = this.cartManager.getItems();
        const currentLang = window.currentLang || 'es';

        if (items.length === 0) {
            const isOnCatalog = window.location.pathname.includes('inventory');
            const browseButton = isOnCatalog ? '' : `<a href="inventory" class="btn btn-primary" style="margin-top: 20px;">${t('hero.browse')}</a>`;
            this.itemsContainer.innerHTML = `
                <div class="empty-cart-msg" style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <p style="margin-bottom: 0;">${t('cart.empty')}</p>
                    ${browseButton}
                </div>
            `;
            return;
        }

        this.itemsContainer.innerHTML = items.map((item, index) => {
            const product = window.products ? window.products.find(p => p.id === item.productId) : null;
            
            if (!product) {
                return '';
            }

            const displayName = product.name[currentLang] || product.name.en;
			const priceDisplay = item.isCustom
				? `<span style="color: var(--accent);">${t('cart.customRate')}</span>`
				: `
					<span class="price-base">€${item.basePrice.toLocaleString()}</span>
					<span class="price-final">€${item.totalPrice.toLocaleString()}</span>
				  `;

            const locale = currentLang === 'es' ? 'es-ES' : 'en-GB';
            const options = { day: 'numeric', month: 'short' };
            const dateDisplay = `${new Date(item.start).toLocaleDateString(locale, options)} - ${new Date(item.end).toLocaleDateString(locale, options)}`;

            return `
                <div class="cart-item glass-card" style="padding: 10px; margin-bottom: 10px; display: flex; gap: 10px;">
                    <img src="${product.image}" style="width: 50px; height: 50px; object-fit: contain; background: #000; border-radius: 4px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 0.9rem;">${displayName}</div>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
                            <div class="cart-qty-controls">
                                <button class="cart-qty-btn" onclick="window.cartUI.updateQuantity(${index}, -1)">-</button>
                                <input type="number" class="cart-qty-input" value="${item.quantity}" readonly>
                                <button class="cart-qty-btn" onclick="window.cartUI.updateQuantity(${index}, 1)">+</button>
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${item.days} ${t('cart.days')}</div>
                        </div>

                        <!-- Single-element date picker for cart -->
                        <div class="date-picker cart-date-picker-${index}" style="margin-top: 6px;" data-cart-index="${index}">
                            <div class="date-picker-display">
                                <span class="date-range-text has-dates">${dateDisplay}</span>
                                <div class="picker-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                            </div>
                            <div class="calendar-content">
                                <div class="calendar-nav">
                                    <button type="button" class="calendar-nav-btn">&lt;</button>
                                    <div class="calendar-current-month">Enero 2026</div>
                                    <button type="button" class="calendar-nav-btn">&gt;</button>
                                </div>
                                <div class="calendar-grid-header">
                                    <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
                                </div>
                                <div class="calendar-days-grid">
                                    <!-- Days injected by JS -->
                                </div>
                            </div>
                        </div>

                        <div style="font-weight: 700; color: var(--secondary); margin-top: 4px;">${priceDisplay}</div>
                    </div>
                    <button onclick="window.cartUI.removeItem(${index})" class="remove-cart-item" 
                        style="width: 24px; height: 24px; font-size: 1.2rem;">&times;</button>
                </div>
            `;
        }).join('');

        // Initialize date pickers for each cart item
        this.initializeDatePickers();
    }

    initializeDatePickers() {
        setTimeout(() => {
            const items = this.cartManager.getItems();
            items.forEach((item, index) => {
                const pickerElement = document.querySelector(`.cart-date-picker-${index}`);
                if (pickerElement && window.DatePicker) {
                    const picker = new window.DatePicker(pickerElement);
                    
                    if (item.start && item.end) {
                        picker.startDate = new Date(item.start);
                        picker.endDate = new Date(item.end);
                        picker.updateDisplay();
                        picker.render();
                    }
                    
                    picker.onDateChange = (dates) => {
                        if (dates.start && dates.end) {
                            if (!this.cartManager.updateDates(index, dates.start, dates.end)) {
                                if (window.showToast) {
                                    window.showToast(t('toast.invalidDates'), "error");
                                }
                            }
                        }
                    };
                    
                    this.datePickers[`item-${index}`] = picker;
                }
            });
        }, 0);
    }

    updateQuantity(index, change) {
        if (!this.cartManager.updateQuantity(index, change) && change < 0) {
            return;
        }
    }

    removeItem(index) {
        this.cartManager.removeItem(index);
        if (window.showToast) {
            window.showToast(t('toast.itemRemoved'), "info");
        }
    }
}

// Initialize Cart UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-drawer')) {
        window.cartUI = new CartUI(window.cartManager);
    }
});

window.CartManager = CartManager;
window.CartUI = CartUI;
/* === MERGED FROM quote-forms.js === */
// quote-forms.js - Quote request functionality with Web3Forms integration

class QuoteFormsManager {
    constructor() {
        this.accessKey = '0e309e67-18f7-478b-b192-bc8eaa8db5cd';
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupHeaderQuoteButton();
        this.setupCartQuoteButton();
        this.setupContactForm();
    }

    t(key) {
        const lang = window.currentLang || 'es';
        return window.TRANSLATIONS_RAW && window.TRANSLATIONS_RAW[key] 
            ? window.TRANSLATIONS_RAW[key][lang] 
            : key;
    }

    // Validation functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateSpanishPhone(phone) {
        // Spanish phone format: +34 XXX XXX XXX or similar patterns
        const cleaned = phone.replace(/\s+/g, '');
        const re = /^(\+34|0034|34)?[6789]\d{8}$/;
        return re.test(cleaned);
    }

    formatCartItems(items) {
        if (!items || items.length === 0) return '';

        const currentLang = window.currentLang || 'es';
        const locale = currentLang === 'es' ? 'es-ES' : 'en-GB';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };

        let text = '\n\n=== QUOTE ITEMS ===\n\n';

        items.forEach((item, index) => {
            const product = window.products.find(p => p.id === item.productId);
            if (!product) return;

            const displayName = product.name[currentLang] || product.name.en;
            const startDate = new Date(item.start).toLocaleDateString(locale, options);
            const endDate = new Date(item.end).toLocaleDateString(locale, options);

            text += `${index + 1}. ${displayName}\n`;
            text += `   Dates: ${startDate} - ${endDate} (${item.days} days)\n`;
            text += `   Quantity: ${item.quantity}\n`;
            
            if (item.isCustom) {
                text += `   Price: Custom Rate Required\n`;
            } else {
                text += `   Base Price: €${item.basePrice.toLocaleString()}\n`;
                text += `   Discounted Price: €${item.totalPrice.toLocaleString()}\n`;
            }
            text += '\n';
        });

        const total = window.cartManager.getTotal();
        const hasCustom = window.cartManager.hasCustomItems();
        
        text += `ESTIMATED TOTAL: €${total.toLocaleString()}`;
        if (hasCustom) text += ' + Custom Rate Items';
        text += '\n';

        return text;
    }

    // Show success message
    showSuccess() {
        const modal = document.getElementById('quote-success-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Auto close after 5 seconds
            setTimeout(() => {
                modal.classList.remove('active');
            }, 5000);
        }
    }

    // Show error message
    showError(errorMessage = null) {
        if (window.showToast) {
            const msg = errorMessage || this.t('quote.error.message');
            window.showToast(msg, 'error');
        }
    }

    // Setup header "Get Quote" button
    setupHeaderQuoteButton() {
        const headerQuoteBtns = document.querySelectorAll('.btn-primary[data-i18n="btn.getQuote"]');
        headerQuoteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openGeneralQuoteModal();
            });
        });
    }

    // Setup cart "Request Quote" button
    setupCartQuoteButton() {
        const cartQuoteBtn = document.getElementById('btn-request-quote');
        if (cartQuoteBtn) {
            cartQuoteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCartQuoteModal();
            });
        }
    }

    // Setup contact form
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmit(contactForm);
            });
        }
    }

    // Open general quote modal (from header button)
    openGeneralQuoteModal() {
        const modal = document.getElementById('general-quote-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Open cart quote modal
    openCartQuoteModal() {
        if (window.cartManager.getCount() === 0) {
            if (window.showToast) {
                window.showToast(this.t('toast.emptyQuote'), 'error');
            }
            return;
        }

        if (window.cartUI) window.cartUI.close();
        
        const modal = document.getElementById('cart-quote-modal');
        if (modal) {
            // Update cart items display
            this.renderCartItemsSummary();
            modal.classList.add('active');
        }
    }

    // Render cart items in quote modal
    renderCartItemsSummary() {
        const container = document.getElementById('quote-cart-items-summary');
        if (!container) return;

        const items = window.cartManager.getItems();
        const currentLang = window.currentLang || 'es';
        const locale = currentLang === 'es' ? 'es-ES' : 'en-GB';
        const options = { day: 'numeric', month: 'short' };

        if (items.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">${this.t('cart.empty')}</p>`;
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <th style="text-align: left; padding: 10px; font-size: 0.85rem; color: var(--text-muted);">${this.t('quote.cart.item')}</th>
                        <th style="text-align: center; padding: 10px; font-size: 0.85rem; color: var(--text-muted);">${this.t('quote.cart.dates')}</th>
                        <th style="text-align: right; padding: 10px; font-size: 0.85rem; color: var(--text-muted);">${this.t('quote.cart.price')}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach(item => {
            const product = window.products.find(p => p.id === item.productId);
            if (!product) return;

            const displayName = product.name[currentLang] || product.name.en;
            const startDate = new Date(item.start).toLocaleDateString(locale, options);
            const endDate = new Date(item.end).toLocaleDateString(locale, options);

            const priceDisplay = item.isCustom
                ? `<span style="color: var(--accent); font-size: 0.85rem;">${this.t('cart.customRate')}</span>`
                : `€${item.totalPrice.toLocaleString()}`;

            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 15px 0;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${product.image}" alt="${displayName}" style="width: 40px; height: 40px; object-fit: contain; background: #000; border-radius: 4px;">
                            <span style="font-size: 0.9rem;"><b>${displayName}</b> &times; ${item.quantity}</span>
                        </div>
                    </td>
                    <td style="padding: 15px 0; text-align: center; font-size: 0.85rem;">
                        ${startDate} → ${endDate}
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${item.days} ${this.t('cart.days')}</div>
                    </td>
                    <td style="padding: 15px 0; text-align: right; font-weight: 600; color: var(--secondary);">${priceDisplay}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid var(--glass-border);">
                        <td colspan="2" style="padding: 15px 10px; font-weight: 600; text-align: right;">${this.t('cart.estimatedTotal')}</td>
                        <td style="padding: 15px 10px; text-align: right; font-size: 1.2rem; font-weight: 700; color: var(--secondary);">
        `;

        const total = window.cartManager.getTotal();
        const hasCustom = window.cartManager.hasCustomItems();
        
        if (hasCustom) {
            html += `€${total.toLocaleString()} + ${this.t('cart.customRate')}`;
        } else {
            html += `€${total.toLocaleString()}`;
        }

        html += `
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;

        container.innerHTML = html;
    }

    // Handle contact form submission
    async handleContactFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const fullName = form.querySelector('#contact-name').value;
        const phone = form.querySelector('#contact-phone').value;
        const email = form.querySelector('#contact-email').value;
        const organization = form.querySelector('#contact-org').value;
        const project = form.querySelector('#contact-project').value;
        const message = form.querySelector('#contact-message').value;

        // Validation
        if (!this.validateEmail(email)) {
            this.showError(this.t('quote.validation.email'));
            return;
        }

        if (!this.validateSpanishPhone(phone)) {
            this.showError(this.t('quote.validation.phone'));
            return;
        }

        const formData = new FormData();
        formData.append('access_key', this.accessKey);
        formData.append('subject', 'Contact Form - UPSTAGE MADRID');
        formData.append('name', fullName);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('organization', organization);
        formData.append('project', project);
        formData.append('message', message);

        submitBtn.textContent = this.t('quote.form.sending');
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.showSuccess();
                form.reset();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showError();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle general quote form submission
    async handleGeneralQuoteSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const fullName = form.querySelector('#general-quote-name').value;
        const phone = form.querySelector('#general-quote-phone').value;
        const email = form.querySelector('#general-quote-email').value;
        const organization = form.querySelector('#general-quote-org').value;
        const project = form.querySelector('#general-quote-project').value;
        const message = form.querySelector('#general-quote-message').value;

        // Validation
        if (!this.validateEmail(email)) {
            this.showError(this.t('quote.validation.email'));
            return;
        }

        if (!this.validateSpanishPhone(phone)) {
            this.showError(this.t('quote.validation.phone'));
            return;
        }

        const formData = new FormData();
        formData.append('access_key', this.accessKey);
        formData.append('subject', 'General Quote Request - UPSTAGE MADRID');
        formData.append('name', fullName);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('organization', organization);
        formData.append('project', project);
        formData.append('message', message);

        submitBtn.textContent = this.t('quote.form.sending');
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.closeGeneralQuoteModal();
                this.showSuccess();
                form.reset();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('General quote error:', error);
            this.showError();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle cart quote form submission
    async handleCartQuoteSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const fullName = form.querySelector('#cart-quote-name').value;
        const phone = form.querySelector('#cart-quote-phone').value;
        const email = form.querySelector('#cart-quote-email').value;
        const organization = form.querySelector('#cart-quote-org').value;
        const project = form.querySelector('#cart-quote-project').value;
        const additionalInfo = form.querySelector('#cart-quote-additional').value;

        // Validation
        if (!this.validateEmail(email)) {
            this.showError(this.t('quote.validation.email'));
            return;
        }

        if (!this.validateSpanishPhone(phone)) {
            this.showError(this.t('quote.validation.phone'));
            return;
        }

        const cartItems = window.cartManager.getItems();
        const cartItemsText = this.formatCartItems(cartItems);

        const fullMessage = additionalInfo 
            ? `${additionalInfo}\n${cartItemsText}` 
            : cartItemsText;

        const formData = new FormData();
        formData.append('access_key', this.accessKey);
        formData.append('subject', 'Cart Quote Request - Upstage Rentals');
        formData.append('name', fullName);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('organization', organization);
        formData.append('project', project);
        formData.append('message', fullMessage);

        submitBtn.textContent = this.t('quote.form.sending');
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.closeCartQuoteModal();
                this.showSuccess();
                window.cartManager.clearCart();
                form.reset();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('Cart quote error:', error);
            this.showError();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    closeGeneralQuoteModal() {
        const modal = document.getElementById('general-quote-modal');
        if (modal) modal.classList.remove('active');
    }

    closeCartQuoteModal() {
        const modal = document.getElementById('cart-quote-modal');
        if (modal) modal.classList.remove('active');
    }

    closeSuccessModal() {
        const modal = document.getElementById('quote-success-modal');
        if (modal) modal.classList.remove('active');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.quoteFormsManager = new QuoteFormsManager();

    // Setup form submit handlers
    const generalQuoteForm = document.getElementById('general-quote-form');
    if (generalQuoteForm) {
        generalQuoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.quoteFormsManager.handleGeneralQuoteSubmit(generalQuoteForm);
        });
    }

    const cartQuoteForm = document.getElementById('cart-quote-form');
    if (cartQuoteForm) {
        cartQuoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.quoteFormsManager.handleCartQuoteSubmit(cartQuoteForm);
        });
    }

    // Setup close buttons
    const closeGeneralQuote = document.getElementById('close-general-quote');
    if (closeGeneralQuote) {
        closeGeneralQuote.addEventListener('click', () => {
            window.quoteFormsManager.closeGeneralQuoteModal();
        });
    }

    const cancelGeneralQuote = document.getElementById('cancel-general-quote');
    if (cancelGeneralQuote) {
        cancelGeneralQuote.addEventListener('click', () => {
            window.quoteFormsManager.closeGeneralQuoteModal();
        });
    }

    const closeCartQuote = document.getElementById('close-cart-quote');
    if (closeCartQuote) {
        closeCartQuote.addEventListener('click', () => {
            window.quoteFormsManager.closeCartQuoteModal();
        });
    }

    const cancelCartQuote = document.getElementById('cancel-cart-quote');
    if (cancelCartQuote) {
        cancelCartQuote.addEventListener('click', () => {
            window.quoteFormsManager.closeCartQuoteModal();
        });
    }

    const closeSuccess = document.getElementById('close-success-modal');
    if (closeSuccess) {
        closeSuccess.addEventListener('click', () => {
            window.quoteFormsManager.closeSuccessModal();
        });
    }

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
});