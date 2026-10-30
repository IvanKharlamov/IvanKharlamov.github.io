document.addEventListener('DOMContentLoaded', () => {
    let activeFilters = {
        category: [],
        subcategory: null
    };
    let searchTerm = "";
    let currentProductId = null;
    let currentSort = "featured";
    let currentModalView = 'details';

    const t = (key) => window.TRANSLATIONS_RAW[key]?.[window.currentLang || 'es'] || key;

    window.renderProducts = (items) => {
        const grid = document.getElementById('product-grid'), lang = window.currentLang || 'es';
        if (!grid) return;

        grid.innerHTML = '';
        if (items.length) {
            const template = document.getElementById('product-card-template');
            items.forEach(p => {
                const clone = template.content.cloneNode(true);
                const card = clone.querySelector('.product-card');
                if (p.category === 'cat.packs') {
                    card.classList.add('product-card-pack');
                }
                card.onclick = () => window.openProductModal(p.id, 'details');
                
                const imgWrapper = clone.querySelector('.product-image');
                const atlasInfo = window.CATALOG_ATLAS?.items?.[p.id];
                if (atlasInfo && window.CATALOG_ATLAS?.image) {
                    const atlasDiv = document.createElement('div');
                    atlasDiv.className = 'product-image-atlas';
                    atlasDiv.style.backgroundImage = `url('${window.CATALOG_ATLAS.image}')`;
                    atlasDiv.style.backgroundPosition = `${atlasInfo.xPct}% ${atlasInfo.yPct}%`;
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
        } else {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;">${t('catalog.empty')}</div>`;
        }
        injectProductSchema(items);
        fitColumns();
        fitTwoRows();
    };

    const scroller = document.querySelector('.catalog-embed .catalog-scroll');
    const mobileQuery = window.matchMedia('(max-width: 768px)');

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
                prEl.innerHTML = `<span class="price-base">€${base.toLocaleString()}</span><span class="price-final">€${total.toLocaleString()}</span>${m > 1 ? ` 
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
        modalImg.src = p.image;
        modalImg.alt = p.imageAlt?.[lang] || p.name[lang];
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

    // Packs is the default category
    const defaultChip = document.getElementById('cat-packs');
    if (defaultChip) {
        defaultChip.checked = true;
        activeFilters.category = [defaultChip.dataset.category];
    }
    window.applyFilters();
});
