
window.trackEvent = function(eventName, eventParams) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
    } else {
        console.log('GA Track:', eventName, eventParams);
    }
};
document.addEventListener('DOMContentLoaded', () => {
    window.trackEvent('visit_page', { page_path: window.location.pathname });
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    // Live header height for anything that sticks right under it
    new ResizeObserver(() => {
        document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    }).observe(header);
    // Phone header: globe button opens the language dropdown
    const langMenu = document.getElementById('lang-menu'),
          langMenuToggle = document.getElementById('lang-menu-toggle');
    const setLangMenu = (open) => {
        if (!langMenu) return;
        langMenu.classList.toggle('open', open);
        langMenuToggle?.setAttribute('aria-expanded', String(open));
    };
    if (langMenu && langMenuToggle) {
        langMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            setLangMenu(!langMenu.classList.contains('open'));
        });
        langMenu.querySelectorAll('.lang-opt').forEach(opt => opt.addEventListener('click', () => setLangMenu(false)));
        document.addEventListener('click', (e) => {
            if (!langMenu.contains(e.target)) setLangMenu(false);
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setLangMenu(false); });
    }

    const cartToggleMobile = document.getElementById('cart-toggle-mobile');
    if (cartToggleMobile) {
        cartToggleMobile.addEventListener('click', () => {
            if (window.cartUI) window.cartUI.open();
        });
    }
    let translationsLoaded = false;
    const translations = { en: {}, es: {} };

    window.currentLang = localStorage.getItem('upstage_lang') || 'es';

    // `root` limits the pass to one subtree (a panel just filled from a template, say).
    // The page-wide pass also stores the choice and re-renders the catalog.
    const applyTranslations = (lang, root = document) => {
        const pageWide = root === document;
        if (pageWide) {
            window.currentLang = lang;
            localStorage.setItem('upstage_lang', lang);
            window.trackEvent('change_language', { language: lang });
            document.querySelectorAll('.lang-opt').forEach(el => el.classList.toggle('active', el.dataset.lang === lang));
        }
        root.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            let val = translations[lang][key];
            if (val) {
                val = val.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-text">$1</strong>');
                el.innerHTML = val;
            }
        });
        root.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = translations[lang][el.dataset.i18nPlaceholder]);
        root.querySelectorAll('option[data-i18n]').forEach(el => el.textContent = translations[lang][el.dataset.i18n]);
        if (pageWide && typeof window.applyFilters === 'function' && window.products) window.applyFilters();
    };

    if (window.TRANSLATIONS_RAW) {
        Object.entries(window.TRANSLATIONS_RAW).forEach(([key, val]) => {
            translations.en[key] = val.en;
            translations.es[key] = val.es;
        });
        translationsLoaded = true;
    }

    window.changeLanguage = (lang, root) => {
        if (lang === 'es' && !translationsLoaded) {
            window.currentLang = lang;
            localStorage.setItem('upstage_lang', lang);
        window.trackEvent('change_language', { language: lang });
            document.querySelectorAll('.lang-opt').forEach(el => el.classList.toggle('active', el.dataset.lang === lang));
            return;
        }

        if (!translationsLoaded) {
            const script = document.createElement('script');
            script.src = 'translations.js';
            script.onload = () => {
                if (window.TRANSLATIONS_RAW) {
                    Object.entries(window.TRANSLATIONS_RAW).forEach(([key, val]) => {
                        translations.en[key] = val.en;
                        translations.es[key] = val.es;
                    });
                }
                translationsLoaded = true;
                applyTranslations(lang, root);
            };
            document.head.appendChild(script);
        } else {
            applyTranslations(lang, root);
        }
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
            // Background tabs may never fire animationend; make sure the toast still goes away
            setTimeout(() => toast.remove(), 400);
        };
        const timeout = setTimeout(remove, 4000);
        toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timeout); remove(); });
    };
    
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;
        
        if (target.id === 'hero-quote-btn') {
            window.trackEvent('open_form', { source: 'hero' });
        } else if (target.id === 'hero-whatsapp-btn') {
            window.trackEvent('whatsapp_click', { source: 'hero' });
        } else if (target.classList.contains('whatsapp')) {
            window.trackEvent('whatsapp_click', { source: 'footer' });
        } else if (target.getAttribute('href') === '#contact' || target.getAttribute('href') === 'index.html#contact') {
            if (target.closest('.site-header')) {
                window.trackEvent('open_form', { source: 'header' });
            }
        }
    });

    
    // Scroll and Section Tracking
    let scrollStarted = false;
    window.addEventListener('scroll', () => {
        if (!scrollStarted && window.scrollY > 50) {
            scrollStarted = true;
            window.trackEvent('scroll_start', { page: window.location.pathname });
        }
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = entry.target.id || entry.target.className.split(' ')[0];
                window.trackEvent('section_view', { section_name: sectionName });
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });

    // Form Field Interaction Tracking
    const trackedFields = new Set();
    document.querySelectorAll('.quote-form input, .quote-form textarea').forEach(field => {
        field.addEventListener('change', (e) => {
            const fieldName = e.target.name || e.target.id;
            if (fieldName && !trackedFields.has(fieldName)) {
                trackedFields.add(fieldName);
                window.trackEvent('form_interaction', { 
                    form_id: e.target.closest('form').id,
                    field_name: fieldName 
                });
            }
        });
    });

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
        shareLinks.forEach(link => link.addEventListener('click', () => window.trackEvent('social_click', { platform: link.title })));
    };
    initSocialSharing();
});
let activeDatePicker = null;

const JS_FALLBACK_ES = {
    "btn.whatsapp": "Contactar por WhatsApp",
    "toast.invalidDates": "Rango de fechas inválido. La fecha de fin debe ser posterior a la de inicio.",
    "toast.itemRemoved": "Artículo eliminado del presupuesto",
    "toast.selectValidDates": "Por favor selecciona fechas de alquiler válidas.",
    "toast.itemAdded": "¡Artículo añadido al presupuesto!",
    "toast.emptyQuote": "Tu presupuesto está vacío. Añade artículos para solicitar un presupuesto.",
    "toast.quoteSubmitted": "¡Solicitud de Presupuesto Enviada! Te contactaremos pronto.",
    "quote.error.message": "Algo salió mal. Por favor intenta de nuevo o contáctanos directamente.",
    "cart.empty": "Tu carrito está vacío.",
    "quote.cart.item": "Artículo",
    "quote.cart.dates": "Fechas",
    "quote.cart.price": "Precio",
    "cart.customRate": "Tarifa Personalizada",
    "cart.days": "días",
    "cart.estimatedTotal": "Total Estimado",
    "quote.validation.email": "Por favor ingresa un correo electrónico válido",
    "quote.validation.phone": "Por favor ingresa un número de teléfono válido (ej: +34 612 345 678)",
    "quote.form.sending": "Enviando...",
    "rental.perDay": "/ día",
    "product.details": "Ver Detalles",
    "product.addToQuote": "Añadir al Presupuesto",
    "catalog.empty": "No se encontraron productos.",
    "rental.daysAndUnits": "{{days}} días x {{qty}} ud.",
    "rental.customRate": "Tarifa Personalizada",
    "pricing.title": "Precios del Alquiler:",
    "pricing.day1": "1 Día: 100% de la Tarifa",
    "pricing.day2_4": "2-4 Días: 50% de la Tarifa por Día Extra",
    "pricing.day5_6": "5-6 Días: 25% de la Tarifa por Día Extra",
    "pricing.day7": "7+ Días: ¡Semana Gratis!",
    "pricing.note": "*El precio final se calculará automáticamente.",
    "rental.selectValidDates": "Selecciona Fechas Válidas",
    "rental.selectDates": "Seleccionar Fechas",
    "pricing.selectDates": "Seleccionar Fechas",
    "toast.emptyQuote": "Tu presupuesto está vacío. Añade artículos para solicitar un presupuesto."
};

const t = (key) => window.TRANSLATIONS_RAW?.[key]?.[window.currentLang || 'es'] || JS_FALLBACK_ES[key] || key;

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
        this.prevBtn = prevBtn;
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
			// Phones: the calendar opens inline, make sure it is scrolled into view
			if (window.matchMedia('(max-width: 768px)').matches)
				requestAnimationFrame(() => this.calendar.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
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
        // Past months hold nothing selectable: never go before the current month
        const now = new Date(), thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (this.viewDate < thisMonth) this.viewDate = thisMonth;
        this.render();
    }
    render() {
        const year = this.viewDate.getFullYear(), month = this.viewDate.getMonth(), lang = window.currentLang || 'es';
        const monthNames = window.TRANSLATIONS_RAW?.["calendar.months"]?.[lang] || [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        this.currentMonthDisplay.textContent = `${monthNames[month] || ''} ${year}`;
        if (this.prevBtn) {
            const now = new Date();
            this.prevBtn.disabled = year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth());
        }
        const dayNames = window.TRANSLATIONS_RAW?.["calendar.days"]?.[lang] || ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
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
        const isStart = this.startDate && time === this.startDate.getTime();
        const isEnd = this.endDate && time === this.endDate.getTime();

        if (isStart && isEnd) {
            el.classList.add('selected');
        } else {
            if (isStart) {
                el.classList.add('selected', 'range-start');
            }
            if (isEnd) {
                el.classList.add('selected', 'range-end');
            }
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
            item.isCustom = diffDays > 7 || window.products?.find(p => p.id === item.productId)?.priceDay == null;
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
            this.itemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <p>${t('cart.empty')}</p>
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
                // the struck-out base price only makes sense when a discount applied
                const discounted = item.totalPrice < item.basePrice;
                priceEl.innerHTML = `
                    ${discounted ? `<span class="price-base">€${item.basePrice.toLocaleString()}</span>` : ''}
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
                window.trackEvent('generate_lead', { form_type: subject });
                if (extraData.message?.includes('QUOTE ITEMS')) window.cartManager.clearCart();
            } else {
                console.error("Web3Forms API Error:", data);
                if (data.message && data.message.toLowerCase().includes('spam')) {
                    this.showError(window.currentLang === 'es' ? 'Mensaje marcado como spam. Por favor, usa datos reales y evita la palabra "test".' : 'Message marked as spam. Please use real data and avoid dummy text like "test".');
                } else {
                    this.showError();
                }
            }
        } catch (e) {
            console.error("Web3Forms Fetch Error:", e);
            this.showError();
        }
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
        document.getElementById('general-quote-modal')?.classList.remove('active');
    }
    closeCartQuoteModal() {
        document.getElementById('cart-quote-modal')?.classList.remove('active');
    }
    closeSuccessModal() {
        document.getElementById('quote-success-modal')?.classList.remove('active');
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

/* ==========================================================================
   Catalog: filters, product grid, product modal (formerly inventory.js)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Catalog (inventory page and the embedded catalog on the home page).
    // Pages without a product grid skip all of this.
    if (!document.getElementById('product-grid')) return;

    let activeFilters = {
        category: [],
        subcategory: null
    };
    let searchTerm = "";
    let currentProductId = null;
    let currentSort = "featured";
    let currentModalView = 'details';

    const t = (key) => window.TRANSLATIONS_RAW[key]?.[window.currentLang || 'es'] || key;

    // Phones: the list scrolls with the page, so it is paged behind a "show more" button
    const MOBILE_PAGE = 8;
    let currentItems = [];
    let shownCount = 0;

    // Desktop: the first rows are built right away and the rest of the list in small
    // batches while the browser is idle, so the page never blocks on ~200 cards at once.
    // A new render (filter, search, language) drops the batches still pending.
    const FIRST_BATCH = 24, BATCH = 24;
    let renderJob = 0;
    const whenIdle = (fn) => ('requestIdleCallback' in window) ? requestIdleCallback(fn, { timeout: 500 }) : setTimeout(fn, 16);

    window.renderProducts = (items) => {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        const job = ++renderJob;
        currentItems = items;
        shownCount = 0;
        grid.innerHTML = '';
        if (items.length) {
            appendCards(mobileQuery.matches ? MOBILE_PAGE : FIRST_BATCH);
        } else {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;">${t('catalog.empty')}</div>`;
        }
        fitColumns();
        fitTwoRows();
        const finish = () => {
            if (job !== renderJob) return;
            if (!mobileQuery.matches && shownCount < currentItems.length) {
                appendCards(BATCH);
                whenIdle(finish);
                return;
            }
            injectProductSchema(items);
        };
        whenIdle(finish);
    };

    function appendCards(count) {
        const grid = document.getElementById('product-grid'), lang = window.currentLang || 'es';
        const template = document.getElementById('product-card-template');
        grid.querySelector('.show-more-wrap')?.remove();
        const slice = currentItems.slice(shownCount, shownCount + count);
        slice.forEach(p => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.product-card');
            if (p.category === 'cat.packs') {
                card.classList.add('product-card-pack');
            }
            card.onclick = () => window.openProductModal(p.id, 'details');
            
            const imgWrapper = clone.querySelector('.product-image');
            const atlas = window.CATALOG_ATLAS;
            const atlasInfo = atlas?.items?.[p.id];
            if (atlasInfo && atlas?.image) {
                const atlasDiv = document.createElement('div');
                atlasDiv.className = 'product-image-atlas';
                atlasDiv.style.backgroundImage = `url('${atlas.image}')`;
                // Zoom into the tile so the product fills the frame: the tile is
                // enlarged `zoom` times and its centre is kept at the centre of the box
                const zoom = atlasInfo.zoom || 1;
                if (zoom > 1 && atlas.cols && atlas.rows) {
                    const pos = (i, n) => ((i + 0.5) * zoom - 0.5) / (n * zoom - 1) * 100;
                    atlasDiv.style.backgroundSize = `${atlas.cols * zoom * 100}% ${atlas.rows * zoom * 100}%`;
                    atlasDiv.style.backgroundPosition = `${pos(atlasInfo.col, atlas.cols)}% ${pos(atlasInfo.row, atlas.rows)}%`;
                } else {
                    atlasDiv.style.backgroundPosition = `${atlasInfo.xPct}% ${atlasInfo.yPct}%`;
                }
                atlasDiv.setAttribute('role', 'img');
                atlasDiv.setAttribute('aria-label', p.name[lang]);
                imgWrapper.innerHTML = '';
                imgWrapper.appendChild(atlasDiv);
            } else {
                const imgEl = imgWrapper.querySelector('img');
                if (imgEl) {
                    imgEl.src = p.image;
                    imgEl.alt = p.imageAlt?.[lang] || p.name[lang];
                }
            }
            clone.querySelector('.product-category').textContent = labelFor(p, lang);
            clone.querySelector('.product-title').textContent = p.name[lang];
            const fromEl = clone.querySelector('.price-from');
            const unitEl = clone.querySelector('.price-unit');
            if (hasPrice(p)) {
                if (fromEl) fromEl.textContent = t('price.from');
                clone.querySelector('.price-day').textContent = `€${p.priceDay}`;
                unitEl.textContent = t('price.perDayLabel');
            } else {
                fromEl?.remove();
                unitEl.remove();
                clone.querySelector('.price-day').textContent = t('price.onRequest');
            }

            // Packs list their equipment on the card; the full description lives in the modal
            const descEl = clone.querySelector('.product-desc');
            const equipEl = clone.querySelector('.product-equipment');
            const equipment = p.equipment?.[lang];
            if (equipment?.length && equipEl) {
                fillEquipment(equipEl, equipment, CARD_EQUIPMENT_LIMIT);
                descEl?.remove();
            } else {
                equipEl?.remove();
                const d = p.description?.[lang];
                if (descEl) { if (d) descEl.textContent = d; else descEl.remove(); }
            }
            const scopeEl = clone.querySelector('.product-scope');
            if (scopeEl) {
                const sc = p.scope?.[lang];
                if (sc) scopeEl.textContent = sc; else scopeEl.remove();
            }
            
            const detailsBtn = clone.querySelector('.details-btn');
            detailsBtn.textContent = t('product.details');
            detailsBtn.onclick = (e) => { e.stopPropagation(); window.openProductModal(p.id, 'details'); };
            
            const addBtn = clone.querySelector('.add-to-quote-btn');
            addBtn.textContent = t('product.addToQuote');
            addBtn.onclick = (e) => { e.stopPropagation(); window.openProductModal(p.id, 'quote'); };
            
            grid.appendChild(clone);
        });
        shownCount += slice.length;
        const remaining = currentItems.length - shownCount;
        // Only phones page the list; on desktop the remaining cards follow in idle batches
        if (remaining > 0 && mobileQuery.matches) {
            const wrap = document.createElement('div');
            wrap.className = 'show-more-wrap';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-outline show-more-btn';
            btn.textContent = t('catalog.showMore').replace('{{n}}', remaining);
            btn.onclick = () => appendCards(MOBILE_PAGE);
            wrap.appendChild(btn);
            grid.appendChild(wrap);
        }
    }

    const scroller = document.querySelector('.catalog-embed .catalog-scroll');
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    // Crossing the phone breakpoint switches between the paged and the full list
    mobileQuery.addEventListener('change', () => window.applyFilters());

    // Pick the column count so the cards always fill the full grid width.
    // Pack cards span two columns, so an odd count would leave an empty column
    // on the right whenever a row holds only packs: keep the count even.
    const CARD_MIN = 300, CARD_HARD_MIN = 250;
    function fitColumns() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        if (mobileQuery.matches) {
            grid.style.gridTemplateColumns = '';
            grid.classList.remove('single-col');
            return;
        }
        const width = grid.clientWidth;
        if (!width) return;
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        const colWidth = n => (width - gap * (n - 1)) / n;
        let n = Math.max(1, Math.floor((width + gap) / (CARD_MIN + gap)));
        if (n > 1 && n % 2) n = colWidth(n + 1) >= CARD_HARD_MIN ? n + 1 : n - 1;
        grid.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
        grid.classList.toggle('single-col', n === 1);
    }
    window.addEventListener('load', fitColumns);
    {
        let colTimer;
        window.addEventListener('resize', () => { clearTimeout(colTimer); colTimer = setTimeout(fitColumns, 100); });
    }

    // Main page: size the scroll viewport to exactly two card rows (cards keep natural height)
    // On phones the list scrolls with the page under a sticky filter bar instead
    function fitTwoRows() {
        if (!scroller) return;
        if (mobileQuery.matches) {
            scroller.style.height = '';
            return;
        }
        fitColumns();
        const grid = document.getElementById('product-grid');
        const cards = grid ? Array.from(grid.querySelectorAll('.product-card')) : [];
        const tops = [...new Set(cards.map(c => c.offsetTop))].sort((a, b) => a - b);
        if (tops.length < 3) { scroller.style.height = ''; return; }
        const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
        const padBottom = parseFloat(getComputedStyle(scroller).paddingBottom) || 0;
        scroller.style.height = `${Math.round(tops[2] - gap + padBottom)}px`;
    }
    if (scroller) {
        let fitTimer;
        window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitTwoRows, 120); });
        window.addEventListener('load', fitTwoRows);
    }

    // Phones: a category chip was tapped while the filter bar is stuck under the
    // header, so the start of the new list is hidden behind it. Bring it into view.
    // Only called from the chip handlers: doing this on resize/load/render made the
    // page jump back to the list top every time the mobile URL bar toggled.
    function revealListTop() {
        if (!scroller || !mobileQuery.matches) return;
        const bar = document.querySelector('.catalog-embed .catalog-sidebar');
        if (!bar) return;
        const barBottom = bar.getBoundingClientRect().bottom;
        const listTop = scroller.getBoundingClientRect().top;
        if (listTop < barBottom) window.scrollBy(0, listTop - barBottom - 8);
    }

    // Packs without a set rate are quoted individually
    const hasPrice = (p) => typeof p.priceDay === 'number';

    const CARD_EQUIPMENT_LIMIT = 6;
    const fillEquipment = (list, items, limit = Infinity) => {
        list.innerHTML = '';
        const shown = items.length > limit ? items.slice(0, limit - 1) : items;
        shown.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            list.appendChild(li);
        });
        if (shown.length < items.length) {
            const li = document.createElement('li');
            li.className = 'equipment-more';
            li.textContent = t('product.moreItems').replace('{{n}}', items.length - shown.length);
            list.appendChild(li);
        }
    };

    // Subcategory label (falls back to the category)
    const labelFor = (p, lang) => {
        const key = p.subcategory && window.TRANSLATIONS_RAW?.[p.subcategory] ? p.subcategory : p.category;
        return window.TRANSLATIONS_RAW?.[key]?.[lang] || key;
    };

    // Subcategory chips for the active category
    const renderSubcategoryChips = () => {
        const group = document.getElementById('subcategory-group');
        const list = document.getElementById('subcategory-filter');
        if (!group || !list) return;
        const lang = window.currentLang || 'es';
        const cat = activeFilters.category[0];
        const subs = [];
        if (cat) {
            window.products.forEach(p => {
                if (p.category === cat && p.subcategory && !subs.includes(p.subcategory)) subs.push(p.subcategory);
            });
        }
        if (subs.length < 2) {
            group.hidden = true;
            list.innerHTML = '';
            return;
        }
        group.hidden = false;
        list.innerHTML = '';
        subs.forEach(sub => {
            const wrap = document.createElement('div');
            wrap.className = 'filter-chip-wrapper';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `sub-${sub.replace(/\W/g, '-')}`;
            input.checked = activeFilters.subcategory === sub;
            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = window.TRANSLATIONS_RAW?.[sub]?.[lang] || sub;
            input.addEventListener('change', () => {
                activeFilters.subcategory = input.checked ? sub : null;
                list.querySelectorAll('input').forEach(x => { x.checked = (x === input && input.checked); });
                window.applyFilters();
                revealListTop();
            });
            wrap.append(input, label);
            list.appendChild(wrap);
        });
    };

    const sortProducts = (items) => {
        const s = [...items];
        // Unpriced items go last in either direction
        const price = (p, fallback) => hasPrice(p) ? p.priceDay : fallback;
        return currentSort === 'lowToHigh' ? s.sort((a,b) => price(a, Infinity) - price(b, Infinity)) :
               currentSort === 'highToLow' ? s.sort((a,b) => price(b, -Infinity) - price(a, -Infinity)) : s;
    };
	
	function injectProductSchema(items) {
		const currentLang = window.currentLang || 'es';

		const schema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			"itemListElement": items.map((product, index) => ({
				"@type": "ListItem",
				"position": index + 1,
				"item": {
					"@type": "Product",
					"name": product.name[currentLang],
					"image": product.image,
					"description": product.description?.[currentLang]
						|| product.equipment?.[currentLang]?.join(', ')
						|| product.name[currentLang],
					"brand": {
						"@type": "Brand",
						"name": product.manufacturer || "UPSTAGE"
					},
					"offers": {
						"@type": "Offer",
						...(hasPrice(product) ? { "price": product.priceDay } : {}),
						"priceCurrency": "EUR",
						"availability": "https://schema.org/InStock"
					}
				}
			}))
		};

		let script = document.getElementById("inventory-schema");
		if (!script) {
			script = document.createElement("script");
			script.id = "inventory-schema";
			script.type = "application/ld+json";
			document.head.appendChild(script);
		}

		script.textContent = JSON.stringify(schema);
	}


    // Filter Logic
    window.applyFilters = () => {
        const lang = window.currentLang || 'es', s = searchTerm.toLowerCase();
        let filtered = window.products.filter(p => 
            (p.name[lang].toLowerCase().includes(s) || (p.manufacturer || '').toLowerCase().includes(s)) &&
            (!activeFilters.category.length || activeFilters.category.includes(p.category)) &&
            (!activeFilters.subcategory || p.subcategory === activeFilters.subcategory)
        );
        renderSubcategoryChips();
        window.renderProducts(sortProducts(filtered));
    };

    // Event Listeners - Search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            window.applyFilters();
        });
    }

    // Event Listeners - Sort
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            window.applyFilters();
        });
    }

    // Event Listeners - Checkboxes (Exclusive Categories)
    document.querySelectorAll('.filter-chip-wrapper input').forEach(cb => {
        cb.addEventListener('change', e => {
            const key = e.target.dataset.category;

            // Re-clicking the active category keeps it selected (no "show everything" state)
            if (!e.target.checked) {
                e.target.checked = true;
                return;
            }
            activeFilters.subcategory = null;
            activeFilters.category = [key];
            document.querySelectorAll('.filter-chip-wrapper input')
                .forEach(x => { x.checked = (x === e.target); });
            window.applyFilters();
            revealListTop();
        });
    });

    let datePicker = null;

    const productQtyInput = document.getElementById('product-qty');
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');
    const modalOverlay = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const addToQuoteBtn = document.getElementById('add-to-quote');

    if (qtyMinusBtn && qtyPlusBtn && productQtyInput) {
        qtyMinusBtn.addEventListener('click', () => {
            const val = parseInt(productQtyInput.value);
            if (val > 1) {
                productQtyInput.value = val - 1;
                updateModalPricing();
            }
        });
        qtyPlusBtn.addEventListener('click', () => {
            const val = parseInt(productQtyInput.value);
            productQtyInput.value = val + 1;
            updateModalPricing();
        });
        productQtyInput.addEventListener('change', () => {
            if (parseInt(productQtyInput.value) < 1) productQtyInput.value = 1;
            updateModalPricing();
        });
    }

    function calculateDays() {
        if (!datePicker) return 0;
        const { start, end } = datePicker.getDates();
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        if (startDate && endDate && endDate >= startDate) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    }

    function updateModalPricing() {
        const days = calculateDays(), p = window.products.find(x => x.id === currentProductId), qty = parseInt(productQtyInput?.value) || 1;
        const durEl = document.getElementById('rental-duration'), prEl = document.getElementById('modal-price');

        if (p && !hasPrice(p)) {
            durEl.textContent = days > 0
                ? t('rental.daysAndUnits').replace('{{days}}', days).replace('{{qty}}', qty)
                : t('rental.selectValidDates');
            prEl.innerHTML = `<span style="font-size:1rem;color:var(--accent);">${t('rental.customRate')}</span>`;
        } else if (days > 0 && p) {
            durEl.textContent = t('rental.daysAndUnits').replace('{{days}}', days).replace('{{qty}}', qty);
            if (days > 7) prEl.innerHTML = `<span style="font-size:1rem;color:var(--accent);">${t('rental.customRate')}</span>`;
            else {
                const m = window.cartManager.getRentalMultiplier(days), base = p.priceDay * days * qty, total = p.priceDay * m * qty;
                prEl.innerHTML = `${total < base ? `<span class="price-base">€${base.toLocaleString()}</span>` : ''}<span class="price-final">€${total.toLocaleString()}</span>${m > 1 ? `
                    <span class="price-multiplier">(x${m.toFixed(2)})</span>
                    <div class="price-info-trigger">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <div class="price-tooltip glass-card">
                            <strong>${t('pricing.title')}</strong><ul><li><strong>${t('pricing.day1')}</strong></li><li><strong>${t('pricing.day2_4')}</strong></li><li><strong>${t('pricing.day5_6')}</strong></li><li><strong>${t('pricing.day7')}</strong></li></ul><p>${t('pricing.note')}</p>
                        </div>
                    </div>` : ''}`;
            }
        } else {
            durEl.textContent = t('rental.selectValidDates');
            if (p) prEl.textContent = `€${(p.priceDay * qty).toLocaleString()}`;
        }
    }

	function calculateBasePrice(product, days, qty) {
		return product.priceDay * days * qty;
	}

    function switchModalView(view) {
        currentModalView = view;
        const detailsView = document.getElementById('modal-details-view');
        const quoteView = document.getElementById('modal-quote-view');
        const btnShowQuote = document.getElementById('btn-show-quote');
        const btnShowDetails = document.getElementById('btn-show-details');

        if (view === 'details') {
            detailsView.style.display = 'block';
            quoteView.style.display = 'none';
            if (btnShowQuote) btnShowQuote.style.display = 'inline-flex';
            if (btnShowDetails) btnShowDetails.style.display = 'none';
        } else {
            detailsView.style.display = 'none';
            quoteView.style.display = 'block';
            if (btnShowQuote) btnShowQuote.style.display = 'none';
            if (btnShowDetails) btnShowDetails.style.display = 'inline-flex';
        }
    }

    window.openProductModal = (id, view = 'details') => {
        currentProductId = id; currentModalView = view;
        const p = window.products.find(x => x.id === id), lang = window.currentLang || 'es';
        if (!p) return;

        window.trackEvent('view_item', { items: [{ item_id: p.id, item_name: p.name['en'] }] });
        const modalImg = document.getElementById('modal-img');
        modalImg.alt = p.imageAlt?.[lang] || p.name[lang];
        if (modalImg.getAttribute('src') !== p.image) {
            // Hide the previous asset's image while the new one loads so it never flashes
            modalImg.classList.add('is-loading');
            modalImg.onload = () => modalImg.classList.remove('is-loading');
            modalImg.onerror = () => modalImg.classList.remove('is-loading');
            modalImg.src = p.image;
            if (modalImg.complete && modalImg.naturalWidth) modalImg.classList.remove('is-loading');
        }
        document.getElementById('modal-title').textContent = p.name[lang];
        document.getElementById('modal-category').textContent = labelFor(p, lang);
        const equipment = p.equipment?.[lang];
        const modalDesc = document.getElementById('modal-desc');
        modalDesc.textContent = p.description?.[lang] || (equipment?.length ? '' : (lang === 'es' ? `${p.name[lang]} es una solución de alto rendimiento.` : `${p.name[lang]} is a high-performance solution.`));
        modalDesc.hidden = !modalDesc.textContent;
        const modalEquip = document.getElementById('modal-equipment');
        if (modalEquip) {
            if (equipment?.length) fillEquipment(modalEquip, equipment);
            else modalEquip.innerHTML = '';
            modalEquip.hidden = !equipment?.length;
        }
        const modalConditions = document.getElementById('modal-conditions');
        if (modalConditions) {
            modalConditions.textContent = p.conditions?.[lang] || '';
            modalConditions.hidden = !p.conditions?.[lang];
        }
        const modalScope = document.getElementById('modal-scope');
        if (modalScope) {
            const sc = p.scope?.[lang];
            modalScope.textContent = sc ? `${t('product.scope')}: ${sc}` : '';
            modalScope.hidden = !sc;
        }

        if (!datePicker && window.DatePicker) datePicker = new window.DatePicker(document.getElementById('modal-date-picker')), datePicker.onDateChange = updateModalPricing;
        else datePicker?.reset();

        if (productQtyInput) productQtyInput.value = 1;
        document.getElementById('rental-duration').textContent = t('rental.selectDates');
        updateModalPricing();
        switchModalView(view); modalOverlay.classList.add('active');
    };

    function closeModal() {
        modalOverlay.classList.remove('active');
        currentProductId = null;
        currentModalView = 'details';
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    const btnShowQuote = document.getElementById('btn-show-quote');
    const btnShowDetails = document.getElementById('btn-show-details');
    if (btnShowQuote) btnShowQuote.addEventListener('click', () => switchModalView('quote'));
    if (btnShowDetails) btnShowDetails.addEventListener('click', () => switchModalView('details'));

    if (addToQuoteBtn) {
        addToQuoteBtn.addEventListener('click', () => {
            if (!currentProductId) return;

            const days = calculateDays();
            if (days <= 0) {
                if (window.showToast) window.showToast(t('toast.selectValidDates'), "error");
                return;
            }

            const qty = productQtyInput ? parseInt(productQtyInput.value) || 1 : 1;
            const product = window.products.find(p => p.id === currentProductId);
            const isCustom = days > 7 || !hasPrice(product);
            let totalPrice = 0;
            let multiplier = 0;

            if (!isCustom) {
                multiplier = window.cartManager.getRentalMultiplier(days);
                totalPrice = product.priceDay * multiplier * qty;
            }

            const { start, end } = datePicker.getDates();

			window.cartManager.addItem({
				productId: currentProductId,
				start,
				end,
				days,
				multiplier,
				quantity: qty,
				basePrice: calculateBasePrice(product, days, qty),
				totalPrice,
				isCustom
			});

            closeModal();
            if (window.cartUI) window.cartUI.open();
            if (window.showToast) window.showToast(t('toast.itemAdded'), "success");
            window.trackEvent('add_to_cart', { items: [{ item_id: currentProductId, quantity: qty, price: product.priceDay }] });
        });
    }

    // Packs is the default category on every screen size
    const defaultChip = document.getElementById('cat-packs');
    if (defaultChip) {
        defaultChip.checked = true;
        activeFilters.category = [defaultChip.dataset.category];
    }
    window.applyFilters();
});

// Lock page scroll while the quote drawer or any modal is open. Every open
// and close path toggles `.active` on the element, so a class observer covers
// them all. iOS ignores overflow: hidden on body, hence the pinned body in
// common.css and the restored scroll position on close.
(() => {
    let lockedAt = null;
    const update = (targets) => {
        const open = targets.some(el => el.classList.contains('active'));
        if (open && lockedAt === null) {
            lockedAt = window.scrollY;
            document.body.style.top = `-${lockedAt}px`;
            document.body.classList.add('scroll-locked');
        } else if (!open && lockedAt !== null) {
            document.body.classList.remove('scroll-locked');
            document.body.style.top = '';
            window.scrollTo(0, lockedAt);
            lockedAt = null;
        }
    };
    document.addEventListener('DOMContentLoaded', () => {
        const targets = [...document.querySelectorAll('.cart-drawer, .modal-overlay')];
        if (!targets.length) return;
        const observer = new MutationObserver(() => update(targets));
        targets.forEach(el => observer.observe(el, { attributes: true, attributeFilter: ['class'] }));
        update(targets);
    });
})();
