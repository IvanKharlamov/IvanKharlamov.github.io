// quote-forms.js - Quote request functionality with Web3Forms integration

class QuoteFormsManager {
    constructor() {
        this.accessKey = 'b725d07a-8c52-4e3f-8abd-9cad75a0cead';
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
        const headerQuoteBtns = document.querySelectorAll('.btn-primary[data="btn.getQuote"]');
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
        formData.append('subject', 'Contact Form - Upstage Rentals');
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
        formData.append('subject', 'General Quote Request - Upstage Rentals');
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