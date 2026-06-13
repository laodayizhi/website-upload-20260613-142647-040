(function () {
    window.initMoviePlayer = function (options) {
        var config = options || {};
        var source = config.source || "";
        var videoId = config.videoId || "movie-player";
        var shellId = config.shellId || "movie-player-shell";
        var layerId = config.layerId || "movie-play-layer";

        function boot() {
            var video = document.getElementById(videoId);
            var shell = document.getElementById(shellId);
            var layer = document.getElementById(layerId);
            var hls = null;
            var started = false;

            if (!video || !shell || !source) {
                return;
            }

            function attachSource() {
                if (started) {
                    return;
                }
                started = true;
                if (layer) {
                    layer.classList.add("is-hidden");
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            shell.addEventListener("click", function () {
                attachSource();
            });
            if (layer) {
                layer.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    attachSource();
                });
            }
            video.addEventListener("play", function () {
                if (!started) {
                    attachSource();
                }
                if (layer) {
                    layer.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", boot);
        } else {
            boot();
        }
    };
})();
