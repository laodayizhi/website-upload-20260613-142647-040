(function(){
  var box=document.querySelector('[data-player-box]');
  if(!box)return;
  var video=box.querySelector('video');
  var cover=box.querySelector('[data-play-cover]');
  var btn=box.querySelector('[data-play-button]');
  var stream=video.getAttribute('data-stream');
  var hls=null;
  var ready=false;
  function begin(){
    if(cover)cover.classList.add('hidden');
    if(!ready){
      if(window.Hls&&window.Hls.isSupported()){
        hls=new Hls({maxBufferLength:30});
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function(){video.play().catch(function(){})});
      }else{
        video.src=stream;
        video.play().catch(function(){});
      }
      ready=true;
    }else{
      video.play().catch(function(){});
    }
  }
  if(btn)btn.addEventListener('click',begin);
  if(cover)cover.addEventListener('click',begin);
  video.addEventListener('click',function(){if(video.paused){begin()}else{video.pause()}});
})();