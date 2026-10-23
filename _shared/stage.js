/* =====================================================================
   BIG PICTURE STAGE — one architecture diagram, re-framed per slide.
   Include AFTER deck.js:  <script src="../_shared/stage.js"></script>
   Page contract:
     <div class="stage-wrap" id="stage"><svg viewBox="0 0 W H"> … </svg></div>   (anywhere, once)
       [data-node="eden"]           a component (group). data-tip="<b>Eden</b>…" = hover text
       path[data-flow="alloc"]      a flow; moving dots run along it.
          data-nodes="stacks,eden"  components it belongs to (dimmed with them)
          data-color, data-dots (default 3), data-dur (ms per lap, default 2600)
     Slides opt in with a slot:
       <div class="stage-slot" data-cam="all"></div>                    big picture, full slide
       <div class="focus"><div class="stage-slot" data-cam="eden,s0,s1" data-show="old"></div><div class="fx">…</div></div>
          data-cam  = components to frame + highlight;  data-show = also keep visible (not dimmed)
          data-pad  = padding around the camera box in world units (default 26)
   API: STAGE.onTick(fn(dt))  STAGE.onArrive('flow', fn)  STAGE.node('eden')  STAGE.pulse('gc')
   ===================================================================== */
const STAGE=(function(){
 const wrap=document.querySelector('.stage-wrap');if(!wrap)return null;
 const svg=wrap.querySelector('svg');const NS='http://www.w3.org/2000/svg';
 const vb0=svg.viewBox.baseVal,WORLD=[vb0.x,vb0.y,vb0.width,vb0.height];
 svg.setAttribute('preserveAspectRatio','xMidYMid meet');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const slots=[...document.querySelectorAll('.stage-slot')];
 slots.forEach(s=>s.closest('.slide').classList.add('stg'));
 const NODES={};svg.querySelectorAll('[data-node]').forEach(n=>NODES[n.dataset.node]=n);
 const BB={};
 const bbox=name=>{if(BB[name])return BB[name];const n=NODES[name];if(!n)return null;const b=n.getBBox();if(!b.width)return null;return BB[name]=[b.x,b.y,b.width,b.height];};

 // ---- controls: pause, speed, details-on-hover
 const st={run:true,sp:1,tips:false};
 wrap.insertAdjacentHTML('beforeend',`<div class="stg-bar"><button data-b="pp" class="on" title="Pause / play the animation">⏸ Pause</button>${[0.5,1,2].map(v=>`<button data-v="${v}" class="${v===1?'on':''}">${v}×</button>`).join('')}<label title="Show explanations when you hover a part"><input type="checkbox" data-b="tips"> Details on hover</label></div><div class="stg-tip"></div>`);
 const bar=wrap.querySelector('.stg-bar'),tip=wrap.querySelector('.stg-tip'),pp=bar.querySelector('[data-b=pp]');
 bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.b==='pp'){st.run=!st.run;pp.textContent=st.run?'⏸ Pause':'▶ Play';pp.classList.toggle('on',st.run);}
  if(b.dataset.v){st.sp=+b.dataset.v;bar.querySelectorAll('[data-v]').forEach(x=>x.classList.toggle('on',x===b));}});
 bar.querySelector('[data-b=tips]').addEventListener('change',e=>{st.tips=e.target.checked;wrap.classList.toggle('tips',st.tips);e.target.parentElement.classList.toggle('on',st.tips);if(!st.tips)tip.classList.remove('on');});
 svg.addEventListener('mousemove',e=>{if(!st.tips)return;const n=e.target.closest('[data-tip]');if(!n||n.classList.contains('stg-dim')){tip.classList.remove('on');return;}
  tip.innerHTML=n.dataset.tip;const r=wrap.getBoundingClientRect();let x=e.clientX-r.left+14,y=e.clientY-r.top+14;
  tip.classList.add('on');const w=tip.offsetWidth,h=tip.offsetHeight;if(x+w>r.width-6)x=e.clientX-r.left-w-14;if(y+h>r.height-6)y=e.clientY-r.top-h-14;tip.style.left=x+'px';tip.style.top=y+'px';});
 svg.addEventListener('mouseleave',()=>tip.classList.remove('on'));

 // ---- flows with moving dots
 const dotLayer=document.createElementNS(NS,'g');dotLayer.setAttribute('class','stg-dots');svg.appendChild(dotLayer);
 const FLOWS=[...svg.querySelectorAll('path[data-flow]')].map(p=>{const n=+(p.dataset.dots||3),col=p.dataset.color||'#3B82F6';
  const dots=Array.from({length:n},(_,i)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('r',p.dataset.r||5.5);c.setAttribute('fill',col);dotLayer.appendChild(c);return {o:i/n,el:c};});
  return {p,name:p.dataset.flow,nodes:(p.dataset.nodes||'').split(',').filter(Boolean),dur:+(p.dataset.dur||2600),dots,L:0};});
 const TICKS=[],ARR={};
 const visible=()=>document.body.classList.contains('all')||!!wrap.closest('.slide.on');
 let last=performance.now();
 (function frame(){requestAnimationFrame(frame);const t=performance.now(),dt=Math.min(60,Math.max(0,t-last));last=t;
  if(!st.run||!visible())return;const d=dt*st.sp;
  for(const f of FLOWS){if(!f.L)f.L=f.p.getTotalLength();if(!f.L)continue;
   for(const dot of f.dots){const prev=dot.o;dot.o=(dot.o+d/f.dur)%1;if(dot.o<prev&&ARR[f.name])ARR[f.name].forEach(fn=>fn());
    const q=f.p.getPointAtLength(f.L*dot.o);dot.el.setAttribute('cx',q.x.toFixed(1));dot.el.setAttribute('cy',q.y.toFixed(1));}}
  TICKS.forEach(fn=>fn(d));})();

 // ---- camera
 let cur=null,anim=0;
 const setVB=v=>{cur=v;svg.setAttribute('viewBox',v.map(n=>n.toFixed(2)).join(' '));};
 function camFor(slot,el){const names=(slot.dataset.cam||'all').split(',').map(s=>s.trim());let r;
  if(names[0]==='all')r=WORLD.slice();
  else{let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;names.forEach(n=>{const b=bbox(n);if(!b)return;x1=Math.min(x1,b[0]);y1=Math.min(y1,b[1]);x2=Math.max(x2,b[0]+b[2]);y2=Math.max(y2,b[1]+b[3]);});
   if(x1>x2)r=WORLD.slice();else{const p=+(slot.dataset.pad||26);r=[x1-p,y1-p,x2-x1+2*p,y2-y1+2*p];}}
  // widen/heighten the box to the slot's shape so neighbours show (dimmed) around the focus
  const w=(el||slot).clientWidth||1,h=(el||slot).clientHeight||1,a=w/h;
  // never zoom past MAXZ screen px per world unit (keeps text at normal size; extra room shows dimmed context)
  const MAXZ=+(wrap.dataset.maxzoom||1.15),minW=w/MAXZ;if(r[2]<minW){r[0]-=(minW-r[2])/2;r[2]=minW;}
  const minH=h/MAXZ;if(r[3]<minH){r[1]-=(minH-r[3])/2;r[3]=minH;}
  if(r[2]/r[3]<a){const nw=r[3]*a;r[0]-=(nw-r[2])/2;r[2]=nw;}else{const nh=r[2]/a;r[1]-=(nh-r[3])/2;r[3]=nh;}
  const fitIn=(o,s,W0,WS)=>s>=WS?W0+(WS-s)/2:Math.min(Math.max(o,W0),W0+WS-s);
  r[0]=fitIn(r[0],r[2],WORLD[0],WORLD[2]);r[1]=fitIn(r[1],r[3],WORLD[1],WORLD[3]);
  return r;}
 function focus(root,slot){const cam=(slot.dataset.cam||'all').split(',').map(s=>s.trim()),show=(slot.dataset.show||'').split(',').map(s=>s.trim());
  const all=cam[0]==='all',keep=n=>all||cam.includes(n)||show.includes(n);
  root.querySelectorAll('[data-node]').forEach(n=>{const nm=n.dataset.node;n.classList.toggle('stg-dim',!keep(nm));n.classList.toggle('stg-foc',!all&&cam.includes(nm));});
  root.querySelectorAll('path[data-flow]').forEach(p=>{const ns=(p.dataset.nodes||'').split(',');p.classList.toggle('stg-dim',!all&&!ns.some(keep));});
  if(root===svg)FLOWS.forEach(f=>{const off=!all&&!f.nodes.some(keep);f.dots.forEach(d=>d.el.style.opacity=off?.13:1);});}
 const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
 function tween(to){cancelAnimationFrame(anim);if(!cur||reduce){setVB(to);return;}
  const from=cur.slice(),t0=performance.now(),D=850;
  (function step(){const u=Math.min(1,(performance.now()-t0)/D),e=ease(u);setVB(from.map((v,i)=>v+(to[i]-v)*e));if(u<1)anim=requestAnimationFrame(step);})();}
 function show(sl){if(document.body.classList.contains('all'))return;const slot=sl&&sl.querySelector('.stage-slot');if(!slot)return;
  if(wrap.parentElement!==slot)slot.appendChild(wrap);
  if(!cur)setVB(WORLD.slice());tween(camFor(slot));focus(svg,slot);}
 document.addEventListener('slide-shown',e=>show(e.detail));
 // the deck may already have shown its first slide while this file was loading
 {const on=document.querySelector('.slide.on');if(on)show(on);}
 let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{const sl=wrap.closest('.slide.on');if(sl&&!document.body.classList.contains('all')){cancelAnimationFrame(anim);setVB(camFor(wrap.parentElement));}},150);});

 // ---- show-all mode: the live diagram stays in the first slot, the others get static clones
 function allMode(on){slots.forEach(s=>s.querySelectorAll('.stg-clone').forEach(c=>c.remove()));
  if(!on){const sl=document.querySelector('.slide.on');if(sl)show(sl);return;}
  slots[0].appendChild(wrap);
  requestAnimationFrame(()=>{setVB(WORLD.slice());focus(svg,slots[0]);
   slots.slice(1).forEach(s=>{const c=svg.cloneNode(true);c.classList.add('stg-clone');c.removeAttribute('id');c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
    s.appendChild(c);c.setAttribute('viewBox',camFor(s,s).join(' '));focus(c,s);});});}
 new MutationObserver(()=>{const on=document.body.classList.contains('all');if(on!==allMode.on){allMode.on=on;allMode(on);}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 allMode.on=document.body.classList.contains('all');if(allMode.on)setTimeout(()=>allMode(true),50);

 return {
  onTick:fn=>TICKS.push(fn),
  onArrive:(name,fn)=>(ARR[name]=ARR[name]||[]).push(fn),
  node:n=>NODES[n],
  pulse(n,cls='stg-pulse',ms=900){const el=NODES[n];if(!el)return;el.classList.remove(cls);void el.getBBox();el.classList.add(cls);clearTimeout(el._p);el._p=setTimeout(()=>el.classList.remove(cls),ms);},
  get running(){return st.run&&visible();}};
})();
