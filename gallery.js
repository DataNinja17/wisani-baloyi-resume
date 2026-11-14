for (const gallery of document.querySelectorAll('.gallery')) {
  const track = gallery.querySelector('.slides');
  const slides = [...track.children];
  const buttons = [...gallery.querySelectorAll('button')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function index() {return Math.max(0, Math.min(slides.length-1, Math.round(track.scrollLeft / track.clientWidth)));}
  function update() {
    const current = index();
    gallery.querySelector('output').textContent = (current+1)+' / '+slides.length;
    buttons[0].disabled = current===0;
    buttons[1].disabled = current===slides.length-1;
  }
  function move(amount) {
    track.scrollTo({left:(index()+amount)*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});
  }
  buttons.forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.step))));
  track.addEventListener('keydown',event=>{
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); move(event.key==='ArrowLeft'?-1:1);
  });
  track.addEventListener('scroll', update,{passive:true});
  new ResizeObserver(update).observe(track); update();
}
