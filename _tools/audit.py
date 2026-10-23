# usage: python audit.py <page.html> [height ...]   -> prints errors + per-slide overflow (before/after clicking everything)
import sys,os,subprocess,re,html
page=os.path.abspath(sys.argv[1]);heights=[int(h) for h in sys.argv[2:]] or [715,745]
CH=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HEAD="""<script>window.__E=[];window.onerror=(m,s,l,c,e)=>{__E.push(m+' @'+l)};window.addEventListener('unhandledrejection',e=>__E.push('rej '+e.reason));</script>"""
AUD="""<script>setTimeout(async()=>{const out=[];const W=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<DECK.flat.length;i++){DECK.goFlat(i);await W(30);const f=DECK.flat[i],sl=f.sl;const a=sl.scrollHeight-sl.clientHeight;
 const k=sl.firstElementChild.style.getPropertyValue('--k');
 // click every control on the slide (not navigation)
 const bs=[...sl.querySelectorAll('button,input[type=checkbox],label.chk')].filter(b=>!b.closest('.hnav,.ref,.tcat,.sh')&&!b.matches('.hnav,[data-go],[data-goflat]'));
 for(let r=0;r<3;r++)for(const b of bs){try{b.click();}catch(e){__E.push('click '+e)}}
 await W(400);const b2=sl.scrollHeight-sl.clientHeight;
 const wide=[...sl.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='visible'&&!e.closest('pre,.tabs,.acc')).length;
 out.push(f.num+' k='+k+' over='+a+' afterClicks='+b2+(wide?' hscroll='+wide:''));}
document.body.innerHTML='<pre id=AUD>'+out.join("<br>")+'<br>ERRORS:'+JSON.stringify(__E)+'</pre>';},600);</script>"""
src=open(page,encoding='utf-8').read()
src=src.replace('<head>','<head>'+HEAD,1).replace('</body>',AUD+'</body>',1)
tmp=os.path.join(os.path.dirname(page),'_audit_tmp_'+os.path.splitext(os.path.basename(page))[0]+'.html');open(tmp,'w',encoding='utf-8').write(src)
try:
 for h in heights:
  r=subprocess.run([CH,'--headless=new','--disable-gpu','--allow-file-access-from-files',f'--window-size=1365,{h}','--virtual-time-budget=60000','--dump-dom',__import__('pathlib').Path(tmp).as_uri()],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=180)
  m=re.search(r'<pre id="AUD">(.*?)</pre>',r.stdout,re.S)
  print(f'== viewport {h-95}px');print(html.unescape(m.group(1)).replace("<br>",chr(10)) if m else 'NO OUTPUT\n'+r.stdout[-1500:]+r.stderr[-800:])
finally: os.remove(tmp)
