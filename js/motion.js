import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
const state=window.portfolioState;
let lenis,localTicker;
const mm=gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)',()=>{
 const local=gsap.context(()=>{
  document.querySelectorAll('.section-heading h2').forEach(h=>{
   const walker=document.createTreeWalker(h,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   nodes.forEach(n=>{if(!n.textContent.trim())return;const fragment=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim())fragment.append(document.createTextNode(word));else{const span=document.createElement('span');span.className='reveal-word';span.textContent=word;fragment.append(span);}});n.replaceWith(fragment);});
   gsap.from(h.querySelectorAll('.reveal-word'),{y:18,opacity:.45,stagger:.045,duration:.65,ease:'power3.out',scrollTrigger:{trigger:h,start:'top 93%',once:true}});
  });
  document.querySelectorAll('.proof-strip strong:not([data-exact])').forEach(el=>{const match=el.textContent.match(/^([0-9.]+)/);if(!match)return;const value=Number(match[1]),suffix=el.querySelector('span')?.outerHTML||'',decimals=match[1].includes('.')?2:0,counter={value:0};gsap.to(counter,{value,duration:1.35,ease:'power3.out',onUpdate:()=>{el.innerHTML=(decimals?counter.value.toFixed(decimals):String(Math.round(counter.value)).padStart(2,'0'))+suffix;},scrollTrigger:{trigger:el,start:'top 96%',once:true}});});
  const groups=document.querySelectorAll('.section-heading, .skills-grid article, .record, .leadership-card');
  groups.forEach(el=>{gsap.from(el,{opacity:.35,y:24,duration:.75,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 96%',once:true}});});
  if(innerWidth>800){
   lenis=new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,anchors:true});
   lenis.on('scroll',ScrollTrigger.update);
   const tick=t=>lenis?.raf(t*1000);gsap.ticker.add(tick);
   gsap.ticker.lagSmoothing(0);
   localTicker=tick;
   document.querySelectorAll('.station h3').forEach(h=>gsap.from(h,{y:25,opacity:.5,ease:'none',scrollTrigger:{trigger:h,start:'top 87%',end:'top 55%',scrub:.5}}));
  }
 });
 return()=>{local.revert();if(localTicker)gsap.ticker.remove(localTicker);lenis?.destroy();lenis=undefined;};
});
function sync(){const paused=!state.ambient||state.estop||document.hidden;gsap.globalTimeline.paused(paused);if(document.querySelector('dialog[open]'))lenis?.stop();else lenis?.start();}
addEventListener('machine:change',sync);addEventListener('portfolio:dialog',sync);document.addEventListener('visibilitychange',sync);addEventListener('portfolio:layout',()=>ScrollTrigger.refresh());sync();
