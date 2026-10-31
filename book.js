/* book.js — 使用者提供講義《八字十神教學命理祕笈・全帙》與《六十甲子日生人夫妻宮（神煞加註版）》之呈現 */
(function(root){
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var PF={年:'年柱',月:'月柱',時:'時柱'};
function vcls(v){return /大凶/.test(v)?'v-dx':/凶/.test(v)&&!/吉/.test(v)?'v-x':/大吉|最吉|大富/.test(v)?'v-dj':/吉/.test(v)&&!/凶/.test(v)?'v-j':'v-m';}
function badge(v){return '<span class="vb '+vcls(v)+'">'+e(v)+'</span>';}
function fld(f){return '<p>'+(f[0]?'<b>【'+e(f[0])+'】</b>':'')+e(f[1])+'</p>';}
function juCard(k,pos,gender){var J=BOOK.ju[k];if(!J)return '<p>（講義無「'+k+'」之局）</p>';
 var main=[],more=[];J.f.forEach(function(f){var L=f[0];
  if(/^(年柱|月柱|時柱)/.test(L)){if(pos&&L.indexOf(PF[pos])===0)main.push(f);else more.push(f);}
  else if(/^(大運|流年)/.test(L))more.push(f);
  else if(/女命/.test(L)&&!/男/.test(L)){if(gender==='女')main.push(f);else more.push(f);}
  else if(/男命/.test(L)&&!/女/.test(L)){if(gender==='男')main.push(f);else more.push(f);}
  else main.push(f);});
 return '<div class="ju"><div class="jh"><b>'+e(k)+'</b> '+badge(J.v)+'</div>'+main.map(fld).join('')+(more.length?'<details><summary>其他宮位・大運・流年斷語</summary>'+more.map(fld).join('')+'</details>':'')+'</div>';}
function node(n){var h=n.l<=1?'h3':'h4';var s='<'+h+'>'+e(n.t)+'</'+h+'>'+n.p.map(function(p){return '<p>'+e(p)+'</p>';}).join('');
 (n.tb||[]).forEach(function(t){s+=tbl(t);});return s;}
function tbl(rows){return '<div class="scr"><table class="ln bt">'+rows.map(function(r,i){return '<tr>'+r.map(function(c,j){return (i===0||j===0)?'<th>'+e(c)+'</th>':'<td class="'+vcls(c)+'">'+e(c)+'</td>';}).join('')+'</tr>';}).join('')+'</table></div>';}
function section(range){var o=[],on=false;BOOK.nodes.forEach(function(n){if(n.l===1){on=range(n.t);} if(on)o.push(n.l===4?juCard(n.t.replace(/^\d+\.\s*/,'').replace(/（.*$/,'').replace('偏官','七殺'),null,null):node(n));});return o.join('');}
function day60Row(gz){for(var i=0;i<BOOK.day60.length;i++)if(BOOK.day60[i][0]===gz)return BOOK.day60[i];return null;}
function catsOf(gz){return BOOK.cats.filter(function(c){return c[1].split(' ').indexOf(gz)>=0;});}
function personal(p,gender,R){var o=[],dm=p[2].charAt(0),pos=['年','月','日','時'];
 o.push('<h2 id="bkTop">講義論斷：四柱干支十神（百局）</h2><p class="note">依講義：天干所透十神為「體」，地支本氣十神為「根」，以「干神坐支神」查百局本象；所列為本象，仍須依講義卷一第四節「三重校正」（日主強弱、喜忌、全局配合）。</p>');
 [0,1,3].forEach(function(i){var c=R.cells[i],k=c.ganSS+'坐'+c.hid[0].ss;o.push('<h3>'+pos[i]+'柱 '+p[i]+'：'+k+'</h3>'+juCard(k,pos[i],gender));});
 var dz=R.cells[2].hid[0].ss;o.push('<h3>日柱 '+p[2]+'：日主坐'+dz+'</h3><p>日支為妻宮（夫妻宮），詳下方「日柱夫妻宮與神煞」。</p>');
 var D=BOOK.dm[dm];if(D)o.push('<h2>講義論斷：日主分論</h2><h3>'+e(D.t)+'</h3>'+D.p.map(function(x){return '<p>'+e(x)+'</p>';}).join(''));
 var dies=[0,1,3].filter(function(i){return R.cells[i].ganSS===R.cells[i].hid[0].ss&&BOOK.die[R.cells[i].ganSS];});
 if(dies.length){o.push('<h2>講義論斷：疊局</h2>');dies.forEach(function(i){var d=BOOK.die[R.cells[i].ganSS];o.push('<h3>'+pos[i]+'柱 '+p[i]+'：'+e(d.t)+'</h3>'+d.p.map(function(x){return '<p>'+e(x)+'</p>';}).join(''));});}
 var r=day60Row(p[2]),cs=catsOf(p[2]);
 o.push('<h2 id="fq">日柱夫妻宮與神煞：'+p[2]+'日</h2>');
 if(r)o.push('<div class="scr"><table class="ln"><tr><th>日柱</th><th>日支十神</th><th>十二運</th><th>夫妻宮性質</th><th>特殊加註神煞</th></tr><tr><td class="big2">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+(r[4].length?'<b class="hl">'+r[4].join('、')+'</b>':'—')+'</td></tr></table></div><p><b>婚姻論斷：</b>'+e(r[5])+'</p>');
 o.push(cs.length?'<ul>'+cs.map(function(c){return '<li><b class="hl">'+c[0]+'</b>：'+e(c[2])+'</li>';}).join('')+'</ul>':'<p>本日柱不屬自坐沐浴、紅艷煞、孤鸞、八專、九醜等特殊日。</p>');
 return o.join('');}
function reference(){var o=['<h2 id="ref">參考資料（講義全文）</h2>'];
 function det(t,b){o.push('<details class="ref"><summary>'+t+'</summary><div>'+b+'</div></details>');}
 var t='<p class="note">八專日依古法更正為：甲寅、乙卯、丁未、戊戌、己未、庚申、辛酉、癸丑（原講義列戊辰、己丑、戊戌、甲寅、己未、丁巳、庚申、癸亥，五柱不同，已更正）。</p><ul>'+BOOK.cats.map(function(c){return '<li><b>'+c[0]+'</b>（'+c[1].split(' ').join('、')+'）：'+e(c[2])+'</li>';}).join('')+'</ul>';
 t+='<div class="scr"><table class="ln d60"><tr><th>日柱</th><th>日支十神</th><th>十二運</th><th>夫妻宮性質</th><th>神煞</th><th>婚姻論斷</th></tr>'+BOOK.day60.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+(r[4].length?'<b class="hl">'+r[4].join('、')+'</b>':'—')+'</td><td class="wr">'+e(r[5])+'</td></tr>';}).join('')+'</table></div>';
 det('六十甲子日生人夫妻宮（神煞加註版）全表',t);
 var tb=null;BOOK.nodes.forEach(function(n){if(n.tb)tb=n;});if(tb)det('附錄　十神坐支百局吉凶總表',node(tb));
 det('敘例・卷一　總綱理法八節',section(function(t){return /^敘|^卷一/.test(t);}));
 det('卷二　十神坐支百局詳斷（全百局）',section(function(t){return /^卷二|^第.章/.test(t);}));
 det('卷三　十日主分論',section(function(t){return /^卷三/.test(t);}));
 det('卷四　疊見九局細論',section(function(t){return /^卷四/.test(t);}));
 det('總跋',section(function(t){return /總\s*跋/.test(t);}));
 o.push('<p class="src">資料來源：使用者提供講義《八字十神教學命理祕笈・全帙》（參酌《淵海子平》《三命通會》《神峰通考》《滴天髓》）、《六十甲子日生人夫妻宮（神煞加註版）簡表》；內容照錄，八專日依古法更正。</p>');
 return o.join('');}
root.BK={personal:personal,reference:reference};
})(this);
