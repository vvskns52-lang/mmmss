'use strict';
const ArcadeVisuals=(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const colors=['#ffd076','#80e5dc','#f59aba','#b4a6ff','#87dcf5','#ffd076'];
 function gradient(c,x,y,w,h,a,b){const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(x,y,w,h);}
 function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 function line(c,x,y,xx,yy,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
 function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 function spark(c,x,y,age,color){if(age<0||age>.85)return;c.save();c.globalAlpha=1-age/.85;c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.arc(x,y,12+age*65,0,Math.PI*2);c.stroke();if(!reduced)for(let i=0;i<10;i++){const a=i*2.399,d=18+age*(35+i*6);c.save();c.translate(x+Math.cos(a)*d,y+Math.sin(a)*d+age*age*22);c.rotate(a+age*3);c.fillStyle=i%2?color:'#fff7db';c.fillRect(-3,-3,6,6);c.restore();}c.restore();}
 function scenery(c,w,h,beat,theme=0){
  const t=reduced?0:beat;c.save();
  for(let i=0;i<22;i++){const x=(i*137.4+t*(theme===2?7:1.3))%w,y=24+(i*79.3)%(h*.55);ellipse(c,x,y,1.5,1.5,theme===2?'#fff6d799':'#fff9df55');}
  const shade=c.createLinearGradient(0,0,w,h);shade.addColorStop(0,'#fff6b01c');shade.addColorStop(.5,'#ffffff00');shade.addColorStop(1,'#08132d33');c.fillStyle=shade;c.fillRect(0,0,w,h);
  c.restore();
 }
 function draw(c,mode,r,beat){
  const t=reduced?0:beat;c.save();c.textAlign='center';c.font='bold 18px sans-serif';
  gradient(c,0,0,900,540,mode==='six'?'#20294b':'#253254','#10182f');
  scenery(c,900,540,t,2);
  const reaction=lane=>{const v=r.reactions?.[lane],age=v?beat-v.beat:99;return {age,mood:age<1?v.mood:'happy',bounce:!reduced&&age>=0&&age<.8&&v.mood==='happy'?Math.sin(age/.8*Math.PI)*12:0};};
  if(mode==='six'){
   glow(c,70,180,170,'#7266bd55');glow(c,835,330,175,'#348c9e44');
   // Two parallax skyline layers sit outside the playable lanes.
   for(let i=0;i<24;i++){const x=i*41,h=30+(i*31)%125;c.fillStyle='#34405c';c.fillRect(x,360-h,30,h);for(let j=0;j<3;j++)c.fillStyle='#ffd97d44',c.fillRect(x+7,370-h+j*21,4,7);}
   gradient(c,82,30,736,446,'#0b112bea','#192440');
   for(let i=0;i<6;i++){
    const x=90+i*120,p=reaction(i);gradient(c,x,30,118,440,i%2?'#282c4e':'#192944','#101b32');
    line(c,x,30,x,466,'#a1c5f326');
    if(p.age>=0&&p.age<.65&&p.mood==='happy'){const g=c.createLinearGradient(0,200,0,460);g.addColorStop(0,'#ffffff00');g.addColorStop(1,colors[i]+'65');c.globalAlpha=1-p.age/.65;c.fillStyle=g;c.fillRect(x,200,118,266);c.globalAlpha=1;}
   }
   c.save();c.beginPath();c.rect(90,35,718,435);c.clip();
   for(let i=0;i<5;i++){const y=460-((t%1+i)*125);line(c,90,y,808,y,'#9ebcdd15');}
   for(const n of r.notes){const y=460-(n.beat-beat)*125;if(n.done||y<20||y>480)continue;const x=99+n.lane*120;
    gradient(c,x,y-11,100,22,'#fff8e6',colors[n.lane]);c.fillStyle=colors[n.lane]+'33';c.fillRect(x+8,y-22,84,11);c.strokeStyle=colors[n.lane];c.lineWidth=2;c.strokeRect(x,y-11,100,22);line(c,x+9,y-5,x+91,y-5,'#ffffffb0',2);
   }c.restore();
   c.shadowColor='#8be8ff';c.shadowBlur=12;line(c,90,460,808,460,'#ecfaff',4);c.shadowBlur=0;
   for(let i=0;i<6;i++){const p=reaction(i);if(p.mood==='happy')spark(c,150+i*120,455,p.age,colors[i]);
    ellipse(c,150+i*120,515,42,7,colors[i]+'28');RhythmFriends.draw(c,i,150+i*120,501,.43,p.bounce,p.mood);c.fillStyle=colors[i];c.font='bold 17px sans-serif';c.fillText(['S','D','F','J','K','L'][i],150+i*120,537);
   }
   for(let i=0;i<13;i++){const h=4+Math.abs(Math.sin(t*2+i*.7))*22;c.fillStyle=colors[i%6]+'85';c.fillRect(28,440-i*24,h,7);c.fillRect(872-h,440-i*24,h,7);}
  }else{
   glow(c,720,75,100,'#ffdb9640');ellipse(c,720,73,33,33,'#ffefc9');ellipse(c,733,64,29,29,'#283451');
   for(let layer=0;layer<2;layer++){c.fillStyle=layer?'#3d5264':'#304359';c.beginPath();c.moveTo(0,190);for(let x=0;x<=950;x+=95)c.lineTo(x,120+layer*28+Math.sin(x*.009+layer)*27);c.lineTo(900,200);c.closePath();c.fill();}
   line(c,0,14,900,14,'#b88c75',2);
   for(let i=0;i<10;i++){const x=30+i*94+Math.sin(t*.6+i)*3,y=45+(i%2)*12;line(c,x,14,x,y-16,'#cfa890');ellipse(c,x,y,14,20,['#ffcc80','#f4a2a2','#8fd2c7'][i%3]);line(c,x-8,y-18,x+8,y-18,'#70454f',3);line(c,x-8,y+18,x+8,y+18,'#70454f',3);}
   gradient(c,225,164,450,28,'#c6967e','#715068');
   const a=reaction(0),b=reaction(1);RhythmFriends.draw(c,r.level,330,127,.86,a.bounce,a.mood,true);RhythmFriends.draw(c,(r.level+1)%6,565,127,.86,b.bounce,b.mood,true);
   gradient(c,0,202,900,136,'#152439','#26374f');line(c,0,202,900,202,'#dca876',3);line(c,0,338,900,338,'#dca876',3);
   glow(c,140,270,76,'#fbd78922');c.strokeStyle='#fff0bd';c.lineWidth=5;c.beginPath();c.arc(140,270,47,0,Math.PI*2);c.stroke();c.strokeStyle='#fff0bd44';c.lineWidth=2;c.beginPath();c.arc(140,270,57,0,Math.PI*2);c.stroke();
   for(const n of r.notes){const x=140+(n.beat-beat)*160;if(n.done||x< -40||x>950)continue;const col=n.lane?'#77dbed':'#ff9391';ellipse(c,x+3,276,29,29,'#090f2655');ellipse(c,x,270,28,28,col);c.strokeStyle='#fffae4';c.lineWidth=3;c.beginPath();c.arc(x,270,23,0,Math.PI*2);c.stroke();ellipse(c,x-8,264,2.5,4,'#283049');ellipse(c,x+8,264,2.5,4,'#283049');c.strokeStyle='#283049';c.lineWidth=2;c.beginPath();c.arc(x,270,8,0,Math.PI);c.stroke();c.font='bold 12px sans-serif';c.fillStyle='#283049';c.fillText(n.lane?'딱':'둥',x,292);}
   for(let i=0;i<2;i++){const p=reaction(i);if(p.mood==='happy')spark(c,140,270,p.age,i?'#77dbed':'#ff9391');}
   c.fillStyle='#f8ddaa';c.font='bold 15px sans-serif';c.fillText('판정 위치',140,377);
   // A little audience cheers beneath the lane, never in the note path.
   for(let i=0;i<7;i++)RhythmFriends.draw(c,i%6,215+i*88,415,.45,reduced?0:Math.max(0,Math.sin(t*Math.PI*2+i))*(r.combo>=10?10:3));
   c.font='bold 18px sans-serif';c.fillStyle='#ffaba4';c.fillText('● 가운데 D / K',320,499);c.fillStyle='#8adff1';c.fillText('● 테두리 S / L',615,499);
  }
  if(r.combo>=10){c.strokeStyle='#ffdf86';c.lineWidth=3;c.strokeRect(3,3,894,534);c.fillStyle='#ffe49e';c.font='bold 15px sans-serif';c.fillText('★ '+r.combo+' COMBO ★',450,mode==='six'?80:530);}
  c.restore();
 }
 return {draw,scenery,spark};
})();
