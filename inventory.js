document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let activeFilters = {
        category: []
    };
    let searchTerm = "";
    let currentProductId = null;
    let currentSort = "featured";
    let currentModalView = 'details';

    // Helper function for translations
    function t(key) {
        const lang = window.currentLang || 'es';
        return window.TRANSLATIONS_RAW[key] ? window.TRANSLATIONS_RAW[key][lang] : key;
    }

    // Render Products Function
    window.renderProducts = function (items) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        const currentLang = window.currentLang || 'es';

        if (items.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;">${t('catalog.empty')}</div>`;
            return;
        }

        grid.innerHTML = items.map(product => {
            const displayName = product.name[currentLang];
            const displayCategory = window.TRANSLATIONS_RAW[product.category][currentLang];
            return `
            <div class="glass-card product-card" onclick="window.openProductModal(${product.id}, 'details')">
                <div class="product-image">
                    <img src="${product.image}" alt="${displayName}">
                </div>
                <div class="product-info">
                    <div class="product-category">${displayCategory}</div>
                    <h3 class="product-title">${displayName}</h3>
                    <div class="product-price">
                        <span class="price-day">€${product.priceDay}</span>
                        <span class="price-unit">${t('rental.perDay')}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.openProductModal(${product.id}, 'details')">${t('product.details')}</button>
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.openProductModal(${product.id}, 'quote')">${t('product.addToQuote')}</button>
                    </div>
                </div>
            </div>
        `}).join('');
    };

    // Sort products
    function sortProducts(items) {
        const sorted = [...items];
        
        switch(currentSort) {
            case 'lowToHigh':
                return sorted.sort((a, b) => a.priceDay - b.priceDay);
            case 'highToLow':
                return sorted.sort((a, b) => b.priceDay - a.priceDay);
            case 'featured':
            default:
                return sorted;
        }
    }

    // Filter Logic
    window.applyFilters = function () {
        const currentLang = window.currentLang || 'es';
        let filtered = window.products.filter(product => {
            const displayName = product.name[currentLang];
            const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = activeFilters.category.length === 0 || activeFilters.category.includes(product.category);

            return matchesSearch && matchesCategory;
        });

        filtered = sortProducts(filtered);
        window.renderProducts(filtered);
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

    // Event Listeners - Checkboxes
    document.querySelectorAll('.filter-chip-wrapper input').forEach(cb => {
        cb.addEventListener('change', e => {
            const key = e.target.dataset.category;

            if (key === 'cat.all') {
                activeFilters.category = [];
                document.querySelectorAll('.filter-chip-wrapper input')
                    .forEach(x => { if (x !== e.target) x.checked = false; });
            } else {
                document.getElementById('cat-all').checked = false;

                if (e.target.checked) {
                    activeFilters.category.push(key);
                } else {
                    activeFilters.category = activeFilters.category.filter(k => k !== key);
                }
            }
            window.applyFilters();
        });
    });

    let datePicker = null;

    // Modal elements
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

    // Helper: Calculate days
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

    // Helper: Update pricing in modal
    function updateModalPricing() {
        const days = calculateDays();
        const product = window.products.find(p => p.id === currentProductId);
        const qty = productQtyInput ? parseInt(productQtyInput.value) || 1 : 1;

        if (days > 0 && product) {
            if (days > 7) {
                const daysText = t('rental.daysAndUnits').replace('{{days}}', days).replace('{{qty}}', qty);
                document.getElementById('rental-duration').textContent = daysText;
                document.getElementById('modal-price').innerHTML = `<span style="font-size: 1rem; color: var(--accent);">${t('rental.customRate')}</span>`;
            } else {
				const multiplier = window.cartManager.getRentalMultiplier(days);
				const basePrice = calculateBasePrice(product, days, qty);
				const total = product.priceDay * multiplier * qty;

                const daysText = t('rental.daysAndUnits').replace('{{days}}', days).replace('{{qty}}', qty);
                document.getElementById('rental-duration').textContent = daysText;

                const multiplierText = multiplier > 1 ? ` 
                    <span class="price-multiplier">(x${multiplier.toFixed(2)})</span>
                    <div class="price-info-trigger">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <div class="price-tooltip glass-card">
                            <strong>${t('pricing.title')}</strong>
                            <ul>
                                <li><strong>${t('pricing.day1')}</strong></li>
                                <li><strong>${t('pricing.day2_4')}</strong></li>
                                <li><strong>${t('pricing.day5_6')}</strong></li>
                                <li><strong>${t('pricing.day7')}</strong></li>
                            </ul>
                            <p>${t('pricing.note')}</p>
                        </div>
                    </div>
                ` : '';
				document.getElementById('modal-price').innerHTML = `<span class="price-base">€${basePrice.toLocaleString()}</span><span class="price-final">€${total.toLocaleString()}</span>${multiplierText}`;
			}
        } else {
            document.getElementById('rental-duration').textContent = t('rental.selectValidDates');
            if (product) document.getElementById('modal-price').textContent = `€${(product.priceDay * qty).toLocaleString()}`;
        }
    }

	function calculateBasePrice(product, days, qty) {
		return product.priceDay * days * qty;
	}

    // Switch Modal View
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

    // Open Product Modal
    window.openProductModal = function (id, view = 'details') {
        currentProductId = id;
        currentModalView = view;
        const product = window.products.find(p => p.id === id);
        if (!product) return;

        const currentLang = window.currentLang || 'es';
        const displayName = product.name[currentLang];
        const displayCategory = window.TRANSLATIONS_RAW[product.category][currentLang];

        // Update shared elements
        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-title').textContent = displayName;
        document.getElementById('modal-category').textContent = displayCategory;
        
        const descText = product.description && product.description[currentLang]
            ? product.description[currentLang]
            : (currentLang === 'es'
                ? `${displayName} es una solución de ${displayCategory} de alto rendimiento utilizada en entornos profesionales.`
                : `${displayName} is a high-performance ${displayCategory} solution used in professional environments.`);

        document.getElementById('modal-desc').textContent = descText;

        // Populate specs
        const specGrid = document.getElementById('spec-grid');
        specGrid.innerHTML = '';
        const specs = product.specs ? product.specs[currentLang] : (currentLang === 'es' ? { "Estado": "Disponible" } : { "Status": "Available" });

        Object.entries(specs).forEach(([key, value]) => {
            specGrid.innerHTML += `
                <div class="spec-item">
                    <span class="spec-label">${key}</span>
                    <span class="spec-value">${value}</span>
                </div>
            `;
        });

        // Initialize/reset date picker using DatePicker from cart.js
        if (!datePicker) {
            const pickerElement = document.getElementById('modal-date-picker');
            if (window.DatePicker) {
                datePicker = new window.DatePicker(pickerElement);
                // Set callback for date changes
                datePicker.onDateChange = () => {
                    updateModalPricing();
                };
            }
        } else {
            datePicker.reset();
        }

        if (productQtyInput) productQtyInput.value = 1;
        document.getElementById('rental-duration').textContent = t('rental.selectDates');
        document.getElementById('modal-price').textContent = `€${product.priceDay}`;

        // Switch to appropriate view
        switchModalView(view);

        modalOverlay.classList.add('active');
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

    // View switching buttons
    const btnShowQuote = document.getElementById('btn-show-quote');
    const btnShowDetails = document.getElementById('btn-show-details');
    if (btnShowQuote) btnShowQuote.addEventListener('click', () => switchModalView('quote'));
    if (btnShowDetails) btnShowDetails.addEventListener('click', () => switchModalView('details'));

    // Add to Quote
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
            const isCustom = days > 7;
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
        });
    }

    // --- Checkout Logic ---
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout');
    const cancelCheckoutBtn = document.getElementById('cancel-checkout');
    const requestQuoteBtn = document.getElementById('btn-request-quote');
    const checkoutForm = document.getElementById('checkout-form');

    function openCheckout() {
        if (window.cartManager.getCount() === 0) {
            if (window.showToast) window.showToast(t('toast.emptyQuote'), "error");
            return;
        }
        if (window.cartUI) window.cartUI.close();
        if (checkoutModal) checkoutModal.classList.add('active');
    }

    function closeCheckout() {
        if (checkoutModal) checkoutModal.classList.remove('active');
    }

    if (requestQuoteBtn) requestQuoteBtn.addEventListener('click', openCheckout);
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckout);
    if (cancelCheckoutBtn) cancelCheckoutBtn.addEventListener('click', closeCheckout);

    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeCheckout();
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                contact: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    company: document.getElementById('company').value,
                    project: document.getElementById('project').value,
                    notes: document.getElementById('notes').value
                },
                items: window.cartManager.getItems(),
                totalEstimated: window.cartManager.getTotal()
            };

            console.log("Submitting Quote Request:", formData);

            if (window.showToast) window.showToast(t('toast.quoteSubmitted'), "success");

            window.cartManager.clearCart();
            checkoutForm.reset();
            closeCheckout();
        });
    }

    // Initial Render
    window.renderProducts(window.products);
});