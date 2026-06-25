document.addEventListener('DOMContentLoaded', () => {
    // LED logic moved to 404-led.js
    // Hero background is now a CSS-only image carousel.

    function initReviewsCarousel() {
        const track = document.getElementById('reviews-track');
        const dotsContainer = document.getElementById('carousel-dots');
        if (!track || !dotsContainer) return;
        const cards = track.children;
        if (cards.length === 0) return;
        let currentIndex = 0;
        let autoSlideTimer;
        dotsContainer.innerHTML = Array.from(cards).map((_, i) => `
            <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        function updateCarousel(index) {
            currentIndex = index;
            track.style.transform = `translateX(calc(-${currentIndex} * (100% + 40px)))`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }
        let touchStartX = 0;
        let touchEndX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        function handleSwipe() {
            const swipeDist = touchStartX - touchEndX;
            if (Math.abs(swipeDist) > 50) {
                if (swipeDist > 0) {
                    updateCarousel((currentIndex + 1) % cards.length);
                } else {
                    updateCarousel((currentIndex - 1 + cards.length) % cards.length);
                }
                startAutoSlide();
            }
        }
        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                updateCarousel((currentIndex + 1) % cards.length);
            }, 5000);
        }
        function stopAutoSlide() {
            clearInterval(autoSlideTimer);
        }
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                updateCarousel(parseInt(dot.dataset.index, 10));
                startAutoSlide();
            });
        });
        const prevBtn = document.getElementById('prev-review');
        const nextBtn = document.getElementById('next-review');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateCarousel((currentIndex - 1 + cards.length) % cards.length);
                startAutoSlide();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateCarousel((currentIndex + 1) % cards.length);
                startAutoSlide();
            });
        }
        const carousel = document.querySelector('.reviews-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }
        startAutoSlide();
    }
    initReviewsCarousel();

    function initServiceAccordion() {
        const container = document.getElementById('service-details-container');
        const titleEl = document.getElementById('service-details-title');
        const textEl = document.getElementById('service-details-text');
        const galleryEl = document.getElementById('service-details-gallery');
        const grid = document.querySelector('.services-grid');
        if (!container || !grid) return;
        const serviceImages = {
            'rental': [
                'img/index/service_rental1.webp',
                'img/index/service_rental2.webp'
            ],
            'production': [
                'img/index/service_production1.webp',
                'img/index/service_production2.webp'
            ],
            'design': [
                'img/index/service_design1.webp',
                'img/index/service_design2.webp'
            ],
            'support': [
                'img/index/service_event1.webp',
                'img/index/service_event2.webp'
            ]
        };
        const cards = Array.from(grid.querySelectorAll('.service-card[data-service-id]'));
        let isInitialLoad = true;
        const placeContainer = (card) => {
            const top = card.offsetTop, row = cards.filter(c => c.offsetTop === top);
            const first = row[0], last = row[row.length - 1];
            last.insertAdjacentElement('afterend', container);
            container.classList.toggle('first-in-row', card === first);
            container.classList.toggle('last-in-row', card === last);
        };
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const serviceId = card.dataset.serviceId;
                const isActive = card.classList.contains('active');

                cards.forEach(c => c.classList.remove('active', 'is-first-in-row', 'is-last-in-row'));
                if (isActive) {
                    container.style.display = 'none';
                    return;
                }
                card.classList.add('active');
                placeContainer(card);

                const isFirst = container.classList.contains('first-in-row');
                const isLast = container.classList.contains('last-in-row');
                if (isFirst) card.classList.add('is-first-in-row');
                if (isLast) card.classList.add('is-last-in-row');
                titleEl.setAttribute('data-i18n', `services.${serviceId}.title`);
                const textKey = `services.${serviceId}.modalText`;
                textEl.setAttribute('data-i18n', textKey);
                galleryEl.innerHTML = '';
                if (serviceImages[serviceId] && serviceImages[serviceId].length > 0) {
                    const template = document.getElementById('service-img-template');
                    serviceImages[serviceId].forEach(src => {
                        if (template) {
                            const clone = template.content.cloneNode(true);
                            const img = clone.querySelector('img');
                            img.src = src;
                            galleryEl.appendChild(clone);
                        }
                    });
                }
                if (window.changeLanguage && window.currentLang) {
                    window.changeLanguage(window.currentLang);
                }
                container.style.display = 'block';
                
                if (window.innerWidth <= 768 && !isInitialLoad) {
                    setTimeout(() => {
                        const headerHeight = document.querySelector('.site-header').offsetHeight;
                        const targetY = card.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                    }, 100);
                }
                isInitialLoad = false;
            });
        });

        let resizeTimer;
        let prevWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            if (window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01) return;
            const currentWidth = window.innerWidth;
            if (currentWidth === prevWidth) return; 
            prevWidth = currentWidth;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const activeCard = grid.querySelector('.service-card.active');
                if (activeCard) {
                    placeContainer(activeCard);
                }
            }, 100);
        });

        if (cards.length > 0) {
            cards[0].click();
        }
    }
    initServiceAccordion();
});
window.addEventListener('load', () => { document.body.classList.add('loaded'); });

