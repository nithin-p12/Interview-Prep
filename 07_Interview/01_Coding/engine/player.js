/* =====================================================================
   CODING PRACTICE — problem page = 2 screens (07_Interview/01_Coding/engine/player.js)
   Load after ds.js. A problem page calls PLAYER.start(cfg):
     cfg = { title, sub, code,
             problem: {text, example, pattern},                 // strip on top of screen 1
             viz: {kind, opts, title},                          // block 2 (the input picture)
             ds:  [{id, kind, decl, note, opts}], dsNote,       // block 3 (dsNote when no structure)
             input: {label, value, presets:[…], parse(str) → input (throw 'message' if bad)},
             run(input) → steps,
             remember: { mnem:{letters, phrase, sub}, chunks:[{t, d, lines}], declare:[['Java declaration line', 'why']],
                         forget:[html], cx:{time,timeWhy,space,spaceWhy, rows:[[approach,time,space,note,best]], follow:[[q,a]]} } }
     step  = { line:[n…], ann:{n:'inline value'}, text, tone:'bad'|'good'|'', viz:{…}, ds:{id:{…}}, vars:[{t,note,v:[[name,value]]}], result }
   Screen 1 · Run it: 🐞 Debug (Step over: F8 / → / Space, ← back) or ▶ Auto.
   Screen 2 · Remember it: shortcut, variables to declare, code in 4 chunks, traps, time & space, follow-ups.
   ===================================================================== */
const PLAYER=(function(){
 const store={get(k,d){try{return localStorage.getItem(k)??d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
 const CK=['#3B82F6','#9333EA','#F97316','#16A34A'];
 function start(cfg){
  const R=cfg.remember,P=cfg.problem;
  document.body.innerHTML=`
  <header class="ptop"><a href="00_Coding_Practice.html" title="All problems">← Coding</a><h1>${cfg.title}</h1>
   <nav class="scr" id="scr"><button data-s="run">▶ 1 · Run it</button><button data-s="rem">📌 2 · Remember it</button></nav>
   <div class="mode" id="mode"><button data-m="debug" title="You press Step over for every line">🐞 Debug</button><button data-m="auto" title="Plays by itself">▶ Auto</button></div></header>

  <section class="screen" id="s-run">
   <div class="pstrip" id="pstrip"><span class="chip2">${P.pattern}</span><span class="pt">${P.text}</span><span class="ex">${P.example}</span><button class="lnk" id="hidep" title="Hide / show the problem">hide</button></div>
   <div class="pbar">
    <span id="dbg"><button class="btn" data-a="back" title="Step back (←)">◀ Back</button> <button class="btn p" data-a="step" title="Step over (F8 / → / Space)">Step over ▶</button></span>
    <span id="aut"><button class="btn p" data-a="play">⏸ Pause</button> <span class="seg" id="spd"><button data-v="0.5">slow</button><button data-v="1" class="on">normal</button><button data-v="2">fast</button></span></span>
    <button class="btn" data-a="restart" title="Back to the first step">↺ Restart</button><span class="n" id="n"></span><span class="kbd" id="hint"></span>
    <span class="grow"></span>
    <label>${cfg.input.label}</label><input class="in" id="inp" value="${cfg.input.value}"><button class="btn" data-a="run">Run</button>
    ${(cfg.input.presets||[]).map(p=>`<button class="btn pre" data-p="${p}">${p}</button>`).join('')}
    <span id="res"></span></div>
   <main class="grid4">
    <section class="blk b-code"><h3><span>1</span>Code</h3><div id="code"></div></section>
    <section class="blk b-viz"><h3><span>2</span>Visualize${cfg.viz.title?` <em>· ${cfg.viz.title}</em>`:''}</h3><div class="in"><div class="vizbox"><div id="viz"></div></div><div class="caption" id="cap"></div></div></section>
    <div class="b-low${cfg.ds.length?'':' nods'}">
     <section class="blk b-ds"><h3><span>3</span>Data structures</h3><div class="in" id="dsl">${cfg.ds.length?cfg.ds.map(d=>`<div class="dsitem"><div class="dt">${d.decl}${d.note?`<small>${d.note}</small>`:''}</div><div data-ds="${d.id}"></div></div>`).join(''):`<div class="dsitem nods">${cfg.dsNote||'No extra data structure.'}</div>`}</div></section>
     <section class="blk b-var"><h3><span>4</span>Variables</h3><div class="in" id="vl"></div></section>
    </div>
   </main>
  </section>

  <section class="screen" id="s-rem"><main class="rem3">
   <div class="col">
    <div class="card c-sc"><h3>Shortcut — write it in 4 chunks</h3>
     <div class="mnem"><div class="letters">${R.mnem.letters.map((l,i)=>`<span style="background:${CK[i]}">${l}</span>`).join('')}</div><div class="ph">${R.mnem.phrase}<small>${R.mnem.sub}</small></div></div>
     <div class="chunks">${R.chunks.map((c,i)=>`<div class="chunk" data-c="${i}" style="--ck:${CK[i]}"><i>${i+1}</i><div><b>${c.t}</b> <small>${c.d}</small></div></div>`).join('')}</div>
     <div class="kbd" style="margin-top:6px">click a chunk → its lines light up in the code</div></div>
    <div class="card c-dc"><h3>Declare these first</h3><div class="dls">${R.declare.map(([d,w])=>`<div class="dl"><code>${d}</code><span>${w}</span></div>`).join('')}</div></div>
   </div>
   <div class="col">
    <div class="card c-cd"><h3>The code, by chunk</h3><div id="rcode"></div></div>
    <div class="card c-fg"><h3>⚠ What I usually forget</h3><ul class="forget">${R.forget.map(x=>`<li>${x}</li>`).join('')}</ul></div>
   </div>
   <div class="col">
    <div class="card c-cx"><h3>Time &amp; space</h3>
     <div class="big-o"><div><small>Time</small><b>${R.cx.time}</b><span>${R.cx.timeWhy}</span></div><div><small>Space</small><b>${R.cx.space}</b><span>${R.cx.spaceWhy}</span></div></div>
     <table class="decl cxt"><tr><th>Approach</th><th>Time</th><th>Space</th><th>Note</th></tr>${R.cx.rows.map(r=>`<tr class="${r[4]?'best':''}"><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table></div>
    <div class="card c-fu"><h3>Interview follow-ups</h3><ul class="forget">${R.cx.follow.map(([q,a])=>`<li><b>${q}</b><br>${a}</li>`).join('')}</ul></div>
   </div>
  </main></section>`;
  const $=id=>document.getElementById(id);

  // ---------------- screen 1: the player
  const code=DS.code($('code'),cfg.code),viz=DS.make(cfg.viz.kind,$('viz'),cfg.viz.opts),vars=DS.vars($('vl'));
  const views={};cfg.ds.forEach(d=>views[d.id]=DS.make(d.kind,document.querySelector(`[data-ds="${d.id}"]`),d.opts));
  let steps=cfg.run(cfg.input.parse(cfg.input.value)),i=0,timer=null,speed=1,mode=store.get('code-player-mode','debug'),screen='run';
  function draw(){const s=steps[i];
   code.set(s.line,s.ann||{});viz.set(s.viz||{});
   Object.keys(views).forEach(id=>views[id].set((s.ds||{})[id]||{}));
   vars.set(s.vars||[]);
   const cap=$('cap');cap.className='caption'+(s.tone?' '+s.tone:'');cap.innerHTML=s.text||'';
   $('n').textContent=`step ${i+1} / ${steps.length}`;
   $('res').innerHTML=s.result!=null?`<span class="result">return ${DS.show(s.result)}</span>`:'';
   document.querySelector('[data-a=back]').disabled=i===0;document.querySelector('[data-a=step]').disabled=i===steps.length-1;}
  const go=n=>{i=Math.max(0,Math.min(steps.length-1,n));draw();};
  function stop(){clearTimeout(timer);timer=null;document.querySelector('[data-a=play]').textContent='▶ Play';}
  function play(){document.querySelector('[data-a=play]').textContent='⏸ Pause';clearTimeout(timer);
   const tick=()=>{if(i>=steps.length-1){stop();return;}go(i+1);timer=setTimeout(tick,1400/speed);};timer=setTimeout(tick,900/speed);}
  function setMode(m){mode=m;store.set('code-player-mode',m);
   document.querySelectorAll('#mode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
   $('dbg').style.display=m==='debug'?'':'none';$('aut').style.display=m==='auto'?'':'none';
   $('hint').textContent=m==='debug'?'F8 / → step · ← back':'';
   if(m==='auto'&&screen==='run'){if(i>=steps.length-1)go(0);play();}else stop();}
  function rerun(str){let inp;try{inp=cfg.input.parse(str);}catch(e){$('cap').className='caption bad';$('cap').innerHTML='⚠ '+e;return;}
   stop();$('inp').value=str;steps=cfg.run(inp);vars.reset();go(0);if(mode==='auto')play();}
  $('mode').onclick=e=>{const b=e.target.closest('[data-m]');if(b)setMode(b.dataset.m);};
  document.querySelector('.pbar').addEventListener('click',e=>{const b=e.target.closest('[data-a],[data-p]');if(!b)return;
   if(b.dataset.p){rerun(b.dataset.p);return;}
   const a=b.dataset.a;
   if(a==='step')go(i+1);if(a==='back')go(i-1);
   if(a==='restart'){go(0);if(mode==='auto')play();}
   if(a==='play'){if(timer)stop();else{if(i>=steps.length-1)go(0);play();}}
   if(a==='run')rerun($('inp').value);});
  $('inp').addEventListener('keydown',e=>{if(e.key==='Enter')rerun($('inp').value);});
  $('spd').onclick=e=>{const b=e.target.closest('button');if(!b)return;speed=+b.dataset.v;$('spd').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(timer)play();};
  document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||screen!=='run')return;
   if(e.key==='F8'||e.key==='ArrowRight'||e.key===' '){e.preventDefault();stop();go(i+1);}
   if(e.key==='ArrowLeft'){e.preventDefault();stop();go(i-1);}});
  const showP=on=>{$('pstrip').classList.toggle('mini',!on);$('hidep').textContent=on?'hide':'show problem';store.set('code-problem-strip',on?'1':'0');};
  $('hidep').onclick=()=>showP($('pstrip').classList.contains('mini'));showP(store.get('code-problem-strip','1')==='1');

  // ---------------- screen 2: remember
  const rc=DS.code($('rcode'),cfg.code),rows=[...$('rcode').children];
  R.chunks.forEach((c,ci)=>c.lines.forEach((n,j)=>{const r=rows[n-1];if(!r)return;r.classList.add('ck');r.style.setProperty('--ck',CK[ci]);
   if(j===0)r.lastChild.insertAdjacentHTML('beforebegin',`<span class="cbg">${ci+1} ${c.t}</span>`);}));
  document.querySelector('.chunks').onclick=e=>{const c=e.target.closest('.chunk');if(!c)return;const on=!c.classList.contains('on');
   document.querySelectorAll('.chunk').forEach(x=>x.classList.toggle('on',x===c&&on));rc.set(on?R.chunks[+c.dataset.c].lines:[]);
   rows.forEach((r,k)=>r.classList.toggle('dim',on&&!R.chunks[+c.dataset.c].lines.includes(k+1)));};

  // ---------------- screens
  function setScreen(s){screen=s;document.querySelectorAll('#scr button').forEach(b=>b.classList.toggle('on',b.dataset.s===s));
   $('s-run').classList.toggle('on',s==='run');$('s-rem').classList.toggle('on',s==='rem');$('mode').style.visibility=s==='run'?'':'hidden';
   try{history.replaceState(null,'','#'+s);}catch(e){}if(s!=='run')stop();else if(mode==='auto'&&!timer&&i<steps.length-1)play();}
  $('scr').onclick=e=>{const b=e.target.closest('[data-s]');if(b)setScreen(b.dataset.s);};
  draw();setScreen(location.hash==='#rem'?'rem':'run');setMode(mode);}
 return {start};
})();
