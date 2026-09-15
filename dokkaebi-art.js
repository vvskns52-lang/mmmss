'use strict';
const DokkaebiArt=(()=>{
 const palettes=[['#283d54','#71998c','#e6b26c'],['#283654','#739baf','#dd917e'],['#342945','#9a8fc6','#db9473']];
 // A mallet face is 16px below its center. At contact both faces meet the rice surface.
 function pose(side,contact,riceTop){const x=side===0?428:472,restX=side===0?328:572;return {x:restX+(x-restX)*contact,y:108+(riceTop-16-108)*contact,gripX:side===0?310:590,gripY:238,faceY:108+(riceTop-16-108)*contact+16};}
 function draw(canvas,b,r,selected=0){const c=canvas.getContext('2d');if(!c)return;const stage=r?.stage??selected,pal=palettes[stage],round=Math.max(0,Math.floor((b-4)/8)),phase=(Math.max(4,b)-4)%8;
 const last=r?Math.max(-99,...r.calls.filter(n=>n.beat<=b).map(n=>n.beat)):-99,ta=b-last,pa=r?b-r.lastHit:99;
 const recoil=a=>a>=0&&a<.55?Math.pow(1-Math.max(0,a-.09)/.46,2):0,tk=recoil(ta),pk=recoil(pa),impact=Math.max(tk,pk),growth=r?Math.min(1,(r.good+r.perfect)/Math.max(1,r.notes.length*.85)):.45;
 const riceTop=260+impact*9,riceY=riceTop+12*(1-impact*.5),bad=r&&(b-r.lastMiss<.7||b-r.lastFake<.7);
 c.clearRect(0,0,900,430);c.fillStyle=pal[0];c.fillRect(0,0,900,430);for(let i=0;i<45;i++)ell(i*157%900,15+i*73%190,1.5,1.5,'#fff2c580');ell(735,73,42,42,'#f2dca0');ell(751,62,38,38,pal[0]);
 for(let layer=0;layer<2;layer++){c.fillStyle=layer?'#476776':'#354b62';c.beginPath();c.moveTo(0,320);for(let i=0;i<11;i++)c.lineTo(i*100,200+layer*43+Math.sin(i*2+stage)*40);c.lineTo(900,400);c.lineTo(0,400);c.fill();}
 c.fillStyle='#b28363';c.fillRect(0,335,900,95);for(let i=0;i<11;i++)stroke([[i*90,335],[i*100-50,430]],'#8c644e',2);
 // Roof beams and hanging lanterns frame the workshop.
 stroke([[0,12],[900,12]],'#634d4c',22);for(const x of [80,820]){stroke([[x,12],[x,72]],'#c5a478',3);rect(x-20,65,40,57,9,'#e4b578');for(let j=0;j<3;j++)stroke([[x-13+j*13,70],[x-13+j*13,116]],'#bf8e61',2);ell(x,127,5,4,'#f2d99c');}
 goblin(226,251,pal[1],false,tk);goblin(674,251,pal[2],bad,pk);
 ell(450,376,103,15,'#463d3b45');rect(365,282,170,84,12,'#785247');for(let i=0;i<8;i++)stroke([[378+i*20,304],[375+i*20,357]],'#976d53',3);rect(369,332,162,10,2,'#493d43');ell(450,286,87,27,'#b88965');ell(450,282,72,21,'#533e3d');ell(450,279,65,17,'#ede0be');
 const rw=37+growth*31+impact*13,rh=12*(1-impact*.5);ell(450,riceY,rw,rh,'#fff4d8');ell(447,riceTop+5,rw*.76,4,'#fffdfa');if(growth>.78)for(let i=0;i<4;i++)ell(418+i*21,riceY+1,12,rh*.7,['#e6a8b6','#e9d28d','#aed0a5','#a8cadd'][i]);
 // Weapons are drawn after the rice, so contact is visible rather than hidden by the mortar.
 mallet(0,tk);mallet(1,pk);
 if(impact>.04){c.globalAlpha=impact;for(let i=0;i<10;i++){const a=i*Math.PI/5;ell(450+Math.cos(a)*(30+(1-impact)*70),riceTop-7-Math.abs(Math.sin(a))*(8+(1-impact)*52),3.5,3,'#fff4d4');}stroke([[395,riceTop-23],[383,riceTop-39]],'#ffdc86',4);stroke([[505,riceTop-23],[517,riceTop-39]],'#ffdc86',4);c.globalAlpha=1;}
 txt('사부',226,402,17,'#f2e5c9');txt('나',674,402,17,'#f2e5c9');
 const show=!r||r.kind!=='play'||round<r.config.hints;if(show&&r&&b>=4){const p=r.config.patterns[Math.min(r.config.patterns.length-1,round)];for(const at of p)ell(330+at*72,61,8,8,Math.abs(phase%4-at)<.2?'#fff7dc':'#d6ba86');txt('기억할 박자',450,33,12,'#d9e6df');}
 if(r&&r.baits.some(n=>Math.abs(n.beat-b)<.4))txt('에취!',phase<4?226:674,112,30,'#ffe0a4');
 if(r&&r.config.flour.includes(round)){c.globalAlpha=.7;for(let i=0;i<8;i++)ell(280+i*47+Math.sin(b+i)*13,61+(i%3)*17,67,28,'#f3e8d1');c.globalAlpha=1;}
 if(impact>.25)txt('쿵!',450,204-(1-impact)*20,28,'#f8db97');
 function ell(x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=col;c.fill();}
 function rect(x,y,w,h,rad,col){c.beginPath();c.roundRect(x,y,w,h,rad);c.fillStyle=col;c.fill();c.strokeStyle='#283443';c.lineWidth=2;c.stroke();}
 function stroke(points,col,w){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
 function txt(text,x,y,size,col){c.font=`800 ${size}px "Malgun Gothic",sans-serif`;c.textAlign='center';c.fillStyle=col;c.fillText(text,x,y);}
 function goblin(x,y,col,flour,k){const d=x<450?1:-1;c.save();c.translate(x,y+k*5);ell(0,98,65,13,'#29374435');ell(-30,88,28,14,col);ell(30,88,28,14,col);rect(-49,-12,98,90,27,'#ece0be');rect(-38,2,76,70,14,x<450?'#42697c':'#a45954');stroke([[-31,2],[22,63]],'#f1cf92',9);rect(-47,50,94,15,5,'#423a4b');rect(-6,46,16,22,4,'#d1ae68');ell(-56,-49,20,28,col);ell(56,-49,20,28,col);ell(-57,-50,10,15,'#bc888477');ell(57,-50,10,15,'#bc888477');ell(0,-47,60,57,col);ell(-9,-63,43,34,'#ffffff15');
 c.fillStyle='#e7cc97';for(const xx of [-29,29]){c.beginPath();c.moveTo(xx-13,-86);c.quadraticCurveTo(xx-9,-122,xx+4,-131);c.quadraticCurveTo(xx+5,-101,xx+15,-86);c.fill();stroke([[xx-9,-96],[xx+9,-99]],'#ae946d',2);}
 for(let i=0;i<6;i++)ell(-38+i*15,-93+Math.sin(i)*4,16,13,'#303e50');rect(-56,-84,112,13,5,x<450?'#e1c092':'#7ca6a8');ell(0,-78,9,10,'#f5dd97');stroke([[-32,-60],[-14,-65]],'#263849',6);stroke([[14,-65],[32,-60]],'#263849',6);const blink=b%8>7.8;for(const xx of [-24,24]){ell(xx,-44,12,14,'#fff5da');if(blink)stroke([[xx-7,-43],[xx+7,-43]],'#283747',3);else{ell(xx+d*2,-43,5,8,'#263849');ell(xx+d*2+1,-47,2,2,'#fff');}}ell(-40,-23,11,6,'#dc8e8166');ell(40,-23,11,6,'#dc8e8166');ell(0,-25,9,7,'#d3a986');ell(0,-8,22,13,'#563c44');rect(-15,-18,9,12,2,'#fff9db');rect(7,-18,9,12,2,'#fff9db');ell(0,-1,12,5,'#c17b7b');if(flour){ell(0,-32,47,32,'#fff4d7');ell(-20,-37,4,4,'#303848');ell(20,-37,4,4,'#303848');stroke([[-9,-14],[9,-14]],'#303848',3);}c.restore();}
 function mallet(side,k){const p=pose(side,k,riceTop),d=side===0?1:-1,shoulderX=side===0?270:630,skin=side===0?pal[1]:pal[2];stroke([[shoulderX,253],[p.gripX-d*12,267],[p.gripX,238]],'#283443',22);stroke([[shoulderX,253],[p.gripX-d*12,267],[p.gripX,238]],skin,17);stroke([[p.gripX-d*22,p.gripY+15],[p.x,p.y]],'#4b3940',14);stroke([[p.gripX-d*22,p.gripY+15],[p.x,p.y]],'#c69660',10);stroke([[p.gripX-d*22,p.gripY+12],[p.x-2,p.y-2]],'#e4c28a',3);rect(p.x-35,p.y-21,70,37,9,'#8c5e45');rect(p.x-30,p.y-17,60,9,4,'#b2865a');stroke([[p.x-19,p.y-4],[p.x+20,p.y-4]],'#684b3d',2);stroke([[p.x-20,p.y+5],[p.x+22,p.y+5]],'#684b3d',2);rect(p.x-34,p.y+10,68,6,2,'#654739');ell(p.gripX,p.gripY,13,12,skin);stroke([[p.gripX-5,p.gripY-7],[p.gripX-4,p.gripY+3]],'#35514d66',2);}
 }
 return {draw,pose};
})();
