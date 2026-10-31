/* app.js — 十神論命：輸入、大運流年、命例儲存、下載分享 */
(function(){
var G=CAL.GAN,Z=CAL.ZHI,CUR_YEAR=2026;
function $(i){return document.getElementById(i);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function gz60(i){i=((i%60)+60)%60;return G[i%10]+Z[i%12];}
function gzIdx(s){for(var i=0;i<60;i++)if(gz60(i)===s)return i;return -1;}
var MODE='d',ST=null,DYSEL=null,LNR=null;
/* ---- 模式切換 ---- */
function setMode(m){MODE=m;$('mD').className=m==='d'?'on':'';$('mP').className=m==='p'?'on':'';$('fD').style.display=m==='d'?'':'none';$('fP').style.display=m==='p'?'':'none';}
$('mD').onclick=function(){setMode('d');};$('mP').onclick=function(){setMode('p');};
/* ---- 節氣：求鄰近「節」(黃經 15+30k) 之 JD ---- */
function solveLon(J,target){for(var k=0;k<30;k++){var L=CAL.sunLon(J),d=((target-L+540)%360)-180;J+=d/0.98565;if(Math.abs(d)<1e-6)break;}return J;}
var JIE={285:'小寒',315:'立春',345:'驚蟄',15:'清明',45:'立夏',75:'芒種',105:'小暑',135:'立秋',165:'白露',195:'寒露',225:'立冬',255:'大雪'};
function jieAround(J){var L=CAL.sunLon(J),k=Math.floor((((L-15)%360)+360)%360/30),prevT=(15+30*k)%360,nextT=(15+30*(k+1))%360;
 return {prev:{t:prevT,n:JIE[prevT],J:solveLon(J-(((L-prevT)%360+360)%360)/0.98565,prevT)},next:{t:nextT,n:JIE[nextT],J:solveLon(J+(((nextT-L)%360+360)%360)/0.98565,nextT)}};}
function jdToDate(J,tz){var ms=(J-2440587.5)*86400000+tz*3600000;var d=new Date(ms);return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),h:d.getUTCHours(),mi:d.getUTCMinutes(),s:d.getUTCFullYear()+'/'+(d.getUTCMonth()+1)+'/'+d.getUTCDate()+' '+('0'+d.getUTCHours()).slice(-2)+':'+('0'+d.getUTCMinutes()).slice(-2)};}
/* ---- 大運 ---- */
function dayun(st){var p=st.pillars,ys=G.indexOf(p[0].charAt(0)),yang=ys%2===0,fwd=(yang&&st.sex==='男')||(!yang&&st.sex==='女');
 var r={fwd:fwd,steps:[],info:''},mi=gzIdx(p[1]);
 var startAge=null,startYear=null,birthYear=st.birthYear||null;
 if(st.mode==='d'){var a=st.date.split('-').map(Number),t=st.time.split(':').map(Number),J=CAL.jd(a[0],a[1],a[2],t[0]+t[1]/60-st.tz),A=jieAround(J),tgt=fwd?A.next:A.prev,days=Math.abs(tgt.J-J);
  startAge=days/3;birthYear=a[0];var sJ=J+startAge*365.2422,sd=jdToDate(sJ,st.tz);startYear=sd.y;
  var yy=Math.floor(startAge),mm=Math.round((startAge-yy)*12);if(mm===12){yy++;mm=0;}
  r.info='生於'+A.prev.n+'（'+jdToDate(A.prev.J,st.tz).s+'）後、'+A.next.n+'（'+jdToDate(A.next.J,st.tz).s+'）前；'+(fwd?'順':'逆')+'排至'+tgt.n+'相距 '+days.toFixed(2)+' 日，三日折一年 → 起運約 '+yy+' 歲 '+mm+' 個月，交運日約 '+sd.s+'（'+startYear+' 年交運）。';}
 else if(st.startAge!=null&&st.startAge!==''){startAge=+st.startAge;if(birthYear)startYear=birthYear+Math.round(startAge);r.info='起運歲數依使用者輸入：'+startAge+' 歲'+(birthYear?'；出生年 '+birthYear:'（未填出生年，僅列歲數）')+'。';}
 else r.info='直接輸入八字且未提供起運歲數／出生年，大運僅列順序，無歲數與年份。可填「起運歲數」或用「搜尋相符日期」選定生日。';
 r.dir=(yang?'陽':'陰')+'年'+st.sex+'命 → 大運'+(fwd?'順行':'逆行');
 for(var i=1;i<=10;i++){var s={gz:gz60(mi+(fwd?i:-i)),n:i};
  if(startYear!=null){s.y0=startYear+(i-1)*10;s.y1=s.y0+9;s.a0=s.y0-birthYear;s.a1=s.a0+9;}
  else if(startAge!=null){s.a0=Math.round(startAge)+(i-1)*10;s.a1=s.a0+9;}
  r.steps.push(s);}
 r.birthYear=birthYear;r.startYear=startYear;return r;}
function ssOf(dm,gz){var cg={子:'癸',丑:'己',寅:'甲',卯:'乙',辰:'戊',巳:'丙',午:'丁',未:'己',申:'庚',酉:'辛',戌:'戊',亥:'壬'};return [SS.ss(dm,gz.charAt(0)),SS.ss(dm,cg[gz.charAt(1)])];}
function reading(dm,gz,re){var s=ssOf(dm,gz),k=s[0]+'坐'+s[1],f=BK.field(k,re);return {s:s,k:k,f:f};}
function dyHtml(st,D){var dm=st.pillars[2].charAt(0),o=['<h2 id="dyTop">大運與流年</h2><p>'+D.dir+'。'+esc(D.info)+'</p><p class="note">大運以月柱為起點，陽男陰女順行、陰男陽女逆行；起運以出生至鄰近「節」之日數三日折一年（節氣以太陽黃經簡算，可能有數分鐘誤差）。歲數以「交運年－出生年」計。</p>'];
 o.push('<div class="dy noexp">'+D.steps.map(function(s,i){var x=ssOf(dm,s.gz);return '<button type="button" data-i="'+i+'" class="'+(i===DYSEL?'on':'')+'">'+(s.a0!=null?s.a0+'–'+s.a1+'歲':'第'+s.n+'運')+'<b>'+s.gz+'</b>'+x[0]+'<br>'+x[1]+(s.y0!=null?'<br>'+s.y0:'')+'</button>';}).join('')+'</div>');
 o.push('<div class="scr"><table class="ln"><tr><th>運</th><th>干支</th><th>干神</th><th>支神（本氣）</th><th>歲數</th><th>年份</th><th>本象</th></tr>'+D.steps.map(function(s){var R=reading(dm,s.gz,/^大運/);return '<tr><td>'+s.n+'</td><td>'+s.gz+'</td><td>'+R.s[0]+'</td><td>'+R.s[1]+'</td><td>'+(s.a0!=null?s.a0+'–'+s.a1:'—')+'</td><td>'+(s.y0!=null?s.y0+'–'+s.y1:'—')+'</td><td>'+(R.f?R.f.v:'')+'</td></tr>';}).join('')+'</table></div>');
 if(DYSEL!=null){var s=D.steps[DYSEL],R=reading(dm,s.gz,/^大運/);o.push('<h3>第'+s.n+'運 '+s.gz+'（'+R.k+'）'+(s.y0!=null?' '+s.y0+'–'+s.y1:'')+'</h3><p>'+(R.f?BK.badge(R.f.v)+' <b>【'+esc(R.f.l)+'】</b>'+esc(R.f.t):'')+'</p>');}
 var y0=LNR[0],y1=LNR[1];
 o.push('<h3>流年 '+y0+'–'+y1+'</h3><div class="row noexp"><label>起<input type="number" id="ly0" value="'+y0+'" min="1900" max="2100"></label><label>迄<input type="number" id="ly1" value="'+y1+'" min="1900" max="2100"></label><button type="button" class="sec" id="lyGo">更新流年</button><button type="button" class="sec" id="lyNow">今年 '+CUR_YEAR+' 前後五年</button></div>');
 var rows=[];for(var y=y0;y<=y1;y++){var gz=gz60(y-4),R=reading(dm,gz,/^流年/),dy=null;D.steps.forEach(function(s){if(s.y0!=null&&y>=s.y0&&y<=s.y1)dy=s.gz;});
  rows.push('<tr'+(y===CUR_YEAR?' style="background:#fff4e5"':'')+'><td>'+y+(D.birthYear?'<br><span class="note">'+(y-D.birthYear)+'歲</span>':'')+'</td><td class="big2">'+gz+'</td><td>'+R.s[0]+'<br>'+R.s[1]+'</td><td>'+(dy||'—')+'</td><td class="wr">'+(R.f?BK.badge(R.f.v)+' '+esc(R.f.t):'')+'</td></tr>');}
 o.push('<div class="scr"><table class="ln d60"><tr><th>年</th><th>流年</th><th>干神／支神</th><th>大運</th><th>流年本象（'+'講義卷二【流年】）</th></tr>'+rows.join('')+'</table></div>');
 o.push('<p class="note">大運、流年斷語取自講義卷二該「干神坐支神」局之【大運（十年境遇）】【流年（一年應期）】，為本象，須與命局喜忌合參。</p>');
 return o.join('');}
function bindDy(){var bs=document.querySelectorAll('.dy button');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){DYSEL=+this.getAttribute('data-i');var s=LAST.D.steps[DYSEL];if(s.y0!=null)LNR=[s.y0,s.y1];render(true);};
 if($('lyGo'))$('lyGo').onclick=function(){var a=+$('ly0').value,b=+$('ly1').value;if(a>b){var t=a;a=b;b=t;}if(b-a>60)b=a+60;LNR=[Math.max(1900,a),Math.min(2100,b)];render(true);};
 if($('lyNow'))$('lyNow').onclick=function(){LNR=[CUR_YEAR-5,CUR_YEAR+5];render(true);};}
/* ---- 八字驗證 ---- */
function validP(p){var w=[];for(var i=0;i<4;i++){var g=p[i].charAt(0),z=p[i].charAt(1),gi=G.indexOf(g),zi=Z.indexOf(z);if(p[i].length!==2||gi<0||zi<0)return {err:['年','月','日','時'][i]+'柱「'+p[i]+'」不是有效干支'};if(gi%2!==zi%2)return {err:['年','月','日','時'][i]+'柱「'+p[i]+'」陰陽不配（非六十甲子）'};}
 var ys=G.indexOf(p[0].charAt(0)),mz=Z.indexOf(p[1].charAt(1)),mon=(mz-2+12)%12,ems=((ys%5)*2+2+mon)%10;if(G[ems]!==p[1].charAt(0))w.push('月柱與年干不合五虎遁：'+p[0].charAt(0)+'年'+p[1].charAt(1)+'月應為 '+G[ems]+p[1].charAt(1));
 var ds=G.indexOf(p[2].charAt(0)),hb=Z.indexOf(p[3].charAt(1)),ehs=((ds%5)*2+hb)%10;if(G[ehs]!==p[3].charAt(0))w.push('時柱與日干不合五鼠遁：'+p[2].charAt(0)+'日'+p[3].charAt(1)+'時應為 '+G[ehs]+p[3].charAt(1));
 return {warn:w};}
function getP(){return [0,1,2,3].map(function(i){return $('p'+i).value.trim();});}
function pvUpd(){var p=getP();if(p.join('').length<8){$('pv').innerHTML='';return;}var v=validP(p);$('pv').innerHTML=v.err?'<span class="wn">'+esc(v.err)+'</span>':(v.warn.length?'<span class="wn">⚠ '+v.warn.map(esc).join('；')+'</span>':'<span class="okc">✓ 干支有效，五虎遁、五鼠遁相合</span>');}
[0,1,2,3].forEach(function(i){$('p'+i).oninput=pvUpd;});
function searchDates(p,yFrom,yTo){var out=[],hb=Z.indexOf(p[3].charAt(1)),hh=hb===0?0:hb*2-1,yi=gzIdx(p[0]),di=gzIdx(p[2]);
 for(var y=yFrom;y<=yTo;y++){if(((y-4)%60+60)%60!==yi)continue;
  var j0=Math.floor(CAL.jd(y,2,1,12)+0.5),j1=Math.floor(CAL.jd(y+1,2,25,12)+0.5);
  for(var j=j0;j<=j1;j++){if(((j+49)%60+60)%60!==di)continue;var dt=new Date((j-0.5-2440587.5)*86400000);var Y=dt.getUTCFullYear(),M=dt.getUTCMonth()+1,D=dt.getUTCDate();
   if(Y<1900||Y>2100)continue;var r=CAL.fromSolar(Y,M,D,hh,30,8,true);if(r.pillars.join()===p.join())out.push({y:Y,m:M,d:D,h:hh});}}
 return out;}
$('srch').onclick=function(){var p=getP(),v=validP(p);if(v.err){$('sr').innerHTML='<p class="wn">'+esc(v.err)+'</p>';return;}
 var by=+$('by').value,L=by?searchDates(p,by-1,by+1):searchDates(p,1899,2100);
 $('sr').innerHTML=L.length?'<p>找到 '+L.length+' 個相符日期（UTC+8，取該時辰中段；點選即填入生日並排盤）：</p><div class="srl">'+L.map(function(x,i){return '<button type="button" data-i="'+i+'">'+x.y+'/'+x.m+'/'+x.d+' '+('0'+x.h).slice(-2)+':30</button>';}).join('')+'</div><p class="note">實際出生時刻請自行核對；時辰中段僅為代表值。</p>':'<p class="wn">1900–2100 年間（UTC+8）找不到相符日期'+(v.warn.length?'（五虎遁／五鼠遁不合者本不存在）':'')+'。</p>';
 var bs=$('sr').querySelectorAll('button');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var x=L[+this.getAttribute('data-i')];$('bd').value=x.y+'-'+('0'+x.m).slice(-2)+'-'+('0'+x.d).slice(-2);$('bt').value=('0'+x.h).slice(-2)+':30';$('tz').value=8;setMode('d');go();};};
/* ---- 收集狀態 ---- */
function collect(){var st={mode:MODE,sex:$('sex').value};
 if(MODE==='d'){st.date=$('bd').value;st.time=$('bt').value||'12:00';st.tz=parseFloat($('tz').value);if(isNaN(st.tz))st.tz=8;st.lz=$('lz').checked;if(!st.date)return {err:'請輸入出生日期'};var a=st.date.split('-').map(Number),t=st.time.split(':').map(Number);if(a[0]<1900||a[0]>2100)return {err:'出生年請介於 1900–2100'};var r=CAL.fromSolar(a[0],a[1],a[2],t[0],t[1],st.tz,st.lz);st.pillars=r.pillars;st.note=r.note;}
 else{st.pillars=getP();var v=validP(st.pillars);if(v.err)return {err:v.err};st.warn=v.warn;var sa=$('sa').value;st.startAge=sa===''?null:+sa;var by=$('by').value;st.birthYear=by===''?null:+by;}
 return st;}
function fill(st){setMode(st.mode||'d');$('sex').value=st.sex||'男';if(st.mode==='p'){for(var i=0;i<4;i++)$('p'+i).value=st.pillars[i];$('sa').value=st.startAge==null?'':st.startAge;$('by').value=st.birthYear==null?'':st.birthYear;pvUpd();}
 else{$('bd').value=st.date;$('bt').value=st.time;$('tz').value=st.tz==null?8:st.tz;$('lz').checked=st.lz!==false;}}
var LAST=null;
function go(){var st=collect();if(st.err){$('pn').innerHTML='<span class="wn">'+esc(st.err)+'</span>';return;}ST=st;var D=dayun(st);DYSEL=null;
 D.steps.forEach(function(s,i){if(s.y0!=null&&CUR_YEAR>=s.y0&&CUR_YEAR<=s.y1)DYSEL=i;});if(DYSEL==null)DYSEL=0;LNR=[CUR_YEAR-5,CUR_YEAR+5];
 LAST={st:st,D:D};render(false);}
function render(keep){var st=LAST.st,D=LAST.D,p=st.pillars,R=SS.calc(p),y=window.scrollY;
 $('pn').innerHTML='四柱：'+p.join('　')+(st.note?'（'+esc(st.note)+'）':'')+(st.warn&&st.warn.length?'<br><span class="wn">⚠ '+st.warn.map(esc).join('；')+'（仍依所輸入八字論斷）</span>':'');
 var head='<h2>命盤</h2><p class="big2">'+p.join('　')+'</p><p>'+st.sex+'命（'+(st.sex==='男'?'乾造':'坤造')+'）'+(st.mode==='d'?'　生於 '+st.date+' '+st.time+'（UTC+'+st.tz+'）':'　直接輸入八字')+'</p>';
 $('out').innerHTML='<div class="row nav noexp"><a href="#ssTop">十神分析</a><a href="#bkTop">百局論斷</a><a href="#dyTop">大運流年</a><a href="#fq">夫妻宮</a><a href="#ref">講義全文</a></div><div class="card rp">'+head+SS.html(p,st.sex)+'</div><div class="card rp">'+BK.personal(p,st.sex,R)+'</div><div class="card rp">'+dyHtml(st,D)+'</div><div class="card noexp">'+BK.reference()+'</div>';
 $('exp').style.display='flex';bindDy();if(keep)window.scrollTo(0,y);history.replaceState(null,'',shareUrl());}
$('go').onclick=go;
/* ---- 命例儲存 ---- */
var KEY='shishenCases',LS=null;try{LS=window.localStorage;LS.getItem('x');}catch(e){LS=null;}
function list(){try{return JSON.parse(LS.getItem(KEY)||'[]')||[];}catch(e){return [];}}
function put(a){LS.setItem(KEY,JSON.stringify(a));svR();}
function msg(t){$('svM').textContent=t;}
function svR(){if(!LS){$('svL').innerHTML='<p class="note">此瀏覽器無法使用本機儲存。</p>';return;}var a=list();
 $('svL').innerHTML=a.length?a.map(function(c,i){return '<div class="svi"><span><b>'+esc(c.name)+'</b>　'+esc(c.pillars.join(' '))+'　'+esc(c.sex)+(c.notes?'<br><span class="note">'+esc(c.notes)+'</span>':'')+'</span><button type="button" data-a="ld" data-i="'+i+'">載入</button><button type="button" class="sec" data-a="rn" data-i="'+i+'">改名</button><button type="button" class="sec" data-a="del" data-i="'+i+'">刪除</button></div>';}).join(''):'<p class="note">尚無儲存命例。</p>';
 var bs=$('svL').querySelectorAll('button');for(var k=0;k<bs.length;k++)bs[k].onclick=function(){var i=+this.getAttribute('data-i'),act=this.getAttribute('data-a'),a=list(),c=a[i];
  if(act==='ld'){fill(c);$('svN').value=c.name;$('svT').value=c.notes||'';go();msg('已載入「'+c.name+'」');}
  else if(act==='rn'){var n=prompt('新名稱',c.name);if(n&&n.trim()){n=n.trim();if(a.some(function(x,j){return j!==i&&x.name===n;})){msg('名稱已存在');return;}c.name=n;var nt=prompt('備註（可留空）',c.notes||'');if(nt!=null)c.notes=nt;put(a);msg('已改名為「'+n+'」');}}
  else if(act==='del'){if(confirm('刪除「'+c.name+'」？')){a.splice(i,1);put(a);msg('已刪除');}}};}
$('svB').onclick=function(){if(!LS)return;var st=collect();if(st.err){msg(st.err);return;}var n=$('svN').value.trim()||st.pillars.join('');st.name=n;st.notes=$('svT').value;st.saved=new Date().toISOString();delete st.note;
 var a=list(),i=-1;a.forEach(function(x,j){if(x.name===n)i=j;});if(i>=0){if(!confirm('「'+n+'」已存在，要覆蓋嗎？'))return;a[i]=st;}else a.push(st);put(a);msg('已儲存「'+n+'」');};
function dl(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},4000);}
$('svX').onclick=function(){dl(new Blob([JSON.stringify({app:'shishen',ver:1,cases:list()},null,1)],{type:'application/json'}),'十神命例備份.json');};
$('svI').onchange=function(){var f=this.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{var j=JSON.parse(rd.result),arr=Array.isArray(j)?j:j.cases,a=list(),n=0;
 (arr||[]).forEach(function(c){if(c&&c.name&&c.pillars&&c.pillars.length===4&&!validP(c.pillars).err){var i=-1;a.forEach(function(x,k){if(x.name===c.name)i=k;});if(i>=0)a[i]=c;else a.push(c);n++;}});put(a);msg('已匯入 '+n+' 筆');}catch(e){msg('匯入失敗：檔案格式錯誤');}$('svI').value='';};rd.readAsText(f);};
/* ---- 分享連結 ---- */
function shareUrl(){var st=LAST.st,q=new URLSearchParams();q.set('g',st.sex);
 if(st.mode==='d'){q.set('d',st.date);q.set('t',st.time);if(st.tz!==8)q.set('tz',st.tz);if(!st.lz)q.set('lz','0');}else{q.set('p',st.pillars.join(''));if(st.startAge!=null)q.set('sa',st.startAge);if(st.birthYear)q.set('by',st.birthYear);}
 return location.href.split('?')[0].split('#')[0]+'?'+q.toString();}
function fromUrl(){var q=new URLSearchParams(location.search);if(!q.get('d')&&!q.get('p'))return;$('sex').value=q.get('g')==='女'?'女':'男';
 if(q.get('p')){var p=q.get('p');setMode('p');for(var i=0;i<4;i++)$('p'+i).value=p.substr(i*2,2);$('sa').value=q.get('sa')||'';$('by').value=q.get('by')||'';pvUpd();}
 else{setMode('d');$('bd').value=q.get('d');$('bt').value=q.get('t')||'12:00';$('tz').value=q.get('tz')||8;$('lz').checked=q.get('lz')!=='0';}go();}
/* ---- 匯出 ---- */
function blocks(){var out=[];function walk(el){for(var c=el.firstElementChild;c;c=c.nextElementSibling){var t=c.tagName,cl=c.className||'';if(/noexp|sschart|nav/.test(cl))continue;
 if(/^H[1-4]$/.test(t))out.push({k:'h',t:c.textContent});else if(t==='TABLE'){var rows=[],tr=c.querySelectorAll('tr');for(var r=0;r<tr.length;r++){var a=[],cs=tr[r].children;for(var j=0;j<cs.length;j++)a.push(cs[j].innerText.replace(/\n+/g,' '));rows.push(a);}out.push({k:'table',rows:rows});}
 else if(t==='P'||t==='LI')out.push({k:/note|src/.test(cl)?'s':(/big2/.test(cl)?'big':'p'),t:(t==='LI'?'・':'')+c.textContent});
 else if(t==='SUMMARY')out.push({k:'p',t:'〔'+c.textContent+'〕'});
 else walk(c);}}
 var cs=document.querySelectorAll('#out .rp');for(var i=0;i<cs.length;i++)walk(cs[i]);return out;}
function title(){return '八字十神論命　'+LAST.st.sex+'命 '+LAST.st.pillars.join(' ');}
function fname(ext){return '十神論命_'+LAST.st.pillars.join('')+'.'+ext;}
function rasterGlyph(cp){try{var ch=String.fromCodePoint(cp),N=96,font=N+'px "PingFang TC","Noto Serif CJK TC","Noto Sans TC","PMingLiU",serif';var c=document.createElement('canvas'),g=c.getContext('2d');g.font=font;var adv=Math.max(0.25,Math.min(1.6,g.measureText(ch).width/N)),W=Math.ceil(adv*N),Hh=Math.ceil(1.2*N);c.width=W;c.height=Hh;g=c.getContext('2d');g.font=font;g.fillStyle='#000';g.textBaseline='alphabetic';g.fillText(ch,0,N);var px=g.getImageData(0,0,W,Hh).data,rb=Math.ceil(W/8),bits=new Uint8Array(rb*Hh),ink=0;for(var y=0;y<Hh;y++)for(var x=0;x<W;x++)if(px[(y*W+x)*4+3]>110){bits[y*rb+(x>>3)]|=0x80>>(x&7);ink++;}return ink?{w:W,h:Hh,bits:bits,adv:adv}:null;}catch(e){return null;}}
var FONTP=null;
function font(){if(!FONTP)FONTP=fetch('fonts/tb-serif-tc.woff').then(function(r){if(!r.ok)throw new Error('字型載入失敗');return r.arrayBuffer();}).then(function(b){return TBX.loadFont(b);});FONTP['catch'](function(){FONTP=null;});return FONTP;}
function buildPdf(F,B,ttl){var d=new TBX.Doc(F,{raster:rasterGlyph}),ML=46,CW=d.pw-92,BOT=d.ph-50,y=50;d.newPage();
 function para(runs,lf,ind){ind=ind||0;var L=d.lay(runs,CW-ind,lf||1.5);for(var i=0;i<L.lines.length;i++){var ln=L.lines[i];if(y+ln.lh>BOT){d.newPage();y=50;}y=d.draw({lines:[ln],runs:L.runs},ML+ind,y,CW-ind);}}
 para([{t:ttl,s:18,b:1}]);y+=4;
 B.forEach(function(b){if(b.k==='h'){y+=6;para([{t:b.t,s:13,b:1,c:'7a2a18'}]);}else if(b.k==='s')para([{t:b.t,s:8,c:'8a6d3b'}],1.4);else if(b.k==='big')para([{t:b.t,s:16,b:1}]);
  else if(b.k==='table'){var n=b.rows[0].length,cw=CW/n;b.rows.forEach(function(r,ri){var Ls=r.map(function(t){return d.lay([{t:t,s:n>6?8:9.5,b:ri===0?1:0}],cw-6,1.4);}),h=0;Ls.forEach(function(L){h=Math.max(h,L.h);});h+=6;if(y+h>BOT){d.newPage();y=50;}
   Ls.forEach(function(L,j){d.rect(ML+j*cw,y,cw,h,ri===0?'f3ece2':null,'ccc4b8',0.5);d.draw(L,ML+j*cw+3,y+3,cw-6);});y+=h;});y+=4;}
  else para([{t:b.t,s:10.5}]);});
 return d.finish({title:ttl,now:new Date()});}
function crc(a){var c,t=[],x=-1,n,k;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}for(n=0;n<a.length;n++)x=(x>>>8)^t[(x^a[n])&255];return(x^-1)>>>0;}
function u8(s){return new TextEncoder().encode(s);}
function zip(files){var parts=[],cd=[],off=0;function w16(v){return[v&255,v>>8&255];}function w32(v){return[v&255,v>>8&255,v>>16&255,v>>>24&255];}
 files.forEach(function(f){var nm=u8(f.name),d=f.data,c=crc(d),h=[0x50,0x4b,3,4].concat(w16(20),w16(0x0800),w16(0),w16(0),w16(0x21),w32(c),w32(d.length),w32(d.length),w16(nm.length),w16(0));
  parts.push(new Uint8Array(h),nm,d);cd.push(new Uint8Array([0x50,0x4b,1,2].concat(w16(20),w16(20),w16(0x0800),w16(0),w16(0),w16(0x21),w32(c),w32(d.length),w32(d.length),w16(nm.length),w16(0),w16(0),w16(0),w16(0),w32(0),w32(off))),nm);off+=h.length+nm.length+d.length;});
 var l=0;cd.forEach(function(a){l+=a.length;});return parts.concat(cd,[new Uint8Array([0x50,0x4b,5,6].concat(w16(0),w16(0),w16(files.length),w16(files.length),w32(l),w32(off),w16(0)))]);}
function xe(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function wp(t,o){o=o||{};return '<w:p><w:r><w:rPr><w:rFonts w:ascii="PMingLiU" w:hAnsi="PMingLiU" w:eastAsia="PMingLiU"/>'+(o.b?'<w:b/>':'')+(o.c?'<w:color w:val="'+o.c+'"/>':'')+'<w:sz w:val="'+(o.sz||22)+'"/></w:rPr><w:t xml:space="preserve">'+xe(t)+'</w:t></w:r></w:p>';}
function buildDocx(B,ttl){var x=[wp(ttl,{b:1,sz:32})];B.forEach(function(b){if(b.k==='h')x.push(wp(b.t,{b:1,sz:26,c:'7A2A18'}));else if(b.k==='s')x.push(wp(b.t,{sz:16,c:'8A6D3B'}));else if(b.k==='big')x.push(wp(b.t,{b:1,sz:30}));
 else if(b.k==='table'){var t='<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>';b.rows.forEach(function(r,ri){t+='<w:tr>'+r.map(function(c){return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>'+wp(c,{b:ri===0,sz:18})+'</w:tc>';}).join('')+'</w:tr>';});x.push(t+'</w:tbl>',wp(''));}
 else x.push(wp(b.t));});
 var doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+x.join('')+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
 var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
 var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
 return new Blob(zip([{name:'[Content_Types].xml',data:u8(ct)},{name:'_rels/.rels',data:u8(rels)},{name:'word/document.xml',data:u8(doc)}]),{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});}
function em(t){$('emsg').textContent=t;}
function pdfBlob(){return font().then(function(F){return buildPdf(F,blocks(),title());}).then(function(by){return new Blob([by],{type:'application/pdf'});});}
$('dW').onclick=function(){dl(buildDocx(blocks(),title()),fname('docx'));em('Word 已產生');};
$('dP').onclick=function(){em('產生 PDF 中…（首次需載入字型約 1MB）');pdfBlob().then(function(b){dl(b,fname('pdf'));em('PDF 已產生');},function(e){em('PDF 失敗：'+(e&&e.message||e)+'。可改用「列印」→ 儲存為 PDF。');});};
$('dPr').onclick=function(){window.print();};
$('shr').onclick=function(){var url=shareUrl(),f=null;try{f=new File([buildDocx(blocks(),title())],fname('docx'),{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});}catch(e){}
 if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:title(),text:title()+'\n'+url}).catch(function(){});return;}
 if(navigator.share){navigator.share({title:title(),url:url}).catch(function(){});return;}
 var done=function(){em('分享連結已複製：'+url);};if(navigator.clipboard)navigator.clipboard.writeText(url).then(done,function(){em('分享連結：'+url);});else em('分享連結：'+url);};
window.__SX={blocks:blocks,buildDocx:buildDocx,pdfBlob:pdfBlob,dayun:dayun,searchDates:searchDates,validP:validP,shareUrl:shareUrl};
svR();fromUrl();
})();
