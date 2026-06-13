(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var applyFilter = function () {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-year-filter]');

    if (!input && !select) {
      return;
    }

    var keyword = normalize(input ? input.value : '');
    var year = normalize(select ? select.value : '');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var tags = normalize(card.getAttribute('data-tags'));
      var region = normalize(card.getAttribute('data-region'));
      var itemYear = normalize(card.getAttribute('data-year'));
      var text = title + ' ' + tags + ' ' + region + ' ' + itemYear;
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedYear = !year || itemYear === year;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
    });
  };

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);

    try {
      var query = new URLSearchParams(window.location.search).get('q');
      if (query) {
        filterInput.value = query;
        applyFilter();
      }
    } catch (error) {
      applyFilter();
    }
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var playButton = document.querySelector('[data-play-button]');
    var sidePlay = document.querySelector('[data-side-play]');
    var stream = player.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    var hideOverlay = function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    };

    var startVideo = function () {
      if (!stream) {
        return;
      }

      if (!ready) {
        ready = true;

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(player);
        } else {
          player.src = stream;
        }
      }

      hideOverlay();
      var promise = player.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (sidePlay) {
      sidePlay.addEventListener('click', startVideo);
    }

    player.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());
