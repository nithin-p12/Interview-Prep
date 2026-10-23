# usage: python shot.py <page.html> <outdir> hash1 hash2 ...   (screenshots at a 620px-high view)
import sys,os,subprocess,pathlib
page=pathlib.Path(os.path.abspath(sys.argv[1]));out=sys.argv[2];os.makedirs(out,exist_ok=True)
CH=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
for h in sys.argv[3:]:
 p=os.path.join(out,f'{page.stem}_{h}.png')
 subprocess.run([CH,'--headless=new','--disable-gpu','--hide-scrollbars','--window-size=1365,715','--virtual-time-budget=4000',f'--screenshot={p}',page.as_uri()+'#'+h],capture_output=True,timeout=180)
 try:
  from PIL import Image;im=Image.open(p);im.crop((0,0,1365,620)).save(p)
 except Exception as e: print('crop failed',e)
 print(p)
