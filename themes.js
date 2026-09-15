'use strict';
const GameThemes=(()=>{
 const six=[
  ['별빛 기차','토끼 차장과 떠나는 첫 리듬 여행','train','#293957','#12223b','#ffdc93',0],
  ['꽃잎 정원','고양이와 꽃잎 사이를 폴짝폴짝','garden','#3d625a','#193b39','#f4b7d5',1],
  ['사탕 도시','펭귄의 달콤한 사탕 공장','candy','#65466e','#322346','#f8b6d2',2],
  ['산호 바다','개구리 잠수부와 바닷속 연주','ocean','#225c78','#102f4c','#82e6dc',3],
  ['오로라 설원','곰과 함께 밝히는 겨울 하늘','snow','#35456d','#192641','#b4eedc',4],
  ['꿈꾸는 은하','병아리 우주선의 마지막 비행','space','#523768','#201d42','#d6b5ff',5]
 ];
 const drum=[
  ['봄꽃 소풍','토끼와 고양이의 벚꽃 북놀이','garden','#795665','#392b45','#ffbdd4',0],
  ['파도 해변','고양이와 펭귄의 여름 해변 공연','ocean','#2f6f89','#173c58','#8fe3ed',1],
  ['도토리 잔치','펭귄과 개구리의 가을 수확제','harvest','#855b42','#3e2c32','#ffcb86',2],
  ['눈꽃 마을','개구리와 곰의 눈 내리는 축제','snow','#456b83','#20394e','#bcecf4',3],
  ['반딧불 연못','곰과 병아리의 달빛 합주','pond','#345653','#182f3b','#d8eb94',4],
  ['별빛 대축제','병아리와 토끼의 은하 피날레','space','#573c73','#261d42','#e5b8ef',5]
 ];
 function get(mode,id){const a=(mode==='six'?six:drum)[id];return {name:a[0],story:a[1],kind:a[2],top:a[3],bottom:a[4],accent:a[5],friend:a[6]};}
 function backdrop(c,theme,beat=0,w=900,h=540){
  c.save();c.scale(w/900,h/540);const t=matchMedia('(prefers-reduced-motion: reduce)').matches?0:beat;
  const g=c.createLinearGradient(0,0,0,540);g.addColorStop(0,theme.top);g.addColorStop(1,theme.bottom);c.fillStyle=g;c.fillRect(0,0,900,540);
  const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  const stroke=(x,y,xx,yy,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
  for(let i=0;i<18;i++){
   const x=(i*137.9+Math.sin(t*.3+i)*10)%900,y=30+(i*73)%440;
   if(['garden','harvest'].includes(theme.kind)){
    c.save();c.translate(x,y);c.rotate(i+t*.07);c.fillStyle=theme.accent;
    if(theme.kind==='garden'){for(let j=0;j<5;j++){c.beginPath();c.ellipse(Math.cos(j*1.256)*10,Math.sin(j*1.256)*10,8,5,j*1.256,0,Math.PI*2);c.fill();}circle(0,0,4,'#ffedab');}
    else{c.beginPath();c.ellipse(0,0,7,16,.5,0,Math.PI*2);c.fill();stroke(-4,9,4,-9,'#91613f',1);}c.restore();
   }else if(theme.kind==='ocean'){
    c.strokeStyle='#b6f7ee66';c.lineWidth=2;c.beginPath();c.arc(x,(y-t*8+1080)%540,4+i%9,0,Math.PI*2);c.stroke();
   }else if(theme.kind==='candy'){
    stroke(x,y,x,y+35,'#eedbc9',4);circle(x,y,15,['#f6b4ca','#aee9df','#ffde9c'][i%3]);circle(x-4,y-5,5,'#ffffff66');
   }else{circle(x,y,theme.kind==='snow'?2+i%3:1+i%2,theme.accent+'99');}
  }
  if(theme.kind==='train'){
   circle(735,95,43,'#ffe5b4');for(let i=0;i<9;i++){const x=i*130-(t*12%130);c.fillStyle='#1a2947';c.fillRect(x,300-(i%3)*25,100,110);for(let j=0;j<3;j++)c.fillStyle='#f7d79b66',c.fillRect(x+12+j*25,320-(i%3)*25,10,16);}stroke(0,435,900,435,theme.accent,4);for(let x=0;x<900;x+=38)stroke(x,438,x+13,450,theme.accent+'77',3);
  }
  if(['ocean','pond'].includes(theme.kind)){
   for(let i=0;i<16;i++){const x=i*63;c.strokeStyle=theme.kind==='ocean'?'#67b9a6':'#80a878';c.lineWidth=6;c.beginPath();c.moveTo(x,540);c.quadraticCurveTo(x-25,490,x+Math.sin(t+i)*12,450-i%4*15);c.stroke();}
   if(theme.kind==='pond')for(let i=0;i<8;i++){circle(i*123,380+i%3*20,16,'#8aa675');circle(i*113+30,170+i%4*22,3,'#fff4a0');}
   else for(let i=0;i<5;i++){const x=(i*210+t*8)%970-35,y=130+i%3*95;c.fillStyle=theme.accent+'66';c.beginPath();c.ellipse(x,y,20,9,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(x+15,y);c.lineTo(x+31,y-11);c.lineTo(x+31,y+11);c.fill();}
  }
  if(theme.kind==='snow'){
   for(let i=0;i<4;i++){c.fillStyle=['#9bdad629','#bba8ef26'][i%2];c.beginPath();c.moveTo(i*250-150,0);c.bezierCurveTo(i*250+200,65+Math.sin(t)*10,i*250-80,150,i*250+220,215);c.lineTo(i*250+300,0);c.fill();}
   for(let i=0;i<7;i++){c.fillStyle=i%2?'#c8e4e9':'#9dc5d1';c.beginPath();c.moveTo(i*155-70,540);c.lineTo(i*155+30,405-(i%3)*20);c.lineTo(i*155+145,540);c.fill();}
  }
  if(theme.kind==='space'){
   circle(730,110,48,'#a78dca');c.strokeStyle='#edd0e7';c.lineWidth=8;c.beginPath();c.ellipse(730,110,76,17,-.35,0,Math.PI*2);c.stroke();circle(105,380,27,'#83bdc9');
  }
  if(['garden','harvest'].includes(theme.kind))for(let i=0;i<8;i++){c.fillStyle=theme.kind==='garden'?'#517e67':'#765444';c.beginPath();c.arc(i*150,560,110,Math.PI,0);c.fill();}
  c.restore();
 }
 return {get,backdrop};
})();
