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
            const isOnCatalog = window.location.pathname.includes('inventory.html');
            const browseButton = isOnCatalog ? '' : `<a href="inventory.html" class="btn btn-primary" style="margin-top: 20px;">${t('hero.browse')}</a>`;
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