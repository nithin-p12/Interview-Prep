/* =====================================================================
   CODING PRACTICE — trace engine (07_Interview/01_Coding/engine)
   Load AFTER ../../_shared/deck.js (uses macHTML, markLines, DECK, ESC).
   A problem page calls ALGO.page(cfg) once. cfg.run(input) returns FRAMES;
   each frame is one moment of the running code:
     { line: 4 | [2,3],          // code line(s) to highlight
       chunk: 0..3,              // which of the 4 memory chunks we are in
       msg: 'html',              // what is happening (step mode) / caption (overview)
       arr: { name, vals, ptr:{i:2}, pcol:{i:'y'}, cls:{2:'cur'}, tags:{4:'+5'}, bars:false },
       ds:  [ { kind:'map'|'set'|'list'|'stack'|'queue', name, decl,
                rows:[[k,v]] | items:[…], hl:{key|index:'new'|'hit'|'out'}, probe:{t,ok}, cols:[…] } ],
       vars:[ [name, value, 'res'?] ],   // changed values flash automatically
       out: '[0, 1]',            // final answer
       fly: ['a3','m2','2'] }    // a value flies from data-fk a3 (array cell) to m2 (map row)
   Placeholders on the page: #prob #ov #st #rem #cx
   ===================================================================== */
const ALGO=(function(){
 const CK=['#3B82F6','#9333EA','#F97316','#22C55E'];           // chunk colours ① ② ③ ④
 const $=(s,r=document)=>r.querySelector(s);
 const fmt=v=>v===Infinity||v===2147483647?'MAX':v===-Infinity?'MIN':v;

 // ---------------------------------------------------------- pieces
 function arrHTML(a){
  if(!a)return'';
  const ptrAt=i=>Object.entries(a.ptr||{}).filter(([,x])=>x===i).map(([l])=>`<span class="${(a.pcol||{})[l]||''}">${l}</span>`).join('');
  const max=Math.max(...a.vals.map(Math.abs),1);
  const cells=a.vals.map((v,i)=>{const c=(a.cls||{})[i]||'',tg=(a.tags||{})[i];
   if(a.bars){const h=18+Math.round(Math.abs(v)/max*104);
    return `<div class="cell ${c}" data-fk="a${i}">${tg!=null?`<span class="tg" style="top:${-20}px">${tg}</span>`:''}<div style="height:${124-h}px"></div><div class="bar" style="height:${h}px"><b>${v}</b></div><div class="ix">${i}</div><div class="pb">${ptrAt(i)}</div></div>`;}
   return `<div class="cell ${c}" data-fk="a${i}"><div class="pp">${ptrAt(i)}</div>${tg!=null?`<span class="tg">${tg}</span>`:''}<div class="v">${v}</div><div class="ix">${i}</div></div>`;}).join('');
  return `<div class="panel"><div class="pt">array <code>${a.decl||'int[]'} ${a.name}</code>${a.note?`<span style="text-transform:none;letter-spacing:0;font-weight:700">${a.note}</span>`:''}</div><div class="arr${a.bars?' bars':''}">${cells}</div></div>`;}

 function dsHTML(d){
  const hl=d.hl||{},kind={map:'HashMap',set:'HashSet',list:'List',stack:'Stack (Deque)',queue:'Queue'}[d.kind]||d.kind;
  let body='';
  if(d.kind==='map'){
   const cols=d.cols||['key','value'];
   body=(d.probe?`<div class="probe ${d.probe.ok?'y':'n'}">${d.probe.t} → ${d.probe.ok?'✓ true':'✗ false'}</div>`:'')+
    (d.rows.length?`<div class="map"><div class="mh"><span>${cols[0]}</span><i></i><span>${cols[1]}</span></div>${d.rows.map(([k,v])=>`<div class="mr ${hl[k]||''}" data-fk="m${k}"><span>${k}</span><i>→</i><span>${v}</span></div>`).join('')}</div>`:'<div class="empty">{ }  empty</div>');
  }else{
   const items=d.items||[],col=d.kind==='stack';
   const cell=(v,i)=>`<span class="${hl[i]||''}" data-fk="${d.kind[0]}${i}">${v}</span>`;
   body=(d.probe?`<div class="probe ${d.probe.ok?'y':'n'}">${d.probe.t} → ${d.probe.ok?'✓ true':'✗ false'}</div>`:'')+
    (items.length?`<div class="seq${col?' col':''}">${d.kind==='queue'?'<small>front</small>':''}${items.map(cell).join('')}${d.kind==='queue'?'<small>back</small>':col?'<small>bottom</small>':''}</div>`:'<div class="empty">[ ]  empty</div>');
  }
  return `<div class="panel"><div class="pt">${kind} <code>${d.decl?d.decl+' ':''}${d.name}</code>${d.note?`<span style="text-transform:none;letter-spacing:0;font-weight:700">${d.note}</span>`:''}</div>${body}</div>`;}

 function varsHTML(vars,prev){
  if(!vars||!vars.length)return'';
  const old=new Map((prev||[]).map(v=>[v[0],v[1]]));
  return `<div class="panel" style="flex:0 1 auto"><div class="pt">variables</div><div class="vars">${vars.map(([n,v,c])=>{
   const chg=prev&&(!old.has(n)||old.get(n)!==v);return `<div class="var ${c||''} ${chg?'chg':''}" data-fk="v${n}"><small>${n}</small><b>${fmt(v)}</b></div>`;}).join('')}</div></div>`;}

 // ---------------------------------------------------------- tracer (overview = auto loop, step = manual + code)
 function tracer(host,o){
  const ov=o.mode==='auto',chunks=o.chunks||[];
  host.classList.add('tr');if(ov)host.classList.add('ov');
  const fields=o.fields||[];
  host.innerHTML=`<div class="ctl">
    <button class="btn" data-a="prev" title="Previous step">◀ Prev</button><button class="btn p" data-a="next" title="Next step">Next ▶</button>
    <button class="btn" data-a="play">${ov?'⏸ Pause':'▶ Auto play'}</button><button class="btn" data-a="reset" title="Restart">↺</button>
    <span class="spd"></span><input type="range" min="0" value="0" title="Scrub through the run"><span class="cnt"></span></div>
   ${!ov&&fields.length?`<div class="inp">Try your own input:${fields.map(f=>`<label>${f.label||f.k} <input class="${f.type==='num'?'num':''}" data-k="${f.k}" value="${f.type==='arr'?'['+o.input[f.k].join(', ')+']':o.input[f.k]}"></label>`).join('')}<button class="btn" data-a="run">Run ▶</button><span class="err"></span></div>`:''}
   <div class="body"><div class="viz"><div class="vz"></div><div class="tmsg"></div></div>${ov?'':`<div class="side code"></div>`}</div>`;
  const vz=$('.vz',host),msg=$('.tmsg',host),rng=$('input[type=range]',host),cnt=$('.cnt',host),playB=$('[data-a=play]',host);
  let mac=null;
  if(!ov){const side=$('.side',host);side.innerHTML=macHTML(o.file,o.code,'java');mac=$('.mac',side);paintChunks(mac,chunks,false);}
  let frames=o.run(o.input),i=0,timer=null,spd=0.5,shown=false;
  const ms=()=>(ov?750:900)/spd;
  function draw(from){
   const f=frames[i],p=frames[i-1];
   let r0=null;
   if(f.fly&&from===i-1){const el=host.querySelector(`[data-fk="${f.fly[0]}"]`);if(el)r0=el.getBoundingClientRect();}
   vz.innerHTML=arrHTML(f.arr)+`<div class="dsrow">${(f.ds||[]).map(dsHTML).join('')}${varsHTML(f.vars,p&&p.vars)}</div>`+(f.out!=null?`<div class="tout">return ${f.out}</div>`:'');
   const ck=chunks[f.chunk];
   msg.innerHTML=(ck?`<span class="chunkpill" style="background:${CK[f.chunk]}">${f.chunk+1} ${ck.t}</span>`:'')+(f.msg||'');
   if(mac){const ls=f.line==null?[]:[].concat(f.line);markLines(mac,ls,false);}
   rng.max=frames.length-1;rng.value=i;cnt.textContent=`step ${i+1} / ${frames.length}`;
   $('[data-a=prev]',host).disabled=i===0;$('[data-a=next]',host).disabled=i===frames.length-1;
   if(r0)fly(r0,f.fly);}
  function fly(r0,[,to,txt]){
   const el=host.querySelector(`[data-fk="${to}"]`);if(!el)return;
   const h=host.getBoundingClientRect(),r1=el.getBoundingClientRect(),d=document.createElement('div');
   d.className='fly';d.textContent=txt;host.appendChild(d);
   const cx0=r0.left+r0.width/2,cy0=r0.top+r0.height/2,cx1=r1.left+Math.min(r1.width/2,40),cy1=r1.top+r1.height/2;
   d.style.left=(cx0-h.left-d.offsetWidth/2)+'px';d.style.top=(cy0-h.top-d.offsetHeight/2)+'px';
   requestAnimationFrame(()=>requestAnimationFrame(()=>{d.style.transform=`translate(${cx1-cx0}px,${cy1-cy0}px)`;}));
   setTimeout(()=>{d.style.opacity='0';},Math.min(800,ms()-100));setTimeout(()=>d.remove(),1100);}
  function go(n){const from=i;i=Math.max(0,Math.min(frames.length-1,n));draw(from);}
  function stop(){clearTimeout(timer);timer=null;playB.textContent='▶ '+(ov?'Play':'Auto play');}
  function play(){playB.textContent='⏸ Pause';const tick=()=>{
    if(i>=frames.length-1){if(!ov){stop();return;}timer=setTimeout(()=>{go(0);timer=setTimeout(tick,ms());},ms()*2.2);return;}
    go(i+1);timer=setTimeout(tick,ms());};
   clearTimeout(timer);timer=setTimeout(tick,ms());}
  host.querySelector('.ctl').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
   if(a==='prev'){stop();go(i-1);}if(a==='next'){stop();go(i+1);}
   if(a==='reset'){go(0);if(timer)play();}
   if(a==='play'){if(timer)stop();else{if(i>=frames.length-1)go(0);play();}}});
  rng.oninput=()=>{stop();go(+rng.value);};
  DECK.speed($('.spd',host),v=>{spd=v;if(timer)play();});
  const inp=$('.inp',host);
  if(inp)inp.addEventListener('click',e=>{if(!e.target.closest('[data-a=run]'))return;
   const err=$('.err',inp),input={...o.input};
   for(const f of fields){const raw=$(`[data-k="${f.k}"]`,inp).value;
    if(f.type==='arr'){const a=(raw.match(/-?\d+/g)||[]).map(Number);if(a.length<(f.min||1)||a.length>(f.max||10)){err.textContent=`${f.k}: ${f.min||1}–${f.max||10} numbers`;return;}input[f.k]=a;}
    else{const n=parseInt(raw,10);if(isNaN(n)){err.textContent=`${f.k}: a number`;return;}input[f.k]=n;}}
   err.textContent='';stop();frames=o.run(input);go(0);});
  document.addEventListener('slide-shown',e=>{shown=e.detail.contains(host);if(ov){if(shown&&!timer)play();if(!shown)stop();}});
  draw(-1);
  return {go,play,stop};}

 // ---------------------------------------------------------- code with coloured chunks
 function paintChunks(mac,chunks,badges){
  chunks.forEach((c,ci)=>c.lines.forEach((n,j)=>{const ln=mac.querySelector(`.ln[data-l="${n}"]`);if(!ln)return;
   ln.classList.add('ck');ln.style.setProperty('--ck',CK[ci]);
   if(badges&&j===0)ln.insertAdjacentHTML('beforeend',`<span class="cbg">${ci+1} ${c.t}</span>`);}));}

 // ---------------------------------------------------------- slides
 function prob(cfg){const el=$('#prob');if(!el)return;
  el.innerHTML=`<div class="box"><h4>Problem</h4><p class="lead">${cfg.statement}</p>
   ${cfg.examples.map(([a,b])=>`<div class="ex" style="margin-top:6px">${a}<br>→ ${b}</div>`).join('')}</div>
   <div class="stack"><div class="box"><h4>Key idea</h4><p class="lead">${cfg.idea}</p><div class="tagrow">${cfg.tags.map(t=>`<span class="chip ${t[1]||'no'}">${t[0]}</span>`).join('')}</div></div>
   <div class="mnem" style="--bd:${CK[0]}"><div class="letters">${cfg.mnem.letters.map((l,i)=>`<span style="background:${CK[i]}">${l}</span>`).join('')}</div><div class="ph">${cfg.mnem.phrase}<small>${cfg.mnem.sub}</small></div></div></div>`;}

 function remember(cfg){const el=$('#rem');if(!el)return;
  el.innerHTML=`<div class="cols even">
   <div class="stack">
    <div class="mnem"><div class="letters">${cfg.mnem.letters.map((l,i)=>`<span style="background:${CK[i]}">${l}</span>`).join('')}</div><div class="ph">${cfg.mnem.phrase}<small>${cfg.mnem.sub}</small></div></div>
    <div class="box"><h4>① Declare these first</h4><table class="decl"><tr><th>Variable</th><th>Type</th><th>Start value</th><th>Why</th></tr>
     ${cfg.declare.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>
    <div class="box"><h4>Split the code into 4 chunks <small style="color:var(--muted);font-weight:600">(click one)</small></h4><div class="chunks">${cfg.chunks.map((c,i)=>`<div class="chunk" data-c="${i}" style="--ck:${CK[i]}"><i>${i+1}</i><div><b>${c.t}</b><small>${c.d}</small></div></div>`).join('')}</div></div>
   </div>
   <div class="stack"><div class="code rem-code"></div>
    <div class="box"><h4>Approach in one breath</h4><p class="lead">${cfg.approach}</p></div>
    <div class="box" style="border-color:#FCA5A5"><h4>⚠ What I usually forget</h4><ul class="forget">${cfg.forget.map(x=>`<li>${x}</li>`).join('')}</ul></div></div></div>`;
  const box=$('.rem-code',el);box.innerHTML=macHTML(cfg.file,cfg.code,'java');const mac=$('.mac',box);mac.classList.add('big');
  paintChunks(mac,cfg.chunks,true);
  el.addEventListener('click',e=>{const c=e.target.closest('.chunk');if(!c)return;const on=!c.classList.contains('on');
   el.querySelectorAll('.chunk').forEach(x=>x.classList.toggle('on',x===c&&on));markLines(mac,on?cfg.chunks[+c.dataset.c].lines:[],true);});}

 function complexity(cfg){const el=$('#cx');if(!el)return;const cx=cfg.cx;
  el.innerHTML=`<div class="cols even"><div class="stack">
    <div class="big-o"><div><small>Time</small><b>${cx.time}</b><span>${cx.timeWhy}</span></div><div><small>Space</small><b>${cx.space}</b><span>${cx.spaceWhy}</span></div></div>
    <div class="box"><h4>Approaches compared</h4><table class="t"><tr><th>Approach</th><th>Time</th><th>Space</th><th>Note</th></tr>
     ${cx.rows.map(r=>`<tr class="${r[4]?'best':''}"><td><b>${r[0]}</b></td><td><code>${r[1]}</code></td><td><code>${r[2]}</code></td><td>${r[3]}</td></tr>`).join('')}</table></div>
    <div class="box"><h4>Feel the difference <small style="color:var(--muted);font-weight:600">— operations for n elements (≈10⁸ simple ops / second)</small></h4>
     <div class="race"><input type="range" min="1" max="6" value="4"><div class="rows"></div></div></div></div>
   <div class="stack"><div class="box"><h4>Interview follow-ups</h4><ul class="forget">${cx.follow.map(([q,a])=>`<li><b>${q}</b><br>${a}</li>`).join('')}</ul></div>
    ${cx.gtk?`<div class="gtk"><b>Good to know</b>${cx.gtk}</div>`:''}</div></div>`;
  const rng=$('.race input',el),rows=$('.race .rows',el);
  const human=s=>s<1e-3?(s*1e6).toFixed(0)+' µs':s<1?(s*1e3).toFixed(0)+' ms':s<120?s.toFixed(1)+' s':s<7200?(s/60).toFixed(0)+' min':(s/3600).toFixed(0)+' h';
  const big=x=>x>=1e9?(x/1e9).toFixed(1)+' B':x>=1e6?(x/1e6).toFixed(1)+' M':x>=1e3?(x/1e3).toFixed(1)+' K':Math.round(x);
  function draw(){const n=10**+rng.value,vals=cx.race.map(r=>r.f(n)),mx=Math.max(...vals);
   rows.innerHTML=`<div class="rr"><b>n = ${n.toLocaleString()}</b><span></span><span></span></div>`+cx.race.map((r,i)=>`<div class="rr"><b style="color:${r.col}">${r.label}</b><div class="track"><div class="fill" style="width:${Math.max(.6,vals[i]/mx*100)}%;background:${r.col}"></div></div><span>${big(vals[i])} ops · ${human(vals[i]/1e8)}</span></div>`).join('');}
  rng.oninput=draw;draw();}

 function page(cfg){
  prob(cfg);
  const ov=$('#ov'),st=$('#st');
  if(ov)tracer(ov,{mode:'auto',run:cfg.run,input:cfg.overview,chunks:cfg.chunks});
  if(st)tracer(st,{mode:'step',run:cfg.run,input:cfg.step,fields:cfg.fields,chunks:cfg.chunks,code:cfg.code,file:cfg.file});
  remember(cfg);complexity(cfg);}
 return {page,tracer,CK};
})();
