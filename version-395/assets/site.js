(function(){
  function q(s,c){return (c||document).querySelector(s)}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  var menu=q('[data-menu]'),mobile=q('[data-mobile-nav]');
  if(menu&&mobile){menu.addEventListener('click',function(){mobile.classList.toggle('open')})}
  var slides=qa('[data-hero-slide]'),dots=qa('[data-hero-dot]'),current=0,timer=null;
  function show(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===current)});dots.forEach(function(d,n){d.classList.toggle('active',n===current)})}
  dots.forEach(function(d,i){d.addEventListener('click',function(){show(i);if(timer)clearInterval(timer);timer=setInterval(function(){show(current+1)},5200)})});
  if(slides.length>1){timer=setInterval(function(){show(current+1)},5200)}
  var input=q('[data-search-input]'),year=q('[data-year-filter]'),type=q('[data-type-filter]'),root=q('[data-filter-root]');
  function apply(){if(!root)return;var keyword=(input&&input.value||'').trim().toLowerCase(),yv=year&&year.value||'',tv=type&&type.value||'',visible=0;qa('[data-movie-card]',root).forEach(function(card){var hay=(card.getAttribute('data-search')||'').toLowerCase(),cy=card.getAttribute('data-year')||'',ct=card.getAttribute('data-type')||'';var ok=(!keyword||hay.indexOf(keyword)>-1)&&(!yv||cy===yv)&&(!tv||ct===tv);card.classList.toggle('hide-by-filter',!ok);if(ok)visible++});root.classList.toggle('filtered-empty',visible===0)}
  [input,year,type].forEach(function(el){if(el){el.addEventListener('input',apply);el.addEventListener('change',apply)}});
})();