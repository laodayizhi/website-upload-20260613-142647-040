(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    const button = $("[data-menu-button]");
    const nav = $("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function renderSearchResult(movie) {
    return [
      '<a class="search-result" href="./' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.region + ' · ' + movie.year + ' · ' + movie.type) + '</span></span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setupGlobalSearch() {
    const input = $("[data-global-search]");
    const panel = $("[data-search-panel]");
    if (!input || !panel || !window.MOVIE_INDEX && typeof MOVIE_INDEX === "undefined") {
      return;
    }
    const data = typeof MOVIE_INDEX !== "undefined" ? MOVIE_INDEX : [];
    input.addEventListener("input", function () {
      const query = normalize(input.value);
      if (!query) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      const results = data.filter(function (movie) {
        const haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" "));
        return haystack.indexOf(query) !== -1;
      }).slice(0, 10);
      panel.innerHTML = results.map(renderSearchResult).join("");
      panel.classList.toggle("is-open", results.length > 0);
    });
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function setupHero() {
    const hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = $all("[data-hero-slide]", hero);
    const dots = $all("[data-hero-dot]", hero);
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate(index + 1);
    }, 5600);
  }

  function setupFilters() {
    const groups = $all("[data-filter-scope]");
    groups.forEach(function (scope) {
      const keyword = $("[data-filter-keyword]", scope);
      const region = $("[data-filter-region]", scope);
      const type = $("[data-filter-type]", scope);
      const cards = $all(".movie-card, .rank-item", scope);
      function apply() {
        const q = normalize(keyword ? keyword.value : "");
        const r = normalize(region ? region.value : "");
        const t = normalize(type ? type.value : "");
        cards.forEach(function (card) {
          const search = normalize(card.getAttribute("data-search"));
          const cardRegion = normalize(card.getAttribute("data-region"));
          const cardType = normalize(card.getAttribute("data-type"));
          const matched = (!q || search.indexOf(q) !== -1) && (!r || cardRegion.indexOf(r) !== -1 || search.indexOf(r) !== -1) && (!t || cardType.indexOf(t) !== -1 || search.indexOf(t) !== -1);
          card.classList.toggle("is-filtered-out", !matched);
        });
      }
      [keyword, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupSearchPage() {
    const input = $("[data-search-input]");
    const scope = $("[data-search-page]");
    if (!input || !scope) {
      return;
    }
    const cards = $all(".movie-card", scope);
    input.addEventListener("input", function () {
      const query = normalize(input.value);
      cards.forEach(function (card) {
        const matched = !query || normalize(card.getAttribute("data-search")).indexOf(query) !== -1;
        card.classList.toggle("is-filtered-out", !matched);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupGlobalSearch();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
