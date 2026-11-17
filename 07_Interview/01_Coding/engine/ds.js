/* =====================================================================
   CODING PRACTICE — data-structure views (07_Interview/01_Coding/engine/ds.js)
   Every view is persistent: call view.set(state) again and again; items are
   matched by key, so new ones pop in, removed ones leave, moved ones glide.
     DS.make('array'|'arraylist'|'linked'|'queue'|'stack'|'map'|'set'|'treemap'|'treeset'|'tree'|'grid'|'intervals', host, opts)
     DS.vars(host).set([{t:'method scope', note, v:[[name, value, 'res'?]]}])   value undefined = out of scope
     DS.code(host, javaSource).set([lines], {line: 'inline note'}) · .fit(reserve, {line: longest note}) shrinks the font (min 11px) until code + notes fit
   States (hl = highlight map → 'cur' | 'hit' | 'bad' | 'new' | 'done' | 'dim'):
     array     {vals, hl:{i}, ptrs:{name:i}, win:[lo,hi], winBad, winLabel, ix:[index labels]}   opts: cw, bars, barH, top (room above for the window label, default 24), ptrColors, ptrs:false (no pointer row)
     arraylist {items:[v | {id,v}], hl}  opts.iw = item width   queue / stack / set: same shape (+ probe)   stack opts.sm = small items, opts.w = width
     linked    {nodes:[{id,v,next?}], head?, ptrs:{name:id|null}, hl:{id}}
     map       {entries:[[k,v]], hl:{k}, probe:{t,r,ok}}   opts: k, v (column titles), cols (grid columns, e.g. '70px 26px 1fr')
     treemap   {entries:[[k,v]], hl:{k}} · treeset {keys:[k], hl:{k}}   (drawn as a balanced BST)
     tree      {nodes:{id:{v,l,r,label}}, root, hl:{id}}
     grid      {cells:[[v]], hl:{'r,c':cls}}     opts.cls(v) → base class (e.g. 'land' / 'water')
     intervals {items:[{id,lo,hi,label?}], hl:{id}, axis:[min,max]}   one row per interval on a number line (opts.unit px per 1)
   ===================================================================== */
const DS=(function(){
 const E=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const show=v=>v===null?'null':v===undefined?'—':v===2147483647?'MAX':v===-2147483648?'MIN':
  typeof v==='string'?(v.length===1?`'${v}'`:`"${v}"`):Array.isArray(v)?'['+v.map(show).join(', ')+']':
  typeof v==='object'?'{'+Object.entries(v).map(([k,x])=>`${k}=${show(x)}`).join(', ')+'}':String(v);
 const flash=el=>el.animate([{boxShadow:'0 0 0 6px #FACC15'},{boxShadow:'0 0 0 0 rgba(250,204,21,0)'}],{duration:850});
 const POP=[{opacity:0,transform:'scale(.3)'},{opacity:1,transform:'none'}],OUT=[{opacity:1},{opacity:0,transform:'scale(.4)'}];
 let uid=0;

 // ---------------------------------------------------------- keyed list: enter / leave / FLIP move / flash on change
 function keyed(box,items,o={}){
  const cur=new Map();[...box.children].forEach(el=>{if(el.dataset.k!=null&&!el._leaving)cur.set(el.dataset.k,el);});
  const first=new Map();cur.forEach((el,k)=>first.set(k,[el.offsetLeft,el.offsetTop]));
  const keep=new Set(items.map(i=>String(i.k)));
  cur.forEach((el,k)=>{if(keep.has(k))return;const [x,y]=first.get(k);el._leaving=true;
   el.style.width=el.offsetWidth+'px';el.style.position='absolute';el.style.left=x+'px';el.style.top=y+'px';el.style.margin='0';
   const a=el.animate(o.leave||OUT,{duration:400,easing:'ease-in',fill:'forwards'});a.onfinish=()=>el.remove();});
  let prev=null;const out=[];
  items.forEach(it=>{const k=String(it.k);let el=cur.get(k);const isNew=!el;
   if(isNew){el=document.createElement('div');el.dataset.k=k;}
   const cls=(o.base||'')+(it.cls?' '+it.cls:'');if(el.className!==cls)el.className=cls;
   const changed=!isNew&&el._html!==it.html;if(el._html!==it.html){el.innerHTML=it.html;el._html=it.html;}
   let want=prev?prev.nextElementSibling:box.firstElementChild;while(want&&want._leaving)want=want.nextElementSibling;
   if(want!==el)box.insertBefore(el,want);prev=el;out.push({el,k,isNew,changed});});
  out.forEach(({el,k,isNew,changed})=>{
   if(isNew){el.animate(o.enter||POP,{duration:460,easing:'cubic-bezier(.34,1.4,.64,1)'});return;}
   if(o.flip!==false){const [x,y]=first.get(k),dx=x-el.offsetLeft,dy=y-el.offsetTop;
    if(dx||dy)el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:480,easing:'ease-in-out'});}
   if(changed&&o.flash!==false)flash(el);});
  return out;}
 const items=st=>(st.items||[]).map((x,i)=>x!==null&&typeof x==='object'&&'v' in x?x:{id:'i'+i,v:x});
 const probe=(el,p)=>{el.innerHTML=p?`<span class="probe ${p.ok===true?'y':p.ok===false?'n':'i'}">${E(p.t)} → ${E(p.r)}</span>`:'';};
 const PC=['#F97316','#22C55E','#6366F1','#EC4899','#0EA5E9'];

 // ---------------------------------------------------------- array: fixed slots, window box, pointers (opts.bars → price bars)
 function array(host,o={}){
  const cw=o.cw||48,gap=o.gap||8,step=cw+gap,pcol=o.ptrColors||{},H=o.bars?(o.barH||110):42,T=o.top!=null?o.top:24,PT=T+H+28;
  host.className='ds ds-array'+(o.bars?' bars':'');host.style.setProperty('--cw',cw+'px');
  let n=-1,slots=[],ptrEl={},win,ixs=[];
  function build(len){host.innerHTML='';win=document.createElement('div');win.className='win';win.innerHTML=`<span>${o.winLabel||'window'}</span>`;
   win.style.top=(T-8)+'px';win.style.height=(H+16)+'px';host.appendChild(win);
   slots=[];for(let i=0;i<len;i++){const s=document.createElement('div');s.className='slot';s.style.left=i*step+'px';s.style.top=T+'px';s.style.height=H+'px';s.innerHTML='<div class="it"></div>';host.appendChild(s);slots.push(s.firstChild);
    const x=document.createElement('div');x.className='ix';x.style.left=i*step+'px';x.style.top=(T+H+5)+'px';x.textContent=i;host.appendChild(x);}
   host.style.width=Math.max(len*step-gap+10,40)+'px';ptrEl={};n=len;ixs=[...host.querySelectorAll('.ix')];}
  return {set(st){
   const vals=st.vals||[],hl=st.hl||{};if(vals.length!==n)build(vals.length);
   const mx=Math.max(1,...vals.map(v=>Math.abs(+v)||0));if(st.ix)ixs.forEach((x,i)=>{const t=st.ix[i]!=null?st.ix[i]:i;if(x.textContent!==String(t))x.textContent=t;});
   vals.forEach((v,i)=>{const el=slots[i];if(el._v!==v){if(el._v!==undefined)flash(el);el.textContent=v;el._v=v;}el.className='it '+(hl[i]||'');
    if(o.bars){const h=Math.round(28+(Math.abs(+v)||0)/mx*(H-28));el.style.height=h+'px';el.style.marginTop=(H-h)+'px';}});
   const w=st.win;
   win.firstChild.style.display=w&&w[1]>=w[0]?'':'none';
   if(w&&w[1]>=w[0]){win.style.opacity=1;win.style.left=(w[0]*step-6)+'px';win.style.width=((w[1]-w[0]+1)*step-gap+12)+'px';}
   else{win.style.opacity=0;win.style.width='0px';if(w)win.style.left=(w[0]*step)+'px';}
   win.classList.toggle('bad',!!st.winBad);if(st.winLabel)win.firstChild.textContent=st.winLabel;
   const baseW=Math.max(n*step-gap+10,40),lw=w&&w[1]>=w[0]?w[0]*step+win.firstChild.offsetWidth+4:0;host.style.width=Math.max(baseW,lw)+'px';
   const ptrs=st.ptrs||{},rows={};
   Object.keys(ptrs).forEach((k,j)=>{const i=ptrs[k];let el=ptrEl[k];
    if(!el){el=document.createElement('div');el.className='ptr';el.textContent=k;el.style.setProperty('--pc',pcol[k]||PC[j%5]);host.appendChild(el);ptrEl[k]=el;if(i!=null)el.style.left=(i*step+cw/2)+'px';}
    if(i==null||i<0||i>=n){el.style.opacity=0;el.style.top=PT+'px';return;}
    const r=rows[i]=(rows[i]||0)+1;el.style.opacity=1;el.style.left=(i*step+cw/2)+'px';el.style.top=(PT+(r-1)*22)+'px';});
   Object.keys(ptrEl).forEach(k=>{if(!(k in ptrs)){ptrEl[k].style.opacity=0;ptrEl[k].style.top=PT+'px';}});
   host.style.height=(o.ptrs===false?PT-4:PT+22*Math.max(1,...Object.values(rows))+2)+'px';}};}

 // ---------------------------------------------------------- ArrayList
 function arraylist(host,o={}){host.className='ds ds-arraylist';if(o.iw)host.style.setProperty('--iw',o.iw+'px');host.innerHTML='<div class="pr"></div><div class="row-box"></div><div class="ixrow"></div><div class="size"></div>';
  const [pr,box,ix,sz]=host.children;
  return {set(st){const its=items(st),hl=st.hl||{};probe(pr,st.probe);
   keyed(box,its.map((it,i)=>({k:it.id,html:E(it.v),cls:hl[it.id]||hl[i]})),{base:'it'});
   ix.innerHTML=its.map((_,i)=>`<span>${i}</span>`).join('');sz.textContent=its.length?`size() = ${its.length}`:'[ ] empty · size() = 0';}};}

 // ---------------------------------------------------------- Queue (front ← … ← back)
 function queue(host){host.className='ds ds-queue';host.innerHTML='<div class="pr"></div><div class="pipe"><div class="end">front<br>⟵ poll</div><div class="tube"><div class="row-box"></div></div><div class="end">back<br>⟵ offer</div></div><div class="size"></div>';
  const pr=host.children[0],box=host.querySelector('.row-box'),sz=host.children[2];
  return {set(st){const its=items(st),hl=st.hl||{};probe(pr,st.probe);
   keyed(box,its.map((it,i)=>({k:it.id,html:E(it.v),cls:hl[it.id]||hl[i]})),{base:'it',enter:[{opacity:0,transform:'translateX(80px)'},{opacity:1,transform:'none'}],leave:[{opacity:1},{opacity:0,transform:'translateX(-80px)'}]});
   sz.textContent=its.length?`size() = ${its.length}`:'empty';}};}

 // ---------------------------------------------------------- Stack (top drawn on top)
 function stack(host,o={}){host.className='ds ds-stack'+(o.sm?' sm':'');if(o.w)host.style.setProperty('--sw',o.w+'px');host.innerHTML='<div class="pr"></div><div class="stk"><div class="col"></div><div class="toplbl">← top</div></div><div class="size"></div>';
  const [pr,stk,sz]=host.children,box=stk.firstChild,tl=stk.lastChild;
  return {set(st){const its=items(st),hl=st.hl||{};probe(pr,st.probe);const top=its.length-1;
   keyed(box,its.map((it,i)=>({k:it.id,html:E(it.v),cls:[(hl[it.id]||hl[i]||''),i===top?'top':''].join(' ').trim()})).reverse(),{base:'it',enter:[{opacity:0,transform:'translateY(-60px)'},{opacity:1,transform:'none'}],leave:[{opacity:1},{opacity:0,transform:'translateY(-60px)'}]});
   tl.style.visibility=its.length?'':'hidden';sz.textContent=its.length?`size() = ${its.length}`:'empty';}};}

 // ---------------------------------------------------------- HashSet (a bag of unique items)
 function set(host){host.className='ds ds-set';host.innerHTML='<div class="pr"></div><div class="bag"></div><div class="size"></div>';
  const [pr,box,sz]=host.children;
  return {set(st){const its=items(st),hl=st.hl||{};probe(pr,st.probe);
   keyed(box,its.map((it,i)=>({k:'s'+it.v,html:E(it.v),cls:hl[it.v]||hl[it.id]})),{base:'it',enter:[{opacity:0,transform:'translateY(-30px) scale(.3)'},{opacity:1,transform:'none'}],leave:[{opacity:1},{opacity:0,transform:'translateY(30px) scale(.3)'}]});
   sz.textContent=`size() = ${its.length}`;}};}

 // ---------------------------------------------------------- HashMap (key → value table)
 function map(host,o={}){host.className='ds ds-map';if(o.cols)host.style.setProperty('--mcols',o.cols);
  host.innerHTML=`<div class="pr"></div><div class="tbl"><div class="th"><span>${o.k||'key'}</span><i></i><span>${o.v||'value'}</span></div><div class="body"></div></div><div class="size"></div>`;
  const pr=host.children[0],box=host.querySelector('.body'),sz=host.children[2];
  return {set(st){const en=st.entries||[],hl=st.hl||{};probe(pr,st.probe);
   keyed(box,en.map(([k,v])=>({k:'m'+k,html:`<span>${E(show(k))}</span><i>→</i><span>${E(show(v))}</span>`,cls:hl[k]})),{base:'mrow',enter:[{opacity:0,transform:'translateX(-30px)'},{opacity:1,transform:'none'}],leave:[{opacity:1},{opacity:0,transform:'translateX(30px)'}]});
   sz.textContent=en.length?`size() = ${en.length}`:'{ } empty';}};}

 // ---------------------------------------------------------- trees (binary tree / TreeMap / TreeSet)
 function tree(host,o={}){host.className='ds ds-tree';const id=++uid;
  host.innerHTML='<div class="pr"></div><div class="stage"><svg class="links"></svg><div class="nodes"></div></div><div class="sorted"></div>';
  const pr=host.children[0],stage=host.children[1],svg=stage.firstChild,box=stage.children[1],sorted=host.children[2];
  const X=o.dx||52,Y=o.dy||60;let edges=new Set();
  return {set(st){probe(pr,st.probe);let nodes,root,hl=st.hl||{},hlk={};
   if(st.entries||st.keys){const ents=(st.entries||st.keys.map(k=>[k])).slice().sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);nodes={};
    const mk=(lo,hi)=>{if(lo>hi)return null;const m=(lo+hi)>>1,e=ents[m],id='k'+e[0];
     nodes[id]={v:e.length>1?`${show(e[0])}<span style="color:var(--faint)">:</span>${show(e[1])}`:show(e[0]),l:mk(lo,m-1),r:mk(m+1,hi)};return id;};
    root=mk(0,ents.length-1);Object.keys(hl).forEach(k=>hlk['k'+k]=hl[k]);hl=hlk;
    sorted.innerHTML=ents.length?`in-order (always sorted): <b>${ents.map(e=>E(show(e[0]))).join(' &lt; ')}</b>`:'empty';}
   else{nodes=st.nodes||{};root=st.root;sorted.innerHTML=st.note||'';}
   const pos={};let ix=0,maxd=-1;
   (function walk(n,d){if(n==null||!nodes[n])return;walk(nodes[n].l,d+1);pos[n]={x:ix++*X+X/2,y:d*Y+26};maxd=Math.max(maxd,d);walk(nodes[n].r,d+1);})(root,0);
   const W=Math.max(ix*X,60),H=Math.max((maxd+1)*Y,52);stage.style.width=W+'px';stage.style.height=H+'px';svg.setAttribute('width',W);svg.setAttribute('height',H);
   const ids=Object.keys(pos);
   const res=keyed(box,ids.map(n=>({k:n,html:`${nodes[n].v}${nodes[n].label!=null?`<small>${nodes[n].label}</small>`:''}`,cls:hl[n]})),
    {base:'tnode',flip:false,enter:[{opacity:0,transform:'translateX(-50%) scale(.3)'},{opacity:1,transform:'translateX(-50%)'}],leave:[{opacity:1,transform:'translateX(-50%)'},{opacity:0,transform:'translateX(-50%) scale(.3)'}]});
   res.forEach(({el,k})=>{el.style.left=pos[k].x+'px';el.style.top=(pos[k].y-22)+'px';});
   const now=new Set();let p='';
   ids.forEach(n=>['l','r'].forEach(s=>{const c=nodes[n][s];if(c==null||!pos[c])return;const key=n+'>'+c;now.add(key);
    p+=`<path class="${edges.has(key)?'':'fresh'}" d="M${pos[n].x} ${pos[n].y+20} L${pos[c].x} ${pos[c].y-20}"/>`;}));
   svg.innerHTML=p;svg.style.opacity=0;svg.animate([{opacity:0},{opacity:1}],{duration:300,delay:350,fill:'forwards'});edges=now;}};}

 // ---------------------------------------------------------- LinkedList (nodes + next arrows, pointers below)
 function linked(host,o={}){host.className='ds ds-linked';const id=++uid,pcol=o.ptrColors||{};
  host.innerHTML=`<div class="pr"></div><div class="row-box"></div><svg class="links"><defs><marker id="ah${id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" style="fill:#475569;stroke:none"/></marker><marker id="ahb${id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" style="fill:#9333EA;stroke:none"/></marker></defs><g></g></svg>`;
  const pr=host.children[0],box=host.children[1],svg=host.children[2],g=svg.lastChild;let ptrEl={},links=new Set();
  return {set(st){probe(pr,st.probe);const ns=st.nodes||[],hl=st.hl||{};
   const res=keyed(box,ns.map(nd=>({k:nd.id,html:`<b>${E(nd.v)}</b><i></i>`,cls:hl[nd.id]})),{base:'lnode'});
   const P={};res.forEach(({el,k})=>P[k]={x:el.offsetLeft+box.offsetLeft,y:el.offsetTop+box.offsetTop,w:el.offsetWidth,h:el.offsetHeight});
   let s='';const now=new Set();
   ns.forEach((nd,i)=>{const a=P[nd.id];const nx=nd.next!==undefined?nd.next:(ns[i+1]?ns[i+1].id:null);const key=nd.id+'>'+nx;now.add(key);const fr=links.has(key)?'':'fresh';
    if(nx==null){s+=`<path class="${fr}" d="M${a.x+a.w} ${a.y+a.h/2} h10"/><text x="${a.x+a.w+12}" y="${a.y+a.h/2+4}">null</text>`;return;}
    const b=P[nx];if(!b)return;
    if(b.x>a.x)s+=`<path class="${fr}" marker-end="url(#ah${id})" d="M${a.x+a.w-9} ${a.y+a.h/2} L${b.x-2} ${b.y+b.h/2}"/>`;
    else s+=`<path class="back ${fr}" marker-end="url(#ahb${id})" d="M${a.x+a.w/2} ${a.y+a.h} C${a.x+a.w/2} ${a.y+a.h+30} ${b.x+b.w/2} ${b.y+b.h+30} ${b.x+b.w/2} ${b.y+b.h+2}"/>`;});
   g.innerHTML=s;links=now;
   const last=ns.length?P[ns[ns.length-1].id]:{x:0,y:box.offsetTop,w:0,h:42};
   svg.setAttribute('width',last.x+last.w+60);svg.setAttribute('height',last.y+last.h+40);
   const ptrs=st.ptrs||{},cnt={};let nulls=0;
   Object.keys(ptrs).forEach((k,j)=>{let el=ptrEl[k];if(!el){el=document.createElement('div');el.className='ptr';el.style.setProperty('--pc',pcol[k]||PC[j%5]);host.appendChild(el);ptrEl[k]=el;}
    const t=ptrs[k];let x,y,label=k;
    if(t==null||!P[t]){x=last.x+last.w+80+nulls*0;y=(last.y||box.offsetTop)+12+nulls*22;nulls++;label=k+' = null';}
    else{const a=P[t],r=cnt[t]=(cnt[t]||0)+1;x=a.x+a.w/2;y=a.y+a.h+36+(r-1)*22;}
    el.textContent=label;el.style.opacity=1;el.style.left=x+'px';el.style.top=y+'px';});
   Object.keys(ptrEl).forEach(k=>{if(!(k in ptrs))ptrEl[k].style.opacity=0;});
   host.style.minHeight=(last.y+last.h+36+22*Math.max(1,...Object.values(cnt),1)+6)+'px';
   host.style.minWidth=(last.x+last.w+140)+'px';}};}

 // ---------------------------------------------------------- 2D grid
 function grid(host,o={}){host.className='ds ds-grid';host.innerHTML='<div class="pr"></div><div class="g"></div>';
  const pr=host.children[0],g=host.children[1];let R=-1,C=-1,cells=[];
  return {set(st){probe(pr,st.probe);const m=st.cells||[[]],hl=st.hl||{};
   if(m.length!==R||m[0].length!==C){R=m.length;C=m[0].length;g.style.gridTemplateColumns=`repeat(${C},40px)`;g.innerHTML='';cells=[];
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){const d=document.createElement('div');g.appendChild(d);cells.push(d);}}
   for(let r=0;r<R;r++)for(let c=0;c<C;c++){const d=cells[r*C+c],v=m[r][c];if(d.textContent!==String(v))d.textContent=v;
    d.className='gc '+(o.cls?o.cls(v):'')+' '+(hl[r+','+c]||'');}}};}

 // ---------------------------------------------------------- intervals on a number line (one row per interval: label | bar)
 function intervals(host,o={}){host.className='ds ds-iv';const RH=o.rowH||28,LW=o.labelW||64;
  host.innerHTML='<div class="pr"></div><div class="ivs"></div><div class="axis"></div>';
  const [pr,box,ax]=host.children;let lastAx='';
  return {set(st){probe(pr,st.probe);const its=st.items||[],hl=st.hl||{};
   const lo=st.axis?st.axis[0]:Math.min(0,...its.map(x=>x.lo)),hi=st.axis?st.axis[1]:Math.max(1,...its.map(x=>x.hi));
   const room=(host.parentElement?host.parentElement.clientWidth:500)-LW-40,U=o.unit||Math.max(14,Math.min(48,Math.floor(room/Math.max(1,hi-lo))));
   const W=(hi-lo)*U;host.style.setProperty('--u',U+'px');host.style.setProperty('--lw',LW+'px');
   box.style.width=(LW+W+8)+'px';ax.style.width=(W+10)+'px';box.style.height=Math.max(1,its.length)*RH+'px';
   const res=keyed(box,its.map(x=>({k:x.id,html:`<span class="ivl">${x.label!=null?x.label:`[${x.lo},${x.hi}]`}</span><i class="ivb"></i>`,cls:hl[x.id]})),{base:'iv',flip:false,enter:[{opacity:0,transform:'translateX(-24px)'},{opacity:1,transform:'none'}],leave:[{opacity:1},{opacity:0}]});
   res.forEach(({el},i)=>{const x=its[i],b=el.lastChild;el.style.top=(i*RH)+'px';b.style.left=(LW+(x.lo-lo)*U)+'px';b.style.width=Math.max(6,(x.hi-x.lo)*U)+'px';});
   const k=lo+':'+hi+':'+U;if(k!==lastAx){lastAx=k;let t='';for(let v=lo;v<=hi;v++)if(U>=20||(v-lo)%2===0)t+=`<span style="left:${(v-lo)*U}px">${v}</span>`;ax.innerHTML=t;}}};}

 // ---------------------------------------------------------- variables
 function vars(host){host.classList.add('ds-vars');let last={};
  return {set(groups){const chg=[];
   host.innerHTML=groups.map((gr,gi)=>`<div class="vgroup"><h5 title="${gr.note||''}">${gr.t}${gr.note?`<em>${gr.note}</em>`:''}</h5><div class="vl">${gr.v.map(([n,v,f])=>{
     const s=v===undefined?'out of scope':show(v),key=gr.t+'.'+n,c=v!==undefined&&key in last&&last[key]!==s;last[key]=s;if(c)chg.push(key);
     return `<div class="vrow ${v===undefined?'off':''} ${f||''}" data-key="${E(key)}"><b>${E(n)}</b><span>${E(s)}</span></div>`;}).join('')}</div></div>`).join('');
   chg.forEach(k=>{const el=host.querySelector(`[data-key="${CSS.escape(k)}"]`);if(el)el.animate([{background:'#FEF08A',borderColor:'#FACC15'},{background:'#fff'}],{duration:1100});});},
   reset(){last={};}};}

 // ---------------------------------------------------------- code with current line + inline values
 function hlJava(l){const re=/(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)')|\b(public|private|static|final|new|return|void|if|else|for|while|do|break|continue|int|long|char|boolean|double|null|true|false|class)\b|\b([A-Z]\w*)\b|\b(\d+)\b/g;
  let o='',last=0,m;while((m=re.exec(l))){o+=E(l.slice(last,m.index));const c=m[1]?'c':m[2]?'s':m[3]?'k':m[4]?'t':'n';o+=`<span class="${c}">${E(m[0])}</span>`;last=re.lastIndex;}return o+E(l.slice(last));}
 function code(host,src){host.classList.add('codev');const L=src.replace(/^\n|\n\s*$/g,'').split('\n');
  host.innerHTML=L.map((l,i)=>`<div data-l="${i+1}"><em>${i+1}</em><span class="src">${hlJava(l)||' '}</span><span class="ann"></span></div>`).join('');
  const rows=[...host.children];
  return {set(lines,ann={}){const on=[].concat(lines||[]);rows.forEach((r,i)=>{const n=i+1,a=r.lastChild,t=ann[n]||'';r.classList.toggle('on',on.includes(n));if(a.textContent!==t){a.textContent=t;a.title=t;}});
   const f=rows[on[0]-1];if(f){const top=f.offsetTop,h=host.clientHeight;if(top<host.scrollTop||top>host.scrollTop+h-30)host.scrollTop=top-h/3;}},
   fit(reserve=26,annMax){if(!host.clientWidth)return true;host.style.fontSize='';host.classList.add('fitting');let fs=parseFloat(getComputedStyle(host).fontSize);
    const keep=rows.map(r=>r.lastChild.textContent);if(annMax){host.classList.add('annfit');rows.forEach((r,i)=>r.lastChild.textContent=annMax[i+1]||'');}
    const over=()=>Math.max(...rows.map(r=>r.offsetWidth))>host.clientWidth-reserve||host.scrollHeight>host.clientHeight+1;
    while(over()&&fs>11){fs-=.5;host.style.fontSize=fs+'px';}
    const ok=!over();host.classList.remove('fitting','annfit');rows.forEach((r,i)=>r.lastChild.textContent=keep[i]);return ok;}};}

 const KIND={array,arraylist,queue,stack,set,map,tree,treemap:tree,treeset:tree,linked,grid,intervals};
 function make(kind,host,o){if(!KIND[kind])throw new Error('DS kind '+kind);return KIND[kind](host,o||{});}
 return {make,vars,code,show,keyed};
})();
