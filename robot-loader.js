(() => {
  const section=document.querySelector('#home:not([hidden]) #automation-3d');
  if(!section)return;
  let loaded=false;
  const load=()=>{
    if(loaded)return;loaded=true;
    const script=document.createElement('script');script.src='/ShreeChoudhari/robot.js';
    script.onerror=()=>{document.getElementById('robot-status').textContent='The 3D view could not load. Refresh to try again.';};
    document.head.appendChild(script);
  };
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}},{rootMargin:'500px'});observer.observe(section);
  }else load();
})();
