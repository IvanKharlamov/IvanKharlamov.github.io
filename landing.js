// Ad landing page (alquiler-sonido.html). Loaded after products.js and common.js.
document.addEventListener('DOMContentLoaded', () => {
    // "Prices from" tiles. Each tile names its group in the markup:
    //   data-price-category="cat.sound"            category key, as in products.js
    //   data-price-subcategories="sub.a sub.b"     optional, narrows the group to these subcategories
    // and gets the lowest day rate among the group's priced products. Nothing is hardcoded:
    // a group without priced products loses its tile, and the block stays hidden if none is left.
    const tiles = Array.from(document.querySelectorAll('[data-price-category]'));
    if (tiles.length) {
        const products = Array.isArray(window.products) ? window.products : [];
        // Same rule as the catalog: only a numeric priceDay is a price (packs quoted to measure have null)
        const hasPrice = (p) => typeof p.priceDay === 'number' && p.priceDay > 0;
        const lowest = new Map();
        tiles.forEach(tile => {
            const category = tile.dataset.priceCategory;
            const subs = (tile.dataset.priceSubcategories || '').split(/\s+/).filter(Boolean);
            const prices = products
                .filter(p => p.category === category && (!subs.length || subs.includes(p.subcategory)) && hasPrice(p))
                .map(p => p.priceDay);
            if (prices.length) lowest.set(tile, Math.min(...prices));
            else tile.remove();
        });

        // "20 €" in Spanish, "€20" in English; the words around the number are data-i18n text
        const formatPrice = (value, lang) => {
            const number = value.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', { maximumFractionDigits: 2 });
            return lang === 'es' ? `${number}\u00A0€` : `€${number}`;
        };
        const paint = (lang) => lowest.forEach((value, tile) => {
            const slot = tile.querySelector('[data-price-value]');
            if (slot) slot.textContent = formatPrice(value, lang);
        });
        paint(window.currentLang || 'es');
        // The language switches re-translate the page in common.js; the numbers follow here
        document.querySelectorAll('.lang-opt').forEach(opt => opt.addEventListener('click', () => paint(opt.dataset.lang)));

        document.querySelectorAll('[data-price-block]').forEach(block => {
            block.hidden = !block.querySelector('[data-price-category]');
        });
    }

    // The closing "get a quote" button opens the quote modal (bound in common.js);
    // count it like the header and hero buttons of the other pages
    document.getElementById('sound-cta-quote')?.addEventListener('click', () => {
        window.trackEvent('open_form', { source: 'sound-landing' });
    });
});
