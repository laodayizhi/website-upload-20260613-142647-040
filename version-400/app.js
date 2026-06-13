(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            menuButton.classList.toggle('open', opened);
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var query = new URLSearchParams(window.location.search).get('q');
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));

    if (query && filterInputs.length) {
        filterInputs[0].value = query;
    }

    function normalized(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function runFilter() {
        var scope = document.querySelector('.filter-scope');
        if (!scope) {
            return;
        }
        var items = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
        var textNeedle = normalized(filterInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var activeFilters = filterSelects.map(function (select) {
            return {
                key: select.getAttribute('data-filter'),
                value: normalized(select.value)
            };
        }).filter(function (item) {
            return item.key && item.value;
        });
        var visible = 0;

        items.forEach(function (item) {
            var haystack = normalized([
                item.getAttribute('data-title'),
                item.getAttribute('data-region'),
                item.getAttribute('data-type'),
                item.getAttribute('data-year'),
                item.getAttribute('data-genre'),
                item.getAttribute('data-tags'),
                item.textContent
            ].join(' '));
            var passText = !textNeedle || haystack.indexOf(textNeedle) !== -1;
            var passSelect = activeFilters.every(function (filter) {
                return normalized(item.getAttribute('data-' + filter.key)).indexOf(filter.value) !== -1;
            });
            var pass = passText && passSelect;
            item.hidden = !pass;
            if (pass) {
                visible += 1;
            }
        });

        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', runFilter);
    });
    filterSelects.forEach(function (select) {
        select.addEventListener('change', runFilter);
    });
    if (filterInputs.length || filterSelects.length) {
        runFilter();
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var url = shell.getAttribute('data-video-url');
        var loaded = false;

        if (!video || !overlay || !url) {
            return;
        }

        function loadAndPlay() {
            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    video.src = url;
                }
                loaded = true;
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('playing');
                });
            }
            shell.classList.add('playing');
        }

        overlay.addEventListener('click', loadAndPlay);
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('playing');
            }
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('playing');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(setupPlayer);
})();
