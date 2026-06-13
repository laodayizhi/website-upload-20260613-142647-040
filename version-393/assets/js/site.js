(function() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function() {
            showSlide(activeSlide + 1);
        }, 5000);
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            showSlide(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
            }
            startHeroTimer();
        });
    });

    startHeroTimer();

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function bindFilter(root) {
        const cards = Array.from(document.querySelectorAll('.filter-card'));
        if (!cards.length) {
            return;
        }
        const input = root.querySelector('[data-filter-input]') || document.getElementById('homeSearch');
        const yearSelect = root.querySelector('[data-year-filter]');
        const regionSelect = root.querySelector('[data-region-filter]');

        function applyFilter() {
            const query = normalize(input ? input.value : '');
            const year = yearSelect ? yearSelect.value : '';
            const region = regionSelect ? regionSelect.value : '';

            cards.forEach(function(card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre
                ].join(' '));
                const matchesQuery = !query || haystack.includes(query);
                const matchesYear = !year || card.dataset.year === year;
                const matchesRegion = !region || card.dataset.region === region;
                card.classList.toggle('is-filtered-out', !(matchesQuery && matchesYear && matchesRegion));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (regionSelect) {
            regionSelect.addEventListener('change', applyFilter);
        }
    }

    document.querySelectorAll('[data-filter-root]').forEach(bindFilter);

    const homeSearch = document.getElementById('homeSearch');
    if (homeSearch) {
        homeSearch.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && homeSearch.value.trim()) {
                window.location.href = 'search.html?q=' + encodeURIComponent(homeSearch.value.trim());
            }
        });
    }

    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get('q');
    if (q) {
        const filterInput = document.querySelector('[data-filter-input]');
        if (filterInput) {
            filterInput.value = q;
            filterInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}());
