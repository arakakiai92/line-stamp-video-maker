const W=1080,H=1920,DUR=15,FONT='"Hiragino Sans","Noto Sans JP","Meiryo",sans-serif';
const $=id=>document.getElementById(id),cv=$('cv'),c=cv.getContext('2d');
/* ===== 今回の素材 ===== */
const S={main:null,stamps:[],rec:null};
/* ===== 作品タイプ ===== */
const TYPES={
 normal:{label:'通常LINEスタンプ',noun:'スタンプ',accept:['image/png','image/jpeg','image/webp'],acceptNote:'PNG / JPG / WebP',hasMain:true,min:6,max:20,title:'新作LINEスタンプ！',tpl:'normal',soft:false},
 animStamp:{label:'アニメーションスタンプ',noun:'スタンプ',accept:['image/png','image/gif','image/webp'],acceptNote:'GIF / APNG(PNG) / アニメーションWebP',hasMain:true,min:6,max:20,title:'新作アニメーションスタンプ！',tpl:'normal',soft:true},
 emoji:{label:'LINE絵文字',noun:'絵文字',accept:['image/png','image/webp'],acceptNote:'PNG / WebP',hasMain:false,min:4,max:20,title:'新作LINE絵文字！',tpl:'grid',soft:false},
 animEmoji:{label:'アニメーション絵文字',noun:'絵文字',accept:['image/png','image/gif','image/webp'],acceptNote:'GIF / APNG(PNG) / アニメーションWebP',hasMain:false,min:4,max:20,title:'新作アニメーション絵文字！',tpl:'grid',soft:true}
};
let CUR='normal',titleTouched=false;
/* ===== 背景設定（テンプレートとは別管理）===== */
const LINE_BLUE='#CDEBFA';
const PRESETS=[['LINE風水色',LINE_BLUE],['白','#FFFFFF'],['淡いピンク','#FFE1EA'],['淡い黄色','#FFF6CC'],['淡い緑','#DDF4DC']]; // ← ここに追加すればプリセット増設
let BG={mode:'color',color:LINE_BLUE,solid:'#FFFFFF',img:null,opacity:100,blur:0,bright:0};
try{const o=JSON.parse(localStorage.getItem('lsvm_bg')||'null');if(o)Object.assign(BG,o,{img:null});if(BG.mode==='image')BG.mode='color'}catch(e){}
const saveBG=()=>{try{const{img,...o}=BG;localStorage.setItem('lsvm_bg',JSON.stringify(o))}catch(e){}};
/* ===== 画像読み込み ===== */
const ANIM_HOST=document.createElement('div');ANIM_HOST.style.cssText='position:fixed;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none';document.body.appendChild(ANIM_HOST);
function load(file){return new Promise((ok,ng)=>{const url=URL.createObjectURL(file),image=new Image();image.onload=()=>{ANIM_HOST.appendChild(image);ok({img:image,url,name:file.name,node:image})};image.onerror=()=>ng();image.src=url})}
function dz(el,cb){['dragover','dragenter'].forEach(e=>el.addEventListener(e,v=>{v.preventDefault();el.classList.add('on')}));['dragleave','drop'].forEach(e=>el.addEventListener(e,v=>{v.preventDefault();el.classList.remove('on')}));el.addEventListener('drop',v=>cb([...v.dataTransfer.files]));el.querySelector('input').addEventListener('change',v=>{cb([...v.target.files]);v.target.value=''})}
const imgsBG=fs=>fs.filter(f=>/^image\/(png|jpe?g|webp)$/.test(f.type));
function splitByType(fs){const at=TYPES[CUR].accept,ok=[],bad=[];fs.forEach(f=>(at.includes(f.type)?ok:bad).push(f));return{ok,bad}}
function warnBad(bad){if(bad.length)alert('対応していない形式のため追加できませんでした：\n'+bad.map(f=>f.name+'（'+(f.type||'不明な形式')+'）').join('\n')+'\n\n現在の作品タイプで使える形式：'+TYPES[CUR].acceptNote)}
dz($('dzMain'),async fs=>{const{ok,bad}=splitByType(fs);warnBad(bad);if(ok[0]){S.main=await load(ok[0]);ui()}});
dz($('dzSt'),async fs=>{const{ok,bad}=splitByType(fs);warnBad(bad);for(const f of ok){if(S.stamps.length>=TYPES[CUR].max){$('stMsg').textContent='最大'+TYPES[CUR].max+'枚までです';break}try{S.stamps.push(await load(f))}catch(e){}}if(!S.rec)S.rec=S.stamps[0]||null;ui()});
dz($('dzRec'),async fs=>{const{ok,bad}=splitByType(fs);warnBad(bad);if(!ok[0])return;try{const o=await load(ok[0]);if(S.stamps.length>=TYPES[CUR].max){$('stMsg').textContent='最大'+TYPES[CUR].max+'枚までです（不要な画像を×で消してください）';return}S.stamps.push(o);S.rec=o;ui()}catch(e){}});
dz($('dzBg'),async fs=>{fs=imgsBG(fs);if(fs[0]){BG.img=await load(fs[0]);$('bgName').textContent='使用中: '+BG.img.name;draw()}});
function ui(){
 $('mainTh').innerHTML='';if(S.main){const d=document.createElement('div');d.className='th';d.innerHTML='<img src="'+S.main.url+'"><span class="n">メイン</span>';const x=document.createElement('button');x.className='x';x.textContent='×';x.onclick=()=>{S.main=null;ui()};d.append(x);$('mainTh').append(d)}
 const t=$('stTh');t.innerHTML='';S.stamps.forEach((s,i)=>{const d=document.createElement('div');d.className='th'+(s===S.rec?' rec':'');d.title='クリックで「おすすめ」に設定';d.innerHTML='<img src="'+s.url+'"><span class="n">'+(i+1)+'</span>'+(s===S.rec?'<span class="st">おすすめ</span>':'');d.onclick=()=>{S.rec=s;ui()};const x=document.createElement('button');x.className='x';x.textContent='×';x.onclick=e=>{e.stopPropagation();S.stamps.splice(i,1);if(S.rec===s)S.rec=S.stamps[0]||null;ui()};d.append(x);
  const mv=(a,b)=>{if(b<0||b>=S.stamps.length||a===b)return;const[o]=S.stamps.splice(a,1);S.stamps.splice(b,0,o);ui()};
  [['◀',-1,'left'],['▶',1,'left']].forEach(([l,dir],k)=>{const a=document.createElement('button');a.className='x mv';a.textContent=l;a.style.left=(3+k*20)+'px';a.title='順番を入れ替える';a.disabled=i+dir<0||i+dir>=S.stamps.length;a.onclick=e=>{e.stopPropagation();mv(i,i+dir)};d.append(a)});
  if(s!==S.rec){const a=document.createElement('button');a.className='x mv';a.textContent='☆';a.title='おすすめに設定';a.style.cssText='left:auto;right:3px;font-size:11px';a.onclick=e=>{e.stopPropagation();S.rec=s;ui()};d.append(a)}
  d.draggable=true;d.ondragstart=e=>{e.dataTransfer.setData('text/plain','stamp:'+i);e.dataTransfer.effectAllowed='move'};
  d.ondragover=e=>{e.preventDefault();d.style.outline='2px solid var(--ac)'};d.ondragleave=()=>d.style.outline='';
  d.ondrop=e=>{e.preventDefault();e.stopPropagation();d.style.outline='';const v=e.dataTransfer.getData('text/plain');if(v.startsWith('stamp:'))mv(+v.slice(6),i)};
  t.append(d)});
 $('recTh').innerHTML=S.rec?'<img src="'+S.rec.url+'"><span class="n">'+(S.stamps.indexOf(S.rec)+1)+'</span>':'';$('recMsg').textContent=S.rec?'現在：'+(S.stamps.indexOf(S.rec)+1)+'番目の画像。下の一覧で ☆ を押す／画像をクリックしても変更できます。':'素材を追加すると選べます。';
 $('stMsg').textContent=S.stamps.length?S.stamps.length+'枚'+(S.stamps.length<TYPES[CUR].min?'（'+TYPES[CUR].min+'枚以上を推奨します）':''):'';
 draw()}
/* ===== 作品タイプの切り替え ===== */
function applyType(){const T=TYPES[CUR];
 $('fMain').accept=$('fSt').accept=$('fRec').accept=T.accept.join(',');
 $('mainBlock').classList.toggle('hide',!T.hasMain);
 $('stHint').textContent=T.noun+'（'+T.min+'〜'+T.max+'枚）／☆またはクリックで「おすすめに設定」／ドラッグまたは ◀▶ で並べ替え／対応形式：'+T.acceptNote;
 $('recLabel').textContent='★ おすすめ'+T.noun+'（Scene 4で大きく表示）';
 $('tplName').textContent=T.label+'で動画を作成します（15秒・縦型）'+(T.soft?'。素材自体の動きを活かし、追加のアニメーションは控えめにしています。':'。');
 if(!titleTouched&&TXEls.title){TX.title.t=T.title;TXEls.title.tx.value=T.title}
 draw()}
document.querySelectorAll('input[name=wt]').forEach(r=>r.onchange=()=>{
 const nv=r.value;
 if(nv!==CUR&&(S.main||S.stamps.length)){
  if(!confirm('作品タイプを変更すると、アップロード済みの素材（画像・おすすめ設定）がリセットされます。よろしいですか？')){
   document.querySelector('input[name=wt][value="'+CUR+'"]').checked=true;return}
  S.main=null;S.stamps=[];S.rec=null}
 CUR=nv;applyType();ui()});
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
const TX={},TXEls={},TC='#1d4f7a';
(function(){const G=[['表紙',[['title','上部テキスト','新作LINEスタンプ！',96],['cover2','下部テキスト（任意）','',64,'例：毎日のLINEに使いやすい♪']]],['Scene 3',[['sub','テキスト','毎日のLINEに使いやすい♪',76]]],['最後の画面',[['end','メインメッセージ（固定文言）','LINE STOREで発売中',88,'',1],['end2','検索メッセージ（固定文言）','LINE STOREで\narakakiaiで検索 🔍',72,'',1]]]];
 G.forEach(([g,items])=>{const d=document.createElement('div');d.className='tg';d.innerHTML='<h3>'+g+'</h3>';
  items.forEach(([k,l,v,z,ph,fx])=>{TX[k]={t:v,z,col:TC};const w=document.createElement('div');w.innerHTML='<label class="f">'+l+(fx?'':'（Enterで改行）')+'</label>'+(fx?'<div class="fx"></div>':'<textarea rows="2" maxlength="120" placeholder="'+(ph||'')+'"></textarea>')+'<div class="row sz"><span class="szl">文字サイズ：<b></b>px</span><input type="range" min="24" max="200"><input type="number" class="num" min="24" max="200"><span>px</span></div><div class="row colr">文字色 <input type="color"><button type="button" class="b s" style="padding:4px 10px;font-size:12px">初期色に戻す</button></div>';
   const tx=w.querySelector('textarea'),[rg,nm]=w.querySelectorAll('input[type=range],input[type=number]'),cp=w.querySelector('input[type=color]'),rs=w.querySelector('button'),lb=w.querySelector('b');if(tx)tx.value=v;else w.querySelector('.fx').textContent=v;rg.value=nm.value=z;lb.textContent=z;cp.value=TC;TXEls[k]={tx,rg,nm,cp,lb};
   const setZ=n=>{TX[k].z=n;lb.textContent=n;draw()};
   if(tx)tx.oninput=()=>{TX[k].t=tx.value;if(k==='title')titleTouched=true;draw()};
   cp.oninput=()=>{TX[k].col=cp.value;draw()};rs.onclick=()=>{cp.value=TC;TX[k].col=TC;draw()};
   rg.oninput=()=>{nm.value=rg.value;setZ(+rg.value)};
   nm.oninput=()=>{const n=+nm.value;if(n>=24&&n<=200){rg.value=n;setZ(n)}};
   nm.onchange=()=>{const n=cl(Math.round(+nm.value||z),24,200);nm.value=rg.value=n;setZ(n)};
   d.append(w)});$('txtFields').append(d)})})();
/* ===== 動画テンプレート（構成・タイミングは固定。soft=trueの素材（アニメーション系）は追加の動きを控えめに）===== */
function sfA(m,v){return m.soft?v*.45:v}     // 登場ポップの振幅
function sfI(m,v){return m.soft?v*.35:v}     // ループする“揺れ”の振幅
function endTexts(lt){const T=TX,bm=blk(T.end.t,T.end.z,920,T.end.col),be=blk(T.end2.t,T.end2.z,920,T.end2.col),hm=bm?bm.h:0,gap=be?T.end.z*.3:0,tot=hm+(be?gap+be.h:0);let top=Math.max(1340,Math.min(1560-hm/2,1800-tot));const pm=(lt-1)/.6,pe=(lt-1.4)/.6,ps=q=>q<0?0:(q<1?.6+.4*eob(q):1);if(bm){drawBlk(bm,W/2,top,ps(pm),cl(pm*2));top+=hm+gap}if(be)drawBlk(be,W/2,top,ps(pe),cl(pe*2))}
function sceneCover(lt,m,T){const bp=d=>{const x=(lt-d)/.5;return x>0&&x<1?Math.sin(Math.PI*x)*(1-.3*x):0},b2=blk(T.cover2.t,T.cover2.z,920,T.cover2.col),dy=b2?0:110,n=m.rep.length,xs={1:[540],2:[350,730],3:[220,540,860]}[n]||[],bs=n===3?300:340;
 txt(T.title.t,W/2,270,T.title.z,920,1+.05*bp(.15),1,T.title.col);
 img(m.main,W/2,880+dy-sfA(m,bp(.3))*14,720,720,1+.07*sfA(m,bp(.3)));
 m.rep.forEach((o,i)=>{const d=.5+i*.15;img(o,xs[i],1400+dy-sfA(m,bp(d))*14,bs,bs,1+.08*sfA(m,bp(d)),(i-(n-1)/2)*.05)});
 if(b2)drawBlk(b2,W/2,Math.min(1650-b2.h/2,1800-b2.h),1+.05*bp(1))}
function sceneRec(lt,m){txt('おすすめ！',W/2,250,116,920,.8+.2*eob(lt/.5),cl(lt/.3));img(m.rec,W/2,1010+Math.sin(lt*3)*18*sfI(m,1),900,1000,(.6+.4*eob(lt/.6))*(1+.03*Math.sin(lt*3)*sfI(m,1)),Math.sin(lt*2.2)*.05*sfI(m,1))}
/* 画面比率・余白を考慮し、n個を最も大きく収められる列数を総当たりで探す（9:16の表紙・Scene2/3・最終カットで使用）*/
function bestGrid(n,aw,ah){let best=null;for(let cols=1;cols<=n;cols++){const rows=Math.ceil(n/cols),size=Math.min(aw/cols,ah/rows);if(!best||size>best.size)best={cols,rows,size}}return best}
function layoutDense(items,top,bottom){const n=items.length;if(!n)return[];const aw=1000,ah=Math.max(40,bottom-top),g=bestGrid(n,aw,ah),cellW=aw/g.cols,cellH=ah/g.rows,size=g.size*.94;
 return items.map((o,i)=>{const row=Math.floor(i/g.cols),col=i-row*g.cols,itemsInRow=Math.min(g.cols,n-row*g.cols),rowW=itemsInRow*cellW,x=W/2-rowW/2+cellW*(col+.5),y=top+cellH*(row+.5);return{o,x,y,size,i}})}
function evenSample(arr,k){if(k>=arr.length)return arr.slice();if(k<=0)return[];const out=[];for(let i=0;i<k;i++)out.push(arr[Math.floor(i*arr.length/k)]);return out}
function fitCount(n,aw,ah,minSize){if(!n)return 0;for(let k=n;k>=1;k--){if(bestGrid(k,aw,ah).size>=minSize)return k}return 1}
/* Scene1（絵文字の表紙）：アップロード済み全素材を、画面に収まる最大サイズのグリッドで一覧表示 */
function sceneCoverGrid(lt,m,T){const bp=d=>{const x=(lt-d)/.5;return x>0&&x<1?Math.sin(Math.PI*x)*(1-.3*x):0},b2=blk(T.cover2.t,T.cover2.z,920,T.cover2.col);
 txt(T.title.t,W/2,230,T.title.z,920,1+.05*bp(.15),1,T.title.col);
 const bandBottom=b2?1860-(b2.h+30):1860,amp=m.soft?.4:1;
 layoutDense(m.coverAll,400,bandBottom).forEach(({o,x,y,size,i})=>{const d=.2+(i%10)*.05;img(o,x,y-bp(d)*8*amp,size,size,1+.05*bp(d)*amp)});
 if(b2)drawBlk(b2,W/2,bandBottom+14,1+.05*bp(1))}
const TEMPLATES={
 normal:{name:'通常',scenes:[
  {s:0,e:2,f:sceneCover},
  {s:2,e:6,f:(lt,m)=>{const P=[[-110,480,-1],[120,960,1],[-60,1440,-1]];m.A.forEach((o,i)=>{const d=i*1.2;if(lt<d)return;const p=(lt-d)/.6,q=P[i];img(o,W/2+q[0]+q[2]*420*(1-eo(p)),q[1],620,500,.6+sfA(m,.4)*eob(p),q[2]*.05*(1-eo(p))+q[2]*.03,cl(p*2))})}},
  {s:6,e:9,f:(lt,m,T)=>{txt(T.sub.t,W/2,230,T.sub.z,920,.8+.2*eob(lt/.5),cl(lt/.3),T.sub.col);const P=[[340,700,0,-600],[740,1070,600,0],[380,1440,-600,300]];m.B.forEach((o,i)=>{const d=.3+i*.8;if(lt<d)return;const p=(lt-d)/.6,q=P[i];img(o,q[0]+q[2]*(1-eo(p)),q[1]+q[3]*(1-eo(p)),500,500,.6+sfA(m,.4)*eob(p),(i-1)*.05,cl(p*2))})}},
  {s:9,e:12,f:sceneRec},
  {s:12,e:15,f:(lt,m)=>{img(m.main,W/2,440,720,520,.7+.3*eob(lt/.5));m.grid.forEach((o,i)=>{const d=.25+i*.15;if(lt<d)return;const p=(lt-d)/.5;img(o,240+(i%3)*300,880+Math.floor(i/3)*300,290,290,.6+.4*eob(p),0,cl(p*2))});endTexts(lt)}}
 ]},
 grid:{name:'絵文字',scenes:[
  {s:0,e:2,f:sceneCoverGrid},
  {s:2,e:6,f:(lt,m)=>{layoutDense(m.rep2,320,1700).forEach(({o,x,y,size,i})=>{const d=i*.05;if(lt<d)return;const p=(lt-d)/.5;img(o,x,y,size,size,.6+sfA(m,.4)*eob(p),0,cl(p*2))})}},
  {s:6,e:9,f:(lt,m,T)=>{txt(T.sub.t,W/2,230,T.sub.z,920,.8+.2*eob(lt/.5),cl(lt/.3),T.sub.col);layoutDense(m.rep3,400,1700).forEach(({o,x,y,size,i})=>{const d=.1+i*.05;if(lt<d)return;const p=(lt-d)/.5;img(o,x,y,size,size,.6+sfA(m,.4)*eob(p),0,cl(p*2))})}},
  {s:9,e:12,f:sceneRec},
  {s:12,e:15,f:(lt,m)=>{layoutDense(m.gEnd,260,1300).forEach(({o,x,y,size,i})=>{const d=i*.05;if(lt<d)return;const p=(lt-d)/.5;img(o,x,y,size,size,.6+sfA(m,.4)*eob(p),0,cl(p*2))});endTexts(lt)}}
 ]}
};
/* ===== 描画本体 ===== */
function mats(){const all=S.stamps.slice(),rec=S.rec||all[0]||null,gmain=S.main||rec||all[0]||null;
 let repSrc=all.filter(x=>x!==gmain);if(rec&&rec!==gmain)repSrc=[rec,...repSrc.filter(x=>x!==rec)];
 const cyc=(a,i)=>a.length?a[i%a.length]:null,rep=[0,1,2].map(i=>cyc(repSrc,i)).filter(Boolean);
 const oth=all.filter(x=>x!==rec),pool=oth.length?oth:all,cy=(a,i)=>a.length?a[i%a.length]:null,take=(o,n=3)=>[...Array(n)].map((_,i)=>cy(pool,o+i)).filter(Boolean);
 const recPool=rec?[rec,...pool]:pool;
 const repTarget=Math.min(16,Math.floor(all.length/2));
 const rep2=pool.slice(0,Math.min(repTarget,pool.length));
 let rep3=pool.slice(rep2.length,rep2.length+repTarget);
 if(rep3.length<Math.min(repTarget,pool.length))rep3=rep3.concat(pool.slice(0,Math.min(repTarget,pool.length)-rep3.length));
 const gEndN=fitCount(all.length,1000,1300-260,78),gEnd=evenSample(all,gEndN);
 return{main:gmain,rec,soft:!!TYPES[CUR].soft,rep,A:take(0,3),B:take(3,3),
  grid:[...Array(6)].map((_,i)=>cy(recPool,i)).filter(Boolean),
  coverAll:all,rep2,rep3,gEnd}}
function render(t){const T=TX,m=mats(),sc=TEMPLATES[TYPES[CUR].tpl].scenes;t=cl(t,0,DUR-.001);c.clearRect(0,0,W,H);drawBG();
 const i=sc.findIndex(s=>t>=s.s&&t<s.e),s=sc[i],lt=t-s.s,d=s.e-s.s;c.save();c.globalAlpha=(i>0?cl(lt/.25):1)*(i<sc.length-1?cl((d-lt)/.25):1);s.f(lt,m,T);c.restore()}
let cur=0,running=false;
function draw(){if(!running)render(cur);$('tm').textContent=cur.toFixed(1)+' / '+DUR.toFixed(1)+'秒'}
$('seek').oninput=e=>{cur=+e.target.value;draw()};
/* ===== プレビュー／録画 ===== */
function ready(){if(!S.stamps.length){$('stat').className='msg e';$('stat').textContent=TYPES[CUR].noun+'画像を追加してください';return false}$('stat').className='msg';return true}
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
applyType();bgUI();draw();
