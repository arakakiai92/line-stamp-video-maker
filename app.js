const W=1080,H=1920,DUR=15,FONT='"Hiragino Sans","Noto Sans JP","Meiryo",sans-serif';
const $=id=>document.getElementById(id),cv=$('cv'),c=cv.getContext('2d');
/* ===== 今回の素材 ===== */
const S={main:null,stamps:[],rec:null};
/* ===== 背景設定（テンプレートとは別管理）===== */
const LINE_BLUE='#CDEBFA';
const PRESETS=[['LINE風水色',LINE_BLUE],['白','#FFFFFF'],['淡いピンク','#FFE1EA'],['淡い黄色','#FFF6CC'],['淡い緑','#DDF4DC']]; // ← ここに追加すればプリセット増設
let BG={mode:'color',color:LINE_BLUE,solid:'#FFFFFF',img:null,opacity:100,blur:0,bright:0};
try{const o=JSON.parse(localStorage.getItem('lsvm_bg')||'null');if(o)Object.assign(BG,o,{img:null});if(BG.mode==='image')BG.mode='color'}catch(e){}
const saveBG=()=>{try{const{img,...o}=BG;localStorage.setItem('lsvm_bg',JSON.stringify(o))}catch(e){}};
/* ===== 画像読み込み ===== */
function load(file){return new Promise((ok,ng)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>ok({img,url,name:file.name});img.onerror=()=>ng();img.src=url})}
function dz(el,cb){['dragover','dragenter'].forEach(e=>el.addEventListener(e,v=>{v.preventDefault();el.classList.add('on')}));['dragleave','drop'].forEach(e=>el.addEventListener(e,v=>{v.preventDefault();el.classList.remove('on')}));el.addEventListener('drop',v=>cb([...v.dataTransfer.files]));el.querySelector('input').addEventListener('change',v=>{cb([...v.target.files]);v.target.value=''})}
const imgs=fs=>fs.filter(f=>/^image\/(png|jpe?g|webp)$/.test(f.type));
dz($('dzMain'),async fs=>{fs=imgs(fs);if(fs[0]){S.main=await load(fs[0]);ui()}});
dz($('dzSt'),async fs=>{fs=imgs(fs);for(const f of fs){if(S.stamps.length>=20){$('stMsg').textContent='最大20枚までです';break}try{S.stamps.push(await load(f))}catch(e){}}if(!S.rec)S.rec=S.stamps[0]||null;ui()});
dz($('dzRec'),async fs=>{fs=imgs(fs);if(!fs[0])return;try{const o=await load(fs[0]);if(S.stamps.length>=20){$('stMsg').textContent='最大20枚までです（不要な画像を×で消してください）';return}S.stamps.push(o);S.rec=o;ui()}catch(e){}});
dz($('dzBg'),async fs=>{fs=imgs(fs);if(fs[0]){BG.img=await load(fs[0]);$('bgName').textContent='使用中: '+BG.img.name;draw()}});
function ui(){
 $('mainTh').innerHTML='';if(S.main){const d=document.createElement('div');d.className='th';d.innerHTML='<img src="'+S.main.url+'"><span class="n">メイン</span>';const x=document.createElement('button');x.className='x';x.textContent='×';x.onclick=()=>{S.main=null;ui()};d.append(x);$('mainTh').append(d)}
 const t=$('stTh');t.innerHTML='';S.stamps.forEach((s,i)=>{const d=document.createElement('div');d.className='th'+(s===S.rec?' rec':'');d.title='クリックでおすすめに設定';d.innerHTML='<img src="'+s.url+'"><span class="n">'+(i+1)+'</span>'+(s===S.rec?'<span class="st">おすすめ</span>':'');d.onclick=()=>{S.rec=s;ui()};const x=document.createElement('button');x.className='x';x.textContent='×';x.onclick=e=>{e.stopPropagation();S.stamps.splice(i,1);if(S.rec===s)S.rec=S.stamps[0]||null;ui()};d.append(x);
  const mv=(a,b)=>{if(b<0||b>=S.stamps.length||a===b)return;const[o]=S.stamps.splice(a,1);S.stamps.splice(b,0,o);ui()};
  [['◀',-1,'left'],['▶',1,'left']].forEach(([l,dir],k)=>{const a=document.createElement('button');a.className='x mv';a.textContent=l;a.style.left=(3+k*20)+'px';a.title='順番を入れ替える';a.disabled=i+dir<0||i+dir>=S.stamps.length;a.onclick=e=>{e.stopPropagation();mv(i,i+dir)};d.append(a)});
  if(s!==S.rec){const a=document.createElement('button');a.className='x mv';a.textContent='☆';a.title='おすすめに設定';a.style.cssText='left:auto;right:3px;font-size:11px';a.onclick=e=>{e.stopPropagation();S.rec=s;ui()};d.append(a)}
  d.draggable=true;d.ondragstart=e=>{e.dataTransfer.setData('text/plain','stamp:'+i);e.dataTransfer.effectAllowed='move'};
  d.ondragover=e=>{e.preventDefault();d.style.outline='2px solid var(--ac)'};d.ondragleave=()=>d.style.outline='';
  d.ondrop=e=>{e.preventDefault();e.stopPropagation();d.style.outline='';const v=e.dataTransfer.getData('text/plain');if(v.startsWith('stamp:'))mv(+v.slice(6),i)};
  t.append(d)});
 $('recTh').innerHTML=S.rec?'<img src="'+S.rec.url+'"><span class="n">'+(S.stamps.indexOf(S.rec)+1)+'</span>':'';$('recMsg').textContent=S.rec?'現在：'+(S.stamps.indexOf(S.rec)+1)+'番目の画像。下の一覧で ☆ を押す／画像をクリックしても変更できます。':'スタンプを追加すると選べます。';
 $('stMsg').textContent=S.stamps.length?S.stamps.length+'枚'+(S.stamps.length<6?'（6枚以上を推奨します）':''):'';
 draw()}
/* ===== 背景UI ===== */
const key=()=>BG.mode==='solid'?'solid':'color';
function bgUI(){document.querySelector('input[name=bm][value='+BG.mode+']').checked=true;const im=BG.mode==='image';
 $('pColor').classList.toggle('hide',im);$('pImage').classList.toggle('hide',!im);$('adj').classList.toggle('hide',BG.mode==='solid');$('imgAdj').classList.toggle('hide',!im);
 $('cp').value=BG[key()];$('hex').value=BG[key()].toUpperCase();$('rB').value=BG.bright;$('rO').value=BG.opacity;$('rBl').value=BG.blur;
 $('chips').classList.toggle('hide',BG.mode!=='color')}
PRESETS.forEach(([n,h])=>{const b=document.createElement('button');b.className='chip';b.innerHTML='<i style="background:'+h+'"></i>'+n;b.onclick=()=>{BG.color=h;bgUI();saveBG();draw()};$('chips').append(b)});
document.querySelectorAll('input[name=bm]').forEach(r=>r.onchange=()=>{BG.mode=r.value;bgUI();saveBG();draw()});
$('cp').oninput=e=>{BG[key()]=e.target.value;$('hex').value=e.target.value.toUpperCase();saveBG();draw()};
$('hex').oninput=e=>{let v=e.target.value.trim();if(v&&v[0]!=='#')v='#'+v;if(/^#[0-9a-fA-F]{6}$/.test(v)){BG[key()]=v;$('cp').value=v;saveBG();draw()}};
[['rB','bright'],['rO','opacity'],['rBl','blur']].forEach(([i,k])=>$(i).oninput=e=>{BG[k]=+e.target.value;saveBG();draw()});
$('reset').onclick=()=>{BG.mode='color';BG.color=LINE_BLUE;BG.bright=0;BG.opacity=100;BG.blur=0;bgUI();saveBG();draw()};
/* ===== 描画ヘルパー ===== */
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),eob=x=>{x=cl(x);const a=1.70158,b=a+1;return 1+b*Math.pow(x-1,3)+a*Math.pow(x-1,2)},eo=x=>1-Math.pow(1-cl(x),3);
function drawBG(){c.fillStyle=BG.mode==='solid'?BG.solid:BG.color;c.fillRect(0,0,W,H);
 if(BG.mode==='image'&&BG.img){const im=BG.img.img,bl=BG.blur,k=Math.max(W/im.width,H/im.height)*(bl?1.06:1),w=im.width*k,h=im.height*k;c.save();c.globalAlpha=BG.opacity/100;if(bl)c.filter='blur('+bl+'px)';c.drawImage(im,(W-w)/2,(H-h)/2,w,h);c.restore()}
 if(BG.mode!=='solid'&&BG.bright){c.fillStyle=BG.bright<0?'rgba(0,0,0,'+(-BG.bright/100)+')':'rgba(255,255,255,'+(BG.bright/100)+')';c.fillRect(0,0,W,H)}}
function img(o,cx,cy,bw,bh,sc=1,rot=0,al=1){if(!o)return;const im=o.img,s=Math.min(bw/im.width,bh/im.height)*sc,w=im.width*s,h=im.height*s;c.save();c.globalAlpha*=al;c.translate(cx,cy);c.rotate(rot);c.shadowColor='rgba(0,0,0,.18)';c.shadowBlur=24;c.shadowOffsetY=10;c.drawImage(im,-w/2,-h/2,w,h);c.restore()}
function wrap(str,size,maxW){c.font='900 '+size+'px '+FONT;const lw=x=>c.measureText(x).width,out=[];
 for(const para of String(str).split('\n')){let line='';const toks=para.match(/[A-Za-z0-9'’.,!?&:;\-]+|\s|[\s\S]/gu)||[];
  for(const t of toks){const parts=lw(t)>maxW?[...t]:[t];for(const q of parts){if(!line&&/^\s$/.test(q))continue;if(line&&lw(line+q)>maxW){out.push(line.trimEnd());line=/^\s$/.test(q)?'':q}else line+=q}}
  out.push(line.trimEnd())}
 while(out.length&&!out[out.length-1])out.pop();if(out.length>5){out.length=5;out[4]+='…'}return out}
function blk(str,size,maxW,col){if(!str||!str.trim())return null;const L=wrap(str,size,maxW),lh=size*1.25;return{L,size,lh,h:L.length*lh,col:col||'#1d4f7a'}}
function drawBlk(b,cx,top,sc=1,al=1){if(!b)return;c.save();c.globalAlpha*=al;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.font='900 '+b.size+'px '+FONT;c.translate(cx,top+b.h/2);c.scale(sc,sc);c.lineWidth=b.size*.2;{const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(b.col)||[0,'1d','4f','7a'],lum=.299*parseInt(m[1],16)+.587*parseInt(m[2],16)+.114*parseInt(m[3],16);c.strokeStyle=lum>150?'#2b3a4a':'#fff';c.fillStyle=b.col}b.L.forEach((l,i)=>{const y=(i+.5)*b.lh-b.h/2;c.strokeText(l,0,y);c.fillText(l,0,y)});c.restore()}
function txt(str,cx,cy,size,maxW,sc=1,al=1,col){const b=blk(str,size,maxW,col);if(b)drawBlk(b,cx,Math.max(90,cy-b.h/2),sc,al)}
/* ===== テキスト設定（内容・サイズ・色）===== */
const TX={},TC='#1d4f7a';
(function(){const G=[['表紙',[['title','上部テキスト','新作LINEスタンプ！',96],['cover2','下部テキスト（任意）','',64,'例：毎日のLINEに使いやすい♪']]],['Scene 3',[['sub','テキスト','毎日のLINEに使いやすい♪',76]]],['最後の画面',[['end','メインメッセージ（固定文言）','LINE STOREで発売中',88,'',1],['end2','検索メッセージ（固定文言）','LINE STOREで\narakakiaiで検索 🔍',72,'',1]]]];
 G.forEach(([g,items])=>{const d=document.createElement('div');d.className='tg';d.innerHTML='<h3>'+g+'</h3>';
  items.forEach(([k,l,v,z,ph,fx])=>{TX[k]={t:v,z,col:TC};const w=document.createElement('div');w.innerHTML='<label class="f">'+l+(fx?'':'（Enterで改行）')+'</label>'+(fx?'<div class="fx"></div>':'<textarea rows="2" maxlength="120" placeholder="'+(ph||'')+'"></textarea>')+'<div class="row sz"><span class="szl">文字サイズ：<b></b>px</span><input type="range" min="24" max="200"><input type="number" class="num" min="24" max="200"><span>px</span></div><div class="row colr">文字色 <input type="color"><button type="button" class="b s" style="padding:4px 10px;font-size:12px">初期色に戻す</button></div>';
   const tx=w.querySelector('textarea'),[rg,nm]=w.querySelectorAll('input[type=range],input[type=number]'),cp=w.querySelector('input[type=color]'),rs=w.querySelector('button'),lb=w.querySelector('b');if(tx)tx.value=v;else w.querySelector('.fx').textContent=v;rg.value=nm.value=z;lb.textContent=z;cp.value=TC;
   const setZ=n=>{TX[k].z=n;lb.textContent=n;draw()};
   if(tx)tx.oninput=()=>{TX[k].t=tx.value;draw()};
   cp.oninput=()=>{TX[k].col=cp.value;draw()};rs.onclick=()=>{cp.value=TC;TX[k].col=TC;draw()};
   rg.oninput=()=>{nm.value=rg.value;setZ(+rg.value)};
   nm.oninput=()=>{const n=+nm.value;if(n>=24&&n<=200){rg.value=n;setZ(n)}};
   nm.onchange=()=>{const n=cl(Math.round(+nm.value||z),24,200);nm.value=rg.value=n;setZ(n)};
   d.append(w)});$('txtFields').append(d)})})();
/* ===== 動画テンプレート「通常」（構成・タイミング・動きは固定）===== */
const TEMPLATES={normal:{name:'通常',scenes:[
  {s:0,e:2,f:(lt,m,T)=>{const bp=d=>{const x=(lt-d)/.5;return x>0&&x<1?Math.sin(Math.PI*x)*(1-.3*x):0},b2=blk(T.cover2.t,T.cover2.z,920,T.cover2.col),dy=b2?0:110,n=m.rep.length,xs={1:[540],2:[350,730],3:[220,540,860]}[n]||[],bs=n===3?300:340;
  txt(T.title.t,W/2,270,T.title.z,920,1+.05*bp(.15),1,T.title.col);
  img(m.main,W/2,880+dy-bp(.3)*14,720,720,1+.07*bp(.3));
  m.rep.forEach((o,i)=>{const d=.5+i*.15;img(o,xs[i],1400+dy-bp(d)*14,bs,bs,1+.08*bp(d),(i-(n-1)/2)*.05)});
  if(b2)drawBlk(b2,W/2,Math.min(1650-b2.h/2,1800-b2.h),1+.05*bp(1))}},
 {s:2,e:6,f:(lt,m)=>{const P=[[-110,480,-1],[120,960,1],[-60,1440,-1]];m.A.forEach((o,i)=>{const d=i*1.2;if(lt<d)return;const p=(lt-d)/.6,q=P[i];img(o,W/2+q[0]+q[2]*420*(1-eo(p)),q[1],620,500,.6+.4*eob(p),q[2]*.05*(1-eo(p))+q[2]*.03,cl(p*2))})}},
 {s:6,e:9,f:(lt,m,T)=>{txt(T.sub.t,W/2,230,T.sub.z,920,.8+.2*eob(lt/.5),cl(lt/.3),T.sub.col);const P=[[340,700,0,-600],[740,1070,600,0],[380,1440,-600,300]];m.B.forEach((o,i)=>{const d=.3+i*.8;if(lt<d)return;const p=(lt-d)/.6,q=P[i];img(o,q[0]+q[2]*(1-eo(p)),q[1]+q[3]*(1-eo(p)),500,500,.6+.4*eob(p),(i-1)*.05,cl(p*2))})}},
 {s:9,e:12,f:(lt,m)=>{txt('おすすめ！',W/2,250,116,920,.8+.2*eob(lt/.5),cl(lt/.3));img(m.rec,W/2,1010+Math.sin(lt*3)*18,900,1000,(.6+.4*eob(lt/.6))*(1+.03*Math.sin(lt*3)),Math.sin(lt*2.2)*.05)}},
 {s:12,e:15,f:(lt,m,T)=>{img(m.main,W/2,440,720,520,.7+.3*eob(lt/.5));m.grid.forEach((o,i)=>{const d=.25+i*.15;if(lt<d)return;const p=(lt-d)/.5;img(o,240+(i%3)*300,880+Math.floor(i/3)*300,290,290,.6+.4*eob(p),0,cl(p*2))});const bm=blk(T.end.t,T.end.z,920,T.end.col),be=blk(T.end2.t,T.end2.z,920,T.end2.col),hm=bm?bm.h:0,gap=be?T.end.z*.3:0,tot=hm+(be?gap+be.h:0);let top=Math.max(1340,Math.min(1560-hm/2,1800-tot));const pm=(lt-1)/.6,pe=(lt-1.4)/.6,ps=q=>q<0?0:(q<1?.6+.4*eob(q):1);if(bm){drawBlk(bm,W/2,top,ps(pm),cl(pm*2));top+=hm+gap}if(be)drawBlk(be,W/2,top,ps(pe),cl(pe*2))}}
]}};
/* ===== 描画本体 ===== */
function mats(){const all=S.stamps.slice(),rec=S.rec||all[0]||null,oth=all.filter(x=>x!==rec),pool=oth.length?oth:all,cy=(a,i)=>a.length?a[i%a.length]:null,take=(o)=>[0,1,2].map(i=>cy(pool,o+i)).filter(Boolean);
 return{main:S.main||all[0]||null,rec,rep:[oth[0],rec,oth[1]].filter(Boolean),A:take(0),B:take(3),grid:[0,1,2,3,4,5].map(i=>cy(rec?[rec,...pool]:pool,i)).filter(Boolean)}}
function render(t){const T=TX,m=mats(),sc=TEMPLATES[$('tpl').value].scenes;t=cl(t,0,DUR-.001);c.clearRect(0,0,W,H);drawBG();
 const i=sc.findIndex(s=>t>=s.s&&t<s.e),s=sc[i],lt=t-s.s,d=s.e-s.s;c.save();c.globalAlpha=(i>0?cl(lt/.25):1)*(i<sc.length-1?cl((d-lt)/.25):1);s.f(lt,m,T);c.restore()}
let cur=0,running=false;
function draw(){if(!running)render(cur);$('tm').textContent=cur.toFixed(1)+' / '+DUR.toFixed(1)+'秒'}
$('seek').oninput=e=>{cur=+e.target.value;draw()};$('tpl').onchange=draw;
/* ===== プレビュー／録画 ===== */
function ready(){if(!S.stamps.length){$('stat').className='msg e';$('stat').textContent='スタンプ画像を追加してください';return false}$('stat').className='msg';return true}
function run(rec){return new Promise(ok=>{running=true;const t0=performance.now();(function f(){const t=(performance.now()-t0)/1000;cur=Math.min(t,DUR);render(cur);$('seek').value=cur;$('tm').textContent=cur.toFixed(1)+' / 15.0秒';if(t<DUR+(rec?.4:0))requestAnimationFrame(f);else{running=false;ok()}})()})}
$('bPrev').onclick=async()=>{if(running||!ready())return;$('stat').textContent='プレビュー再生中…';await run(false);$('stat').textContent=''};
let blob=null,ext='mp4';
$('bMake').onclick=async()=>{if(running||!ready())return;
 const mimes=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'],mime=window.MediaRecorder&&mimes.find(x=>MediaRecorder.isTypeSupported(x));
 if(!mime){$('stat').className='msg e';$('stat').textContent='このブラウザは動画書き出しに対応していません。最新のChrome / Edge / Safariでお試しください。';return}
 $('bMake').disabled=$('bPrev').disabled=true;$('stat').textContent='動画を作成中…（15秒間、このタブを開いたままにしてください）';
 cur=0;render(0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const rc=new MediaRecorder(cv.captureStream(30),{mimeType:mime,videoBitsPerSecond:8e6}),ch=[];rc.ondataavailable=e=>e.data.size&&ch.push(e.data);
 const done=new Promise(r=>rc.onstop=r);rc.start(500);await run(true);rc.stop();await done;
 blob=new Blob(ch,{type:mime.split(';')[0]});ext=mime.startsWith('video/mp4')?'mp4':'webm';
 $('vid').src=URL.createObjectURL(blob);$('result').classList.remove('hide');
 $('bSave').textContent=ext==='mp4'?'MP4を保存':'動画を保存（WebM）';
 $('fmtNote').textContent=ext==='mp4'?'MP4で書き出しました。':'このブラウザはWebM形式で書き出します。MP4が必要な場合は、Chrome/Edge/Safariの最新版で作成するか、無料の変換サービスでMP4に変換してください。';
 $('stat').textContent='完成しました！';$('bMake').disabled=$('bPrev').disabled=false;draw()};
$('bSave').onclick=()=>{if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='line-stamp-promo.'+ext;document.body.append(a);a.click();a.remove()};
bgUI();draw();
