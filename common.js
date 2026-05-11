document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    const menuToggle = document.getElementById('menu-toggle'),
          mobileMenu = document.getElementById('mobile-menu'),
          mobileMenuOverlay = document.getElementById('mobile-menu-overlay'),
          closeMobileMenu = document.getElementById('close-mobile-menu');
    const setMenuState = (active) => {
        [mobileMenu, mobileMenuOverlay, menuToggle].forEach(el => el?.classList.toggle('active', active));
        document.body.style.overflow = active ? 'hidden' : '';
    };
    menuToggle.addEventListener('click', () => setMenuState(!mobileMenu?.classList.contains('active')));
    closeMobileMenu.addEventListener('click', () => setMenuState(false));
    mobileMenuOverlay.addEventListener('click', () => setMenuState(false));
    document.querySelectorAll('.mobile-nav-link').forEach(link => link.addEventListener('click', () => setMenuState(false)));

    const cartToggleMobile = document.getElementById('cart-toggle-mobile');
    if (cartToggleMobile) {
        cartToggleMobile.addEventListener('click', () => {
            if (window.cartUI) window.cartUI.open();
        });
    }
    const translations = { en: {}, es: {} };
    if (window.TRANSLATIONS_RAW) {
        Object.entries(window.TRANSLATIONS_RAW).forEach(([key, val]) => {
            translations.en[key] = val.en;
            translations.es[key] = val.es;
        });
    }
    window.currentLang = localStorage.getItem('upstage_lang') || 'es';
    window.changeLanguage = (lang) => {
        if (!translations[lang]) return;
        window.currentLang = lang;
        localStorage.setItem('upstage_lang', lang);
        document.querySelectorAll('.lang-opt').forEach(el => el.classList.toggle('active', el.dataset.lang === lang));
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n, val = translations[lang][key];
            if (val) el[key === 'hero.title' || key.includes('modalText') ? 'innerHTML' : 'textContent'] = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = translations[lang][el.dataset.i18nPlaceholder]);
        document.querySelectorAll('option[data-i18n]').forEach(el => el.textContent = translations[lang][el.dataset.i18n]);
        if (typeof window.applyFilters === 'function' && window.products) window.applyFilters();
        window.cartUI?.render();
    };
    document.querySelectorAll('.lang-opt').forEach(btn => btn.addEventListener('click', () => window.changeLanguage(btn.dataset.lang)));

    if (window.currentLang !== 'es') {
        window.changeLanguage(window.currentLang);
    } else {
        document.querySelectorAll('.lang-opt').forEach(el => el.classList.toggle('active', el.dataset.lang === 'es'));
    }

    window.showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        toast.innerHTML = `${icons[type] || icons.info}<span class="toast-message">${message}</span><button class="toast-close">&times;</button>`;
        container.appendChild(toast);
        const remove = () => {
            toast.style.animation = 'fadeOutToast 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1)';
            toast.addEventListener('animationend', () => toast.remove());
        };
        const timeout = setTimeout(remove, 40000);
        toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timeout); remove(); });
    };
    const initSocialSharing = () => {
        const shareLinks = document.querySelectorAll('.share-link');
        const url = encodeURIComponent(window.location.href),
              text = encodeURIComponent(document.title);
        const bases = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            'x-twitter': `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`
        };
        shareLinks.forEach(link => link.href = bases[Object.keys(bases).find(k => link.classList.contains(k))]);
    };
    initSocialSharing();
});
let activeDatePicker = null;
const t = (key) => window.TRANSLATIONS_RAW?.[key]?.[window.currentLang || 'es'] || key;

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
        const year = this.viewDate.getFullYear(), month = this.viewDate.getMonth(), lang = window.currentLang || 'es';
        this.currentMonthDisplay.textContent = `${window.TRANSLATIONS_RAW["calendar.months"][lang][month]} ${year}`;
        const dayNames = window.TRANSLATIONS_RAW["calendar.days"][lang];
        this.calendar.querySelectorAll('.calendar-grid-header span').forEach((h, i) => h.textContent = dayNames?.[i] || '');
        this.daysGrid.innerHTML = '';
        const first = new Date(year, month, 1).getDay(), days = new Date(year, month + 1, 0).getDate(), start = first === 0 ? 6 : first - 1;
        for (let i = 0; i < start; i++) {
            const e = document.createElement('div'); e.className = 'calendar-day empty';
            this.daysGrid.appendChild(e);
        }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (let d = 1; d <= days; d++) {
            const date = new Date(year, month, d), el = document.createElement('div');
            el.className = 'calendar-day'; el.textContent = d;
            if (date < today) el.classList.add('disabled');
            else el.onclick = (e) => (e.stopPropagation(), this.selectDate(new Date(date)));
            if (date.getTime() === today.getTime()) el.classList.add('today');
            this.updateDayStyling(el, date);
            this.daysGrid.appendChild(el);
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
        const lang = window.currentLang || 'es', loc = lang === 'es' ? 'es-ES' : 'en-GB', opt = { day: 'numeric', month: 'short' };
        if (this.startDate) {
            this.rangeText.textContent = `${this.startDate.toLocaleDateString(loc, opt)} - ${this.endDate ? this.endDate.toLocaleDateString(loc, opt) : '...'}`;
            this.rangeText.classList.add('has-dates');
        } else {
            this.rangeText.textContent = t('pricing.selectDates');
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

window.DatePicker = DatePicker;

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
            this.listeners.forEach(cb => cb(this.cart));
        } catch (e) { console.error('Cart error:', e); }
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
        const item = this.cart[index];
        if (!item || (item.quantity + change < 1)) return false;
        item.quantity += change;
        if (!item.isCustom && window.products) {
            const p = window.products.find(x => x.id === item.productId);
            if (p) {
                item.basePrice = p.priceDay * item.days * item.quantity;
                item.totalPrice = p.priceDay * item.multiplier * item.quantity;
            }
        }
        this.saveCart(); return true;
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
        if (!days) return 0;
        if (days === 7) return 3;
        return 1 + 0.5 * Math.min(Math.max(days - 1, 0), 3) + 0.25 * Math.min(Math.max(days - 4, 0), 2);
    }
}
window.cartManager = new CartManager();

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
    open() { this.drawer?.classList.add('active'); this.overlay?.classList.add('active'); }
    close() { this.drawer?.classList.remove('active'); this.overlay?.classList.remove('active'); }
    render() {

        if (this.countElement) {
            const count = this.cartManager.getCount();
            this.countElement.textContent = count;
            this.countElement.style.display = count > 0 ? 'block' : 'none';
        }

        if (this.totalElement) {
            const total = this.cartManager.getTotal();
            const hasCustom = this.cartManager.hasCustomItems();
            this.totalElement.textContent = hasCustom 
                ? `€${total.toLocaleString()} + ${t('cart.customRate')}`
                : `€${total.toLocaleString()}`;
        }

        if (!this.itemsContainer) return;
        const items = this.cartManager.getItems();
        const currentLang = window.currentLang || 'es';
        if (items.length === 0) {
            const isOnCatalog = window.location.pathname.includes('inventory');
            const browseButton = isOnCatalog ? '' : `<a href="inventory" class="btn btn-primary" style="margin-top: 20px;">${t('hero.browse')}</a>`;
            this.itemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <p>${t('cart.empty')}</p>
                    ${browseButton}
                </div>
            `;
            return;
        }
        this.itemsContainer.innerHTML = '';
        items.forEach((item, index) => {
            const product = window.products ? window.products.find(p => p.id === item.productId) : null;
            if (!product) return;
            const template = document.getElementById('cart-item-template');
            if (!template) return;
            const clone = template.content.cloneNode(true);
            const displayName = product.name[currentLang] || product.name.en;
            const img = clone.querySelector('.cart-item-img');
            img.src = product.image;
            img.alt = displayName;
            clone.querySelector('.cart-item-name').textContent = displayName;
            const locale = currentLang === 'es' ? 'es-ES' : 'en-GB';
            const options = { day: 'numeric', month: 'short' };
            const dateDisplay = `${new Date(item.start).toLocaleDateString(locale, options)} - ${new Date(item.end).toLocaleDateString(locale, options)}`;
            clone.querySelector('.cart-qty-input').value = item.quantity;
            clone.querySelector('.decrease').onclick = () => window.cartUI.updateQuantity(index, -1);
            clone.querySelector('.increase').onclick = () => window.cartUI.updateQuantity(index, 1);
            clone.querySelector('.cart-item-days').textContent = `${item.days} ${t('cart.days')}`;
            const pickerContainer = clone.querySelector('.cart-item-picker-container');
            pickerContainer.className = `date-picker cart-date-picker-${index}`;
            pickerContainer.dataset.cartIndex = index;
            pickerContainer.innerHTML = `
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
                        <div class="calendar-current-month"></div>
                        <button type="button" class="calendar-nav-btn">&gt;</button>
                    </div>
                    <div class="calendar-grid-header">
                        <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span>
                    </div>
                    <div class="calendar-days-grid"></div>
                </div>
            `;
            const priceEl = clone.querySelector('.cart-item-price');
            if (item.isCustom) {
                priceEl.innerHTML = `<span style="color: var(--accent);">${t('cart.customRate')}</span>`;
            } else {
                priceEl.innerHTML = `
                    <span class="price-base">€${item.basePrice.toLocaleString()}</span>
                    <span class="price-final">€${item.totalPrice.toLocaleString()}</span>
                `;
            }
            clone.querySelector('.remove-cart-item').onclick = () => window.cartUI.removeItem(index);
            this.itemsContainer.appendChild(clone);
        });

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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-drawer')) {
        window.cartUI = new CartUI(window.cartManager);
    }
});
window.CartManager = CartManager;
window.CartUI = CartUI;

class QuoteFormsManager {
    constructor() {
        this.accessKey = '0e309e67-18f7-478b-b192-bc8eaa8db5cd';
        this.init();
    }
    init() {

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

    validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
    validateSpanishPhone(p) { return /^(\+34|0034|34)?[6789]\d{8}$/.test(p.replace(/\s+/g, '')); }
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

    showSuccess() {
        const m = document.getElementById('quote-success-modal');
        if (m) { m.classList.add('active'); setTimeout(() => m.classList.remove('active'), 5000); }
    }

    showError(errorMessage = null) {
        if (window.showToast) {
            const msg = errorMessage || this.t('quote.error.message');
            window.showToast(msg, 'error');
        }
    }

    setupHeaderQuoteButton() {
        const headerQuoteBtns = document.querySelectorAll('.btn-primary[data-i18n="btn.getQuote"]');
        headerQuoteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openGeneralQuoteModal();
            });
        });
    }

    setupCartQuoteButton() {
        const cartQuoteBtn = document.getElementById('btn-request-quote');
        if (cartQuoteBtn) {
            cartQuoteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCartQuoteModal();
            });
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactFormSubmit(contactForm);
            });
        }
    }

    openGeneralQuoteModal() {
        const modal = document.getElementById('general-quote-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

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

            this.renderCartItemsSummary();
            modal.classList.add('active');
        }
    }

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
            <table class="quote-summary-table">
                <thead>
                    <tr class="quote-summary-th-row">
                        <th class="quote-summary-th text-left">${this.t('quote.cart.item')}</th>
                        <th class="quote-summary-th text-center">${this.t('quote.cart.dates')}</th>
                        <th class="quote-summary-th text-right">${this.t('quote.cart.price')}</th>
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
                ? `<span class="cart-item-custom-rate" style="font-size: 0.85rem;">${this.t('cart.customRate')}</span>`
                : `€${item.totalPrice.toLocaleString()}`;
            html += `
                <tr class="quote-summary-tr">
                    <td class="quote-summary-td">
                        <div class="quote-summary-item-box">
                            <img src="${product.image}" alt="${displayName}" class="quote-summary-img">
                            <span class="quote-summary-item-name"><b>${displayName}</b> &times; ${item.quantity}</span>
                        </div>
                    </td>
                    <td class="quote-summary-td text-center">
                        <div class="quote-summary-dates">${startDate} → ${endDate}</div>
                        <div class="quote-summary-days-label">${item.days} ${this.t('cart.days')}</div>
                    </td>
                    <td class="quote-summary-td quote-summary-price text-right">${priceDisplay}</td>
                </tr>
            `;
        });
        html += `
                </tbody>
                <tfoot>
                    <tr class="quote-summary-footer-tr">
                        <td colspan="2" class="quote-summary-total-label">${this.t('cart.estimatedTotal')}</td>
                        <td class="quote-summary-total-value">
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
    async handleFormSubmit(form, subject, extraData = {}) {
        const btn = form.querySelector('button[type="submit"]'), original = btn.textContent;
        const email = form.querySelector('[type="email"]')?.value, phone = form.querySelector('[type="tel"]')?.value;
        if (email && !this.validateEmail(email)) return this.showError(this.t('quote.validation.email'));
        if (phone && !this.validateSpanishPhone(phone)) return this.showError(this.t('quote.validation.phone'));
        const fd = new FormData(form);
        fd.append('access_key', this.accessKey);
        fd.append('subject', subject);
        Object.entries(extraData).forEach(([k, v]) => fd.append(k, v));
        btn.textContent = this.t('quote.form.sending'); btn.disabled = true;
        try {
            const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok && data.success) {
                this.closeGeneralQuoteModal(); this.closeCartQuoteModal();
                this.showSuccess(); form.reset();
                if (extraData.message?.includes('QUOTE ITEMS')) window.cartManager.clearCart();
            } else this.showError(data.message);
        } catch (e) { this.showError(); }
        finally { btn.textContent = original; btn.disabled = false; }
    }
    async handleContactFormSubmit(form) { await this.handleFormSubmit(form, 'Contact Form - UPSTAGE MADRID'); }
    async handleGeneralQuoteSubmit(form) { await this.handleFormSubmit(form, 'General Quote Request - UPSTAGE MADRID'); }
    async handleCartQuoteSubmit(form) {
        const items = window.cartManager.getItems(), text = this.formatCartItems(items);
        const msg = form.querySelector('#cart-quote-additional')?.value;
        await this.handleFormSubmit(form, 'Cart Quote Request - Upstage Rentals', { message: msg ? `${msg}\n${text}` : text });
    }
    closeGeneralQuoteModal() {
        document.getElementById('general-quote-modal').classList.remove('active');
    }
    closeCartQuoteModal() {
        document.getElementById('cart-quote-modal').classList.remove('active');
    }
    closeSuccessModal() {
        document.getElementById('quote-success-modal').classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.quoteFormsManager = new QuoteFormsManager();

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

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
});