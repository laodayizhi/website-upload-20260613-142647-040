(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-carousel");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var arrows = Array.prototype.slice.call(hero.querySelectorAll(".hero-arrow"));
        if (!slides.length) {
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
                var target = Number(dot.getAttribute("data-target"));
                show(target);
                start();
            });
        });

        arrows.forEach(function (arrow) {
            arrow.addEventListener("click", function () {
                var direction = arrow.getAttribute("data-direction") === "prev" ? -1 : 1;
                show(current + direction);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search-form"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var keyword = input ? input.value.trim() : "";
                var url = "./search.html";
                if (keyword) {
                    url += "?q=" + encodeURIComponent(keyword);
                }
                window.location.href = url;
            });
        });
    }

    function setupPageFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".page-filter-input"));
        inputs.forEach(function (input) {
            var scope = input.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".filterable-grid .movie-card"));
            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-genre"));
                    card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function renderSearch() {
        var target = document.getElementById("search-results");
        var input = document.getElementById("search-keyword");
        if (!target || !window.MovieIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("q") || "";
        if (input) {
            input.value = keyword;
        }
        if (!keyword.trim()) {
            return;
        }
        var lower = normalize(keyword);
        var results = window.MovieIndex.filter(function (movie) {
            var text = normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags + " " + movie.oneLine);
            return text.indexOf(lower) !== -1;
        });
        var heading = document.getElementById("search-heading");
        var subtitle = document.getElementById("search-subtitle");
        if (heading) {
            heading.textContent = "搜索结果";
        }
        if (subtitle) {
            subtitle.textContent = results.length ? "已为你找到相关影片" : "未找到完全匹配的影片，可尝试更换关键词";
        }
        target.innerHTML = results.slice(0, 240).map(function (movie) {
            return [
                "<article class=\"movie-card\">",
                "<a class=\"movie-poster\" href=\"./" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"poster-shade\"></span><span class=\"play-mini\">▶</span></a>",
                "<div class=\"movie-info\"><div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
                "<h3><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>",
                "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + movie.tags.slice(0, 3).map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div></div></article>"
            ].join("");
        }).join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupForms();
        setupPageFilter();
        renderSearch();
    });
})();
