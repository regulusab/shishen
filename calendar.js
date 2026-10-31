/* 曆法：公曆→四柱（取自本站干支健康檢查 health-core.js） */
(function(root){var GAN='甲乙丙丁戊己庚辛壬癸'.split(''),ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
function jd(y,m,d,h){if(m<=2){y--;m+=12;}var A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;}
function sunLon(J){var T=(J-2451545)/36525,L0=280.46646+36000.76983*T+0.0003032*T*T,M=(357.52911+35999.05029*T-0.0001537*T*T)*Math.PI/180;
 var C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
 var om=(125.04-1934.136*T)*Math.PI/180,l=L0+C-0.00569-0.00478*Math.sin(om);l%=360;if(l<0)l+=360;return l;}
/* y,m,d,hh,mm 為當地鐘錶時間；tz 為時區(小時)；lateZi: true=23時後日柱換次日 */
function fromSolar(y,m,d,hh,mm,tz,lateZi){if(tz==null)tz=8;
 var J=jd(y,m,d,(hh+mm/60-tz)),L=sunLon(J+69/86400);
 // 年：以立春(315°)為界
 var yy=y;var mon=Math.floor((((L-315)%360)+360)%360/30); // 0=寅月
 if(m<=2||(m===3&&d<10)){ if(L<315&&L>=270)yy=y-1; else if(m<=1&&L>=240)yy=y-1;}
 var yi=((yy-4)%60+60)%60,ys=yi%10,yb=yi%12;
 var ms=((ys%5)*2+2+mon)%10,mb=(mon+2)%12;
 var dj=Math.floor(jd(y,m,d,12)+0.5);var useNext=lateZi&&hh>=23;var di=((dj+49+(useNext?1:0))%60+60)%60,ds=di%10,db=di%12;
 var hb=Math.floor((hh+1)/2)%12,hs=((ds%5)*2+hb)%10;
 return {pillars:[GAN[ys]+ZHI[yb],GAN[ms]+ZHI[mb],GAN[ds]+ZHI[db],GAN[hs]+ZHI[hb]],sunLon:L,note:(hh===0?'早子時（00–01時），日柱用當日':(hh>=23?(lateZi?'夜子時（23–24時），日柱換次日':'夜子時（23–24時），日柱仍用當日'):''))};}
root.CAL={fromSolar:fromSolar,jd:jd,sunLon:sunLon,GAN:GAN,ZHI:ZHI};})(this);
