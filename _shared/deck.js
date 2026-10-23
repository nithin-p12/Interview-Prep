/* =====================================================================
   INTERVIEW PREP — SLIDE DECK ENGINE (behaviour)
   Shared by every slide-mode study page. Include AFTER the page markup:
     <script src="../_shared/deck.js"></script>   then the page's own <script>.
   Page contract:
     <body data-topic="java:Core Java Essentials">   (id used by the Completed checkboxes)
     <section class="cat" data-name="1. Values" data-col="b"> <div class="slide c-b"> … </div> </section>
     Contents slide: <div class="toc" id="toc"></div>   Q&A slide: #qa-find #qa-count #qa-random #qa-list
   Widgets built here:
     <script type="text/plain" data-mac="File.java" data-lang="java">…</script>  → Mac code window
        (comments containing ❌ turn red, ✅ green; every line is a .ln span for highlighting)
     .flow[data-step]   → Next / Auto play / Reset stepper
     .pq[data-opts="true|false"][data-ans="false"] > pre + .why   → predict-the-output card
     [data-go="2.1"]    → jumps to that slide
     DECK.qa([[q, a, ['1.1']], …])   → interview accordion
     DECK.speed(el, fn)              → 0.25× / 0.5× / 1× / 2× switch (default 0.5×)
   ===================================================================== */
// ---------------------------------------------------------------- helpers
const ESC=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};

// ---------------------------------------------------------------- syntax colouring
const RX={
 java:[/(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)')|(@\w+)|\b(public|private|protected|static|final|abstract|class|interface|record|enum|sealed|permits|non-sealed|new|return|void|package|import|implements|extends|this|super|null|true|false|if|else|for|while|do|try|catch|finally|throw|throws|var|int|long|double|float|boolean|char|byte|short|default|switch|case|yield|when|instanceof|synchronized|volatile|transient)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b(\d[\d_]*[LlDdFf]?)\b|([a-z_]\w*)(?=\()/gm,['cm','s','a','k','ty','nu','f']],
 yaml:[/(#.*$)|^(\s*[\w.\-]+)(?=:)|("(?:[^"\\]|\\.)*")|\b(true|false)\b|\b(\d[\w.]*)\b/gm,['cm','y','s','k','nu']],
 sh:[/(#.*$)|(^\$)|(\s-{1,2}[\w.\-:+]+(?:=[^\s\\]+)?)/gm,['cm','f','y']],
 text:[/^([\w\-]+)(?=:)/gm,['y']]};
function hl(src,lang){const [re,cls]=RX[lang]||RX.text;let o='',last=0,m;re.lastIndex=0;
 while((m=re.exec(src))){if(m[0]===''){re.lastIndex++;continue;}o+=ESC(src.slice(last,m.index));const g=m.slice(1).findIndex(x=>x!==undefined);
  let c=cls[g];if(c==='cm'){if(m[0].includes('❌'))c='cm x';else if(m[0].includes('✅'))c='cm v';}
  o+=`<span class="${c}">${ESC(m[0])}</span>`;last=m.index+m[0].length;}
 return o+ESC(src.slice(last));}
// one coloured line per .ln span (so pages can highlight lines)
function macHTML(file,src,lang){const lines=hl(src.replace(/^\n|\n\s*$/g,''),lang).split('\n');
 return `<div class="mac"><div class="bar"><div class="dots"><i></i><i></i><i></i></div><div class="fn">${file}</div></div><pre>${lines.map((l,i)=>`<span class="ln" data-l="${i+1}">${l||' '}</span>`).join('')}</pre></div>`;}
function buildCode(root=document){root.querySelectorAll('script[data-mac]').forEach(s=>{const d=document.createElement('div');d.innerHTML=macHTML(s.dataset.mac,s.textContent,s.dataset.lang||'java');s.replaceWith(d.firstChild);});}
// mark lines (1-based) of a .mac: cur = highlighted, others dimmed when dim=true
function markLines(mac,nums,dim){mac.querySelectorAll('.ln').forEach(l=>{const on=nums.includes(+l.dataset.l);l.classList.toggle('cur',on);l.classList.toggle('dim',!!dim&&nums.length>0&&!on);});}
buildCode();

// ---------------------------------------------------------------- logos (simple-icons paths)
const LOGO={
 openjdk:'M11.915 0 11.7.215C9.515 2.4 7.47 6.39 6.046 10.483c-1.064 1.024-3.633 2.81-3.711 3.551-.093.87 1.746 2.611 1.55 3.235-.198.625-1.304 1.408-1.014 1.939.1.188.823.011 1.277-.491a13.389 13.389 0 0 0-.017 2.14c.076.906.27 1.668.643 2.232.372.563.956.911 1.667.911.397 0 .727-.114 1.024-.264.298-.149.571-.33.91-.5.68-.34 1.634-.666 3.53-.604 1.903.062 2.872.39 3.559.704.687.314 1.15.664 1.925.664.767 0 1.395-.336 1.807-.9.412-.563.631-1.33.72-2.24.06-.623.055-1.32 0-2.066.454.45 1.117.604 1.213.424.29-.53-.816-1.314-1.013-1.937-.198-.624 1.642-2.366 1.549-3.236-.08-.748-2.707-2.568-3.748-3.586C16.428 6.374 14.308 2.394 12.13.215zm.175 6.038a2.95 2.95 0 0 1 2.943 2.942 2.95 2.95 0 0 1-2.943 2.943A2.95 2.95 0 0 1 9.148 8.98a2.95 2.95 0 0 1 2.942-2.942zM8.685 7.983a3.515 3.515 0 0 0-.145.997c0 1.951 1.6 3.55 3.55 3.55 1.95 0 3.55-1.598 3.55-3.55 0-.329-.046-.648-.132-.951.334.095.64.208.915.336a42.699 42.699 0 0 1 2.042 5.829c.678 2.545 1.01 4.92.846 6.607-.082.844-.29 1.51-.606 1.940-.315.431-.713.651-1.315.651-.593 0-.932-.27-1.673-.61-.741-.338-1.825-.694-3.792-.758-1.974-.064-3.073.293-3.821.669-.375.188-.659.373-.911.5s-.466.2-.752.2c-.53 0-.876-.209-1.16-.64-.285-.43-.474-1.101-.545-1.948-.141-1.693.176-4.069.823-6.614a43.155 43.155 0 0 1 1.934-5.783c.348-.167.749-.31 1.192-.425zm-3.382 4.362a.216.216 0 0 1 .13.031c-.166.56-.323 1.116-.463 1.665a33.849 33.849 0 0 0-.547 2.555 3.9 3.9 0 0 0-.2-.39c-.58-1.012-.914-1.642-1.16-2.08.315-.24 1.679-1.755 2.24-1.781zm13.394.01c.562.027 1.926 1.543 2.24 1.783-.246.438-.58 1.068-1.16 2.08a4.428 4.428 0 0 0-.163.309 32.354 32.354 0 0 0-.562-2.49 40.579 40.579 0 0 0-.482-1.652.216.216 0 0 1 .127-.03z',
 spring:'M21.8537 1.4158a10.4504 10.4504 0 0 1-1.284 2.2471A11.9666 11.9666 0 1 0 3.8518 20.7757l.4445.3951a11.9543 11.9543 0 0 0 19.6316-8.2971c.3457-3.0126-.568-6.8649-2.0743-11.458zM5.5805 20.8745a1.0174 1.0174 0 1 1-.1482-1.4323 1.0396 1.0396 0 0 1 .1482 1.4323zm16.1991-3.5806c-2.9385 3.9263-9.2601 2.5928-13.2852 2.7904 0 0-.7161.0494-1.4323.1481 0 0 .2717-.1234.6174-.2469 2.8398-.9877 4.1732-1.1853 5.9018-2.0743 3.2349-1.6545 6.4698-5.2844 7.1118-9.0379-1.2347 3.6053-4.9881 6.7167-8.3959 7.9761-2.3459.8643-6.5685 1.7039-6.5685 1.7039l-.1729-.0988c-2.8645-1.4076-2.9632-7.6304 2.2718-9.6306 2.2966-.889 4.4696-.395 6.9637-.9877 2.6422-.6174 5.7043-2.5929 6.939-5.1857 1.3828 4.1732 3.062 10.643.0493 14.6434z'};
const BRAND={openjdk:'#ED8B00',spring:'#6DB33F'};
const logo=(n,cls='lg')=>LOGO[n]?`<svg class="${cls}" viewBox="0 0 24 24"><path fill="${BRAND[n]}" d="${LOGO[n]}"/></svg>`:'';
function fillLogos(root=document){root.querySelectorAll('svg[data-logo]').forEach(s=>{const n=s.dataset.logo;if(!LOGO[n])return;s.setAttribute('viewBox','0 0 24 24');s.innerHTML=`<path fill="${BRAND[n]}" d="${LOGO[n]}"/>`;});}
fillLogos();

// ---------------------------------------------------------------- fit each slide: spare height → padding (--k), never font size
function fitSlide(sl){
 if(!sl)return;const sec=sl.firstElementChild;if(!sec||!sec.classList.contains('sec'))return;
 if(document.body.classList.contains('all')){sec.style.removeProperty('--k');sec.style.minHeight='';return;}
 const cs=getComputedStyle(sl),pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
 sec.style.minHeight='0';
 const fits=k=>{sec.style.setProperty('--k',k);return sl.scrollHeight<=sl.clientHeight+1;};
 let lo,hi;if(fits(1)){lo=1;hi=2.2;}else{lo=0.3;hi=1;}
 for(let i=0;i<8;i++){const m=(lo+hi)/2;if(fits(m))lo=m;else hi=m;}
 let k=Math.floor(lo*100)/100;sec.style.setProperty('--k',k);
 sec.style.minHeight=(sl.clientHeight-pad-4)+'px';
 const over=()=>sl.scrollHeight>sl.clientHeight;
 while(over()&&k>0.3){k=Math.round((k-0.03)*100)/100;sec.style.setProperty('--k',k);}
 if(over())sec.style.minHeight='';
 document.dispatchEvent(new CustomEvent('slide-fitted',{detail:sl}));}
const fitCurrent=()=>fitSlide(document.querySelector('.slide.on'));
let fitT;window.addEventListener('resize',()=>{clearTimeout(fitT);fitT=setTimeout(fitCurrent,120);});
window.addEventListener('load',()=>{fitCurrent();setTimeout(fitCurrent,250);});
// content can grow while you play: refit only if it starts to overflow
document.addEventListener('click',()=>setTimeout(()=>{const sl=document.querySelector('.slide.on');if(sl&&sl.scrollHeight>sl.clientHeight)fitSlide(sl);},350));

// ---------------------------------------------------------------- the deck
const DECK=(function(){
 const COL={t:['#14B8A6','#0F766E','#F0FDFA'],b:['#3B82F6','#1D4ED8','#EEF5FF'],p:['#9333EA','#7E22CE','#F7F0FF'],o:['#F97316','#C2410C','#FFF6EC'],g:['#22C55E','#15803D','#EFFCF3'],r:['#EF4444','#B91C1C','#FFF1F1'],s:['#64748B','#334155','#F8FAFC'],i:['#6366F1','#4338CA','#EEF2FF'],a:['#F59E0B','#B45309','#FFFBEB'],k:['#EC4899','#BE185D','#FDF2F8']};
 const cats=[...document.querySelectorAll('.cat')].map(el=>({el,name:el.dataset.name,col:el.dataset.col,slides:[...el.querySelectorAll('.slide')]}));
 cats.forEach(k=>k.slides.forEach(sl=>{const w=document.createElement('div');w.className='sec';while(sl.firstChild)w.appendChild(sl.firstChild);sl.appendChild(w);}));
 const flat=[];cats.forEach((k,ci)=>k.slides.forEach((sl,si)=>flat.push({ci,si,sl,num:sl.querySelector('.sn').textContent.trim(),title:sl.querySelector('h2').textContent.trim()})));
 let c=0,s=0;
 const idx=()=>flat.findIndex(f=>f.ci===c&&f.si===s);
 const isAll=()=>document.body.classList.contains('all');
 function go(ci,si){if(isAll()){cats[ci].slides[si].scrollIntoView({behavior:'smooth',block:'start'});return;}c=ci;s=si;show();}
 const goFlat=i=>{if(i>=0&&i<flat.length)go(flat[i].ci,flat[i].si);};
 // heading arrows: ◀ previous number … next number ▶ (next category in its own colour)
 flat.forEach((f,i)=>{const sh=f.sl.querySelector('.sh');
  if(i>0){const p=flat[i-1],col=COL[cats[p.ci].col];const b=document.createElement('button');b.className='hnav prev';b.style.borderColor=col[0];b.style.color=col[1];b.textContent=`◀ ${p.num}`;b.title=p.title;b.onclick=()=>goFlat(i-1);sh.prepend(b);}
  if(i<flat.length-1){const n=flat[i+1],cross=n.ci!==f.ci,col=COL[cats[n.ci].col];const b=document.createElement('button');b.className='hnav next'+(cross?' cat':'');b.style.borderColor=col[0];
   if(cross){b.style.background=col[0];b.textContent=`${cats[n.ci].name} ▶`;}else{b.style.color=col[1];b.textContent=`${n.num} ▶`;}
   b.title=n.title;b.onclick=()=>goFlat(i+1);
   const done=sh.querySelector('.donebox');if(done)done.style.marginLeft='auto',b.style.marginLeft='0';sh.appendChild(b);}});
 const tabs=document.getElementById('tabs');
 tabs.innerHTML=cats.map((k,i)=>`<button class="tab" data-c="${i}" style="border-color:${COL[k.col][0]};color:${COL[k.col][1]}">${k.name.replace(/^\d+\.\s*/,'').replace('Interview ','')}</button>`).join('');
 const toc=document.getElementById('toc');
 if(toc)toc.innerHTML=cats.slice(1).map((k,j)=>{const col=COL[k.col];return `<div class="tcat" style="border-color:${col[0]};background:${col[2]}"><h3 style="color:${col[1]}">${k.name}</h3>${k.slides.map((sl,si)=>{const f=flat.find(x=>x.ci===j+1&&x.si===si);return `<button data-goflat="${flat.indexOf(f)}"><b style="color:${col[1]}">${f.num}</b>${f.title}</button>`;}).join('')}</div>`;}).join('');
 function show(push){
  cats.forEach((k,i)=>k.slides.forEach((sl,j)=>sl.classList.toggle('on',i===c&&j===s)));
  tabs.querySelectorAll('.tab').forEach((t,i)=>{const on=i===c;t.classList.toggle('on',on);t.style.background=on?COL[cats[i].col][0]:'#fff';if(on)t.scrollIntoView({block:'nearest',inline:'nearest'});});
  const k=cats[c],col=COL[k.col][0],i=idx();
  document.getElementById('dots').innerHTML=k.slides.map((_,j)=>`<button data-s="${j}" class="${j===s?'on':''}" style="background:${j===s?col:'#CBD5E1'}" title="${k.slides[j].querySelector('h2').textContent}"></button>`).join('');
  document.getElementById('cnt').textContent=`${k.name} · ${s+1} / ${k.slides.length}`;
  document.getElementById('prev').disabled=i===0;document.getElementById('next').disabled=i===flat.length-1;
  k.slides[s].scrollTop=0;fitSlide(k.slides[s]);
  document.dispatchEvent(new CustomEvent('slide-shown',{detail:k.slides[s]}));
  if(push!==false)history.replaceState(null,'',`#${c}-${s+1}`);}
 document.getElementById('prev').onclick=()=>goFlat(idx()-1);
 document.getElementById('next').onclick=()=>goFlat(idx()+1);
 document.getElementById('dots').onclick=e=>{const b=e.target.closest('[data-s]');if(b)go(c,+b.dataset.s);};
 tabs.onclick=e=>{const b=e.target.closest('[data-c]');if(b)go(+b.dataset.c,0);};
 document.addEventListener('click',e=>{const g=e.target.closest('[data-goflat]');if(g){goFlat(+g.dataset.goflat);return;}
  const n=e.target.closest('[data-go]');if(n){const i=flat.findIndex(f=>f.num===n.dataset.go);if(i>=0)goFlat(i);}});
 document.addEventListener('keydown',e=>{
  if(isAll()||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(e.key==='ArrowRight'){goFlat(idx()+1);e.preventDefault();}
  if(e.key==='ArrowLeft'){goFlat(idx()-1);e.preventDefault();}});
 const tc=document.getElementById('t-code'),ta=document.getElementById('t-all');
 function applyPrefs(){const code=store.get('sb-code','1')==='1',all=store.get('sb-all','0')==='1';
  document.body.classList.toggle('nocode',!code);tc.classList.toggle('on',code);tc.innerHTML=code?'&lt;/&gt; Code: on':'&lt;/&gt; Code: off';
  document.body.classList.toggle('all',all);ta.classList.toggle('on',!all);ta.innerHTML=all?'▭ Slides: off':'▭ Slides: on';}
 tc.onclick=()=>{store.set('sb-code',store.get('sb-code','1')==='1'?'0':'1');applyPrefs();fitCurrent();};
 ta.onclick=()=>{store.set('sb-all',store.get('sb-all','0')==='1'?'0':'1');applyPrefs();document.querySelectorAll('.slide').forEach(fitSlide);if(!isAll())show();window.scrollTo(0,0);};
 const h=location.hash.match(/^#(\d+)-(\d+)$/);
 if(h){const hc=+h[1],hs=+h[2]-1;if(cats[hc]&&cats[hc].slides[hs]){c=hc;s=hs;}}
 applyPrefs();

 // ---- interview Q&A accordion: rows = [question, answer, ['1.2', …]]
 function qa(Q){const list=document.getElementById('qa-list');if(!list)return;
  const pill=r=>{const ci=+r.split('.')[0],k=cats[ci];return k?COL[k.col]:COL.s;};
  list.innerHTML=Q.map(([q,a,refs],i)=>`<div class="aq"><div class="qh" tabindex="0"><span class="qn">${i+1}</span><span>${q}</span><span class="ref">${(refs||[]).map(r=>{const col=pill(r);return `<button data-go="${r}" style="border-color:${col[0]};color:${col[1]}" title="open slide ${r}">${r}</button>`;}).join('')}</span><span class="chev">▶</span></div><div class="ans">${a}</div></div>`).join('');
  const items=[...list.querySelectorAll('.aq')],cnt=document.getElementById('qa-count'),find=document.getElementById('qa-find');
  const open=el=>items.forEach(x=>x.classList.toggle('open',x===el&&!x.classList.contains('open')));
  list.addEventListener('click',e=>{if(e.target.closest('[data-go]'))return;const hd=e.target.closest('.qh');if(hd)open(hd.parentElement);});
  list.addEventListener('keydown',e=>{const hd=e.target.closest('.qh');if(hd&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(hd.parentElement);}});
  function filter(){const t=find.value.trim().toLowerCase();let n=0;items.forEach(x=>{const ok=!t||x.textContent.toLowerCase().includes(t);x.classList.toggle('hide',!ok);if(ok)n++;});cnt.textContent=`${n} question${n===1?'':'s'}`;}
  find.addEventListener('input',filter);
  document.getElementById('qa-random').onclick=()=>{const vis=items.filter(x=>!x.classList.contains('hide'));if(!vis.length)return;const el=vis[Math.floor(Math.random()*vis.length)];items.forEach(x=>x.classList.remove('open'));el.classList.add('open');el.scrollIntoView({block:'center',behavior:'smooth'});};
  filter();}

 // ---- speed switch for animations
 function speed(el,fn){el.classList.add('seg');el.innerHTML=[0.25,0.5,1,2].map(v=>`<button data-v="${v}" class="${v===0.5?'on':''}">${v}×</button>`).join('');
  el.onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));fn(+b.dataset.v);};return 0.5;}

 // show after the page script had a chance to build its widgets
 setTimeout(()=>show(false),0);
 return {go,goFlat,qa,speed,flat,cats,show};
})();

// ---------------------------------------------------------------- stepper for .flow[data-step]
function initSteppers(root=document){root.querySelectorAll('.flow[data-step]').forEach(fl=>{
 if(fl.dataset.ready)return;fl.dataset.ready=1;
 const steps=[...fl.querySelectorAll('.fstep')];let i=-1,timer=null;
 const bar=document.createElement('div');bar.className='ctrl';bar.style.marginBottom='6px';
 bar.innerHTML='<button class="btn p" data-x="next">Next ▶</button><button class="btn" data-x="auto">▶ Auto play</button><button class="btn" data-x="reset">↺ Reset</button><span style="font-size:12.5px;color:var(--muted);font-weight:700" data-x="n"></span>';
 fl.before(bar);
 const autoBtn=bar.querySelector('[data-x=auto]');
 const stop=()=>{clearInterval(timer);timer=null;autoBtn.textContent='▶ Auto play';};
 const draw=()=>{steps.forEach((st,k)=>{st.classList.toggle('done',k<i);st.classList.toggle('cur',k===i);});bar.querySelector('[data-x=n]').textContent=i<0?'':`step ${i+1} / ${steps.length}`;bar.querySelector('[data-x=next]').disabled=i>=steps.length-1;fl.dispatchEvent(new CustomEvent('step',{detail:i}));};
 bar.onclick=e=>{const x=e.target.closest('[data-x]');if(!x)return;const a=x.dataset.x;
  if(a==='next'&&i<steps.length-1){i++;draw();}
  if(a==='reset'){i=-1;stop();draw();}
  if(a==='auto'){if(timer){stop();return;}if(i>=steps.length-1)i=-1;autoBtn.textContent='⏸ Pause';
   timer=setInterval(()=>{if(i>=steps.length-1){stop();return;}i++;draw();},1600);}};
 draw();});}
initSteppers();

// ---------------------------------------------------------------- predict-the-output cards
document.querySelectorAll('.pq').forEach(card=>{
 const opts=card.dataset.opts.split('|'),ans=card.dataset.ans;
 const row=document.createElement('div');row.className='opts';
 row.innerHTML=opts.map(o=>`<button>${ESC(o)}</button>`).join('');
 card.querySelector('.why').before(row);
 row.onclick=e=>{const b=e.target.closest('button');if(!b||card.classList.contains('done'))return;
  const right=b.textContent===ans;card.classList.add('done',right?'right':'wrong');b.classList.add(right?'r':'w');
  if(!right)[...row.children].find(x=>x.textContent===ans).classList.add('r');
  const box=card.closest('.slide'),sc=box&&box.querySelector('.score');
  if(sc){const all=box.querySelectorAll('.pq'),dn=box.querySelectorAll('.pq.done'),ok=box.querySelectorAll('.pq.right');sc.textContent=`${ok.length} / ${dn.length} right · ${all.length-dn.length} left`;}};});
document.querySelectorAll('.score').forEach(sc=>{const n=sc.closest('.slide').querySelectorAll('.pq').length;sc.textContent=`0 / 0 right · ${n} left`;});
document.querySelectorAll('[data-pq-reset]').forEach(b=>b.onclick=()=>{const sl=b.closest('.slide');sl.querySelectorAll('.pq').forEach(c=>{c.classList.remove('done','right','wrong');c.querySelectorAll('.opts button').forEach(x=>x.className='');});const sc=sl.querySelector('.score');if(sc)sc.textContent=`0 / 0 right · ${sl.querySelectorAll('.pq').length} left`;});

// ---------------------------------------------------------------- "Completed" checkbox (shared with the hubs)
(function(){
 const KEY='prep-done',ID=document.body.dataset.topic;if(!ID)return;
 const get=()=>{try{return new Set(JSON.parse(localStorage.getItem(KEY)||'[]'));}catch(e){return new Set();}};
 const boxes=[...document.querySelectorAll('.topic-done')];
 const draw=()=>{const on=get().has(ID);boxes.forEach(b=>{b.checked=on;b.closest('.donebox').classList.toggle('on',on);});};
 boxes.forEach(b=>b.addEventListener('change',()=>{const s=get();b.checked?s.add(ID):s.delete(ID);try{localStorage.setItem(KEY,JSON.stringify([...s]));}catch(e){}draw();}));
 draw();
})();
