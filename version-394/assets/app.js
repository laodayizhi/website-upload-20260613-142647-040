(function () {
    var hlsLoading = false;
    var hlsCallbacks = [];

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        hlsCallbacks.push(callback);
        if (hlsLoading) {
            return;
        }
        hlsLoading = true;
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.onload = function () {
            var callbacks = hlsCallbacks.slice();
            hlsCallbacks = [];
            callbacks.forEach(function (item) {
                item(window.Hls);
            });
        };
        script.onerror = function () {
            hlsCallbacks = [];
        };
        document.head.appendChild(script);
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            if (!slides.length) {
                return;
            }
            var index = 0;
            var timer = null;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }
            function start() {
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    show(i);
                    start();
                });
            });
            start();
        });
    }

    function textIncludes(value, query) {
        return String(value || "").toLowerCase().indexOf(query) !== -1;
    }

    function initFilters() {
        document.querySelectorAll(".search-scope").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var region = scope.querySelector("[data-filter-region]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var category = scope.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            if (!input && !region && !year && !type && !category) {
                return;
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var categoryValue = category ? category.value : "";
                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (regionValue && !textIncludes(card.dataset.region, regionValue)) {
                        matched = false;
                    }
                    if (yearValue && card.dataset.year !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && card.dataset.type !== typeValue) {
                        matched = false;
                    }
                    if (categoryValue && card.dataset.category !== categoryValue) {
                        matched = false;
                    }
                    card.classList.toggle("is-filtered-out", !matched);
                });
            }
            [input, region, year, type, category].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            });
        });
    }

    function bindVideo(video, source, done) {
        if (video.dataset.ready === "true") {
            done();
            return;
        }
        video.dataset.ready = "true";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            done();
            return;
        }
        loadHls(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    maxBufferLength: 30
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    done();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
                done();
            }
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video[data-video-src]");
            var button = player.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            var source = video.dataset.videoSrc;
            function play() {
                bindVideo(video, source, function () {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                });
                if (button) {
                    button.classList.add("is-hidden");
                }
            }
            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove("is-hidden");
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
