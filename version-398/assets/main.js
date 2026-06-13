(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initMissingImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
                image.setAttribute("aria-hidden", "true");
            }, { once: true });
        });
    }

    function fillSelectOptions(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        if (!lists.length) {
            return;
        }

        var queryInput = document.querySelector("[data-search-input]");
        var regionSelect = document.querySelector("[data-region-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var empty = document.querySelector("[data-filter-empty]");
        var cards = [];

        lists.forEach(function (list) {
            cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll("[data-card]")));
        });

        fillSelectOptions(regionSelect, Array.from(new Set(cards.map(function (card) {
            return card.getAttribute("data-region") || "";
        }))).sort());

        fillSelectOptions(yearSelect, Array.from(new Set(cards.map(function (card) {
            return card.getAttribute("data-year") || "";
        }))).sort().reverse());

        fillSelectOptions(typeSelect, Array.from(new Set(cards.map(function (card) {
            return card.getAttribute("data-type") || "";
        }))).sort());

        var params = new URLSearchParams(window.location.search);
        if (queryInput && params.get("q")) {
            queryInput.value = params.get("q");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var query = normalize(queryInput ? queryInput.value : "");
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesRegion = !region || card.getAttribute("data-region") === region;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                var matchesType = !type || card.getAttribute("data-type") === type;
                var isVisible = matchesQuery && matchesRegion && matchesYear && matchesType;
                card.hidden = !isVisible;
                if (isVisible) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [queryInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function initPlayer(container) {
        var video = container.querySelector("video[data-src]");
        var playButton = container.querySelector(".player-play");
        var status = container.querySelector("[data-player-status]");
        if (!video) {
            return;
        }

        var source = video.getAttribute("data-src");
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (!source) {
                setStatus("暂无播放源");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源已就绪");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("视频加载失败，请稍后重试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("播放源已就绪");
                }, { once: true });
            } else {
                video.src = source;
                setStatus("当前浏览器可能不支持 HLS 播放");
            }
        }

        function playOrPause() {
            if (video.paused) {
                video.play().then(function () {
                    container.classList.add("is-playing");
                    setStatus("正在播放");
                }).catch(function () {
                    setStatus("请再次点击播放");
                });
            } else {
                video.pause();
                container.classList.remove("is-playing");
                setStatus("已暂停");
            }
        }

        attachSource();

        if (playButton) {
            playButton.addEventListener("click", playOrPause);
        }
        video.addEventListener("click", playOrPause);
        video.addEventListener("play", function () {
            container.classList.add("is-playing");
            setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
            container.classList.remove("is-playing");
            setStatus("已暂停");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(initPlayer);
    }

    ready(function () {
        initNavigation();
        initHero();
        initMissingImages();
        initFilters();
        initPlayers();
    });
}());
