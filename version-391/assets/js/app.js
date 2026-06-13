(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', menu.classList.contains('open'));
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function matchYear(value, year) {
    var numericYear = Number(year);
    if (!value || value === '全部年份') {
      return true;
    }
    if (value === '2020-2022') {
      return numericYear >= 2020 && numericYear <= 2022;
    }
    if (value === '2010-2019') {
      return numericYear >= 2010 && numericYear <= 2019;
    }
    if (value === '2000-2009') {
      return numericYear >= 2000 && numericYear <= 2009;
    }
    if (value === '更早') {
      return numericYear < 2000;
    }
    return String(numericYear) === value;
  }

  function matchRegion(value, region) {
    if (!value || value === '全部地区') {
      return true;
    }
    if (value === '其他') {
      return !/中国大陆|中国|中国台湾|中国香港|日本|韩国|美国|欧美/.test(region);
    }
    return region.indexOf(value) !== -1;
  }

  function matchGenre(value, genre, tags) {
    if (!value || value === '全部类型') {
      return true;
    }
    return genre.indexOf(value) !== -1 || tags.indexOf(value) !== -1;
  }

  function setupFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var genreSelect = panel.querySelector('[data-filter-genre]');
      var scope = panel.parentElement || document;
      var cards = selectAll('.movie-card', scope);
      if (!cards.length) {
        cards = selectAll('.movie-card', document);
      }

      function apply() {
        var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
        var year = yearSelect && yearSelect.value;
        var region = regionSelect && regionSelect.value;
        var genre = genreSelect && genreSelect.value;
        cards.forEach(function (card) {
          var titleText = (card.getAttribute('data-title') || '').toLowerCase();
          var yearText = card.getAttribute('data-year') || '';
          var regionText = card.getAttribute('data-region') || '';
          var genreText = card.getAttribute('data-genre') || '';
          var tagsText = card.getAttribute('data-tags') || '';
          var haystack = [titleText, yearText, regionText, genreText, tagsText.toLowerCase(), card.textContent.toLowerCase()].join(' ');
          var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchYear(year, yearText) && matchRegion(region, regionText) && matchGenre(genre, genreText, tagsText);
          card.classList.toggle('hidden-by-filter', !visible);
        });
      }

      [keywordInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  window.initMoviePlayer = function (videoUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-play-overlay]');
    var started = false;
    var hlsInstance = null;

    function bindSource() {
      if (!video || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function play() {
      bindSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
