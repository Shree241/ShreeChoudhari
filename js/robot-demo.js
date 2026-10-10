import {createProgram,jointPositions,BAY_A,BAY_B} from './robot-program.js?v=pickplace1';
const $=s=>document.querySelector(s),state=window.portfolioState;
const views=[$('#robot-view'),$('#control-preview')],program=createProgram();
let frameId=0,last=0,visible=true,lastPhase='';
const ns='http://www.w3.org/2000/svg';
const project=p=>[290+90*(p.x*.8-p.z*.65),430-100*p.y+25*(p.x*.5+p.z*.6)];
const fmt=p=>p.map(n=>n.toFixed(2)).join(',');
function boxMarkup(p,w=.22,h=.26,d=.22,color='#ffb16c'){
 const a=project({x:p.x-w/2,y:p.y+h/2,z:p.z+d/2}),b=project({x:p.x+w/2,y:p.y+h/2,z:p.z+d/2}),c=project({x:p.x+w/2,y:p.y+h/2,z:p.z-d/2}),e=project({x:p.x-w/2,y:p.y+h/2,z:p.z-d/2});
 const f=project({x:p.x+w/2,y:p.y-h/2,z:p.z+d/2}),g=project({x:p.x+w/2,y:p.y-h/2,z:p.z-d/2}),i=project({x:p.x-w/2,y:p.y-h/2,z:p.z+d/2});
 return `<polygon points="${[a,b,f,i].map(fmt).join(' ')}" fill="${color}" stroke="#141b1c"/><polygon points="${[b,c,g,f].map(fmt).join(' ')}" fill="#ae6b34"/><polygon points="${[a,b,c,e].map(fmt).join(' ')}" fill="#ffd0a4" stroke="#232c25"/>`;
}
function makeSVG(view){const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 700 520');svg.setAttribute('role','img');svg.setAttribute('aria-label','Animated robot pick and place demonstration');svg.classList.add('robot-svg');view.append(svg);view.classList.add('demo-ready');return svg;}
const svgs=views.map(makeSVG);
function draw(svg,motion){
 svg.setAttribute('viewBox',svg.parentElement.clientWidth<=520?'70 35 590 485':'0 0 700 520');
 const pose=state.manual?{...motion.pose,...state.pose}:motion.pose,j=jointPositions(pose),coords=Object.fromEntries(Object.entries(j).map(([k,v])=>[k,project(v)]));
 const armLine=(a,b,width,color)=>`<line x1="${coords[a][0]}" y1="${coords[a][1]}" x2="${coords[b][0]}" y2="${coords[b][1]}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
 const top=project({...j.tip,y:j.tip.y+.24}),end=project(j.tip),gap=9+motion.grip*14;
 const box=motion.attached?j.tip:motion.box;
 let grid='';for(let i=-3;i<=3;i++){const a=project({x:i,y:0,z:-3}),b=project({x:i,y:0,z:3}),c=project({x:-3,y:0,z:i}),d=project({x:3,y:0,z:i});grid+=`<path d="M${fmt(a)}L${fmt(b)}M${fmt(c)}L${fmt(d)}" stroke="#3b4d3b" stroke-width=".6"/>`;}
 svg.innerHTML=`<ellipse cx="338" cy="427" rx="252" ry="68" fill="#19221b" stroke="#506844"/>${grid}${[BAY_A,BAY_B].map((p,i)=>boxMarkup({...p,y:.08},.72,.16,.72,'#384b3b')+`<text x="${project(p)[0]}" y="${project(p)[1]+43}" text-anchor="middle" fill="#9dbb9b" font-family="monospace" font-size="12">BAY ${i?'B':'A'}</text>`).join('')}${boxMarkup({x:0,y:.28,z:0},.75,.56,.75,'#384447')}${armLine('base','shoulder',30,'#323e40')}${armLine('shoulder','elbow',31,'#647978')}${armLine('shoulder','elbow',23,'#ff8a45')}${armLine('elbow','wrist',25,'#758e8b')}${armLine('elbow','wrist',17,'#ff9b58')}${['shoulder','elbow','wrist'].map(k=>`<circle cx="${coords[k][0]}" cy="${coords[k][1]}" r="${k==='shoulder'?21:16}" fill="#19272b" stroke="#9cafaa" stroke-width="5"/><circle cx="${coords[k][0]}" cy="${coords[k][1]}" r="7" fill="#ff8a45"/>`).join('')}${armLine('wrist','tip',10,'#788f92')}${boxMarkup(box)}<path d="M${top[0]-gap},${top[1]}H${top[0]+gap}" stroke="#27393c" stroke-width="13"/><path d="M${top[0]-gap},${top[1]}V${end[1]+9}h5 M${top[0]+gap},${top[1]}V${end[1]+9}h-5" fill="none" stroke="#c4d9d8" stroke-width="5" stroke-linejoin="round"/><text x="30" y="35" fill="#ff8a45" font-size="12" font-family="monospace">PICK / TRANSFER / PLACE</text>`;
 svg.dataset.phase=motion.phase;svg.dataset.grip=motion.grip.toFixed(3);svg.dataset.boxX=box.x.toFixed(3);svg.dataset.boxY=box.y.toFixed(3);svg.dataset.boxZ=box.z.toFixed(3);svg.dataset.transfers=motion.transfers;
}
function render(m){state.robotMotion=m;svgs.forEach((svg,i)=>{if(!views[i].classList.contains('scene-ready'))draw(svg,m);});
 $('#cycle-count').textContent=m.transfers+' '+(m.transfers===1?'transfer':'transfers');
 const label=state.estop?'Emergency stop · Reset required':state.manual?'Manual joints':!state.running&&m.time>0&&!m.completed?'Paused · '+m.phase:m.phase;
 if(label!==lastPhase){$('#cycle-phase').textContent=label;lastPhase=label;}
 state.programActive=m.time>0&&!m.completed;['base','shoulder','elbow'].forEach(k=>$('#'+k).disabled=state.estop||state.programActive);
 if(!state.manual){for(const k of ['base','shoulder','elbow']){$('#'+k+'-value').textContent=m.pose[k].toFixed(0)+'°';$('#'+k).value=m.pose[k];}}
}
function request(){if(!frameId&&!document.hidden&&!$('dialog[open]'))frameId=requestAnimationFrame(frame);}
function frame(now){frameId=0;const dt=last?Math.min(.08,(now-last)/1000):0;last=now;
 if(document.hidden||!visible||$('dialog[open]')){last=0;return;}
 let motion=program.sample();if(state.running&&!state.estop&&state.ambient&&!state.manual)motion=program.tick(dt,.3+state.speed*1.7);
 render(motion);if(motion.completed&&state.running){state.running=false;$('#hmi-state').textContent='DONE';$('#hmi-caption').textContent='Start to reverse the transfer';$('#hero-start').textContent='▶ Move the box back';dispatchEvent(new CustomEvent('machine:change'));}
 if(state.running&&!state.estop&&state.ambient){frameId=requestAnimationFrame(frame);}else last=0;
}
addEventListener('robot:command',e=>{if(e.detail==='reset')render(program.reset());else if(e.detail==='start')render(program.start());else if(e.detail==='stop')render(program.stop());last=0;request();});
addEventListener('machine:change',()=>{render(program.sample());request();});addEventListener('portfolio:dialog',()=>{last=0;request();});document.addEventListener('visibilitychange',()=>{last=0;request();});
const visibility=new Map(views.map(v=>[v,false]));new IntersectionObserver(entries=>{entries.forEach(e=>visibility.set(e.target,e.isIntersecting));visible=[...visibility.values()].some(Boolean);last=0;request();}).observe(views[0]);
const controlObserver=new IntersectionObserver(entries=>{entries.forEach(e=>visibility.set(e.target,e.isIntersecting));visible=[...visibility.values()].some(Boolean);last=0;request();});controlObserver.observe(views[1]);
$('#machine-controls').disabled=false;$('#robot-state').textContent='Ready · press Start to move the box';render(program.sample());request();
