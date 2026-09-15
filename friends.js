'use strict';
const RhythmFriends=(()=>{
 const names=['토끼','고양이','펭귄','개구리','곰','병아리'];
 const coats=['#fff4df','#efb27c','#5f829f','#9cca79','#bd916f','#ffe18b'];
 function draw(c,id,x,y,size=1,bounce=0,mood='happy',drummer=false){
  c.save();c.translate(x,y);c.scale(size,size);c.lineWidth=3;c.strokeStyle='#29364c';c.lineJoin='round';c.lineCap='round';
  const oval=(x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();c.stroke();};
  const line=(x,y,a,b,color='#29364c',w=3)=>{c.beginPath();c.strokeStyle=color;c.lineWidth=w;c.moveTo(x,y);c.lineTo(a,b);c.stroke();c.lineWidth=3;c.strokeStyle='#29364c';};
  c.fillStyle='#101a3025';c.beginPath();c.ellipse(0,48,39,8,0,0,Math.PI*2);c.fill();c.translate(0,-bounce);
  const coat=coats[id%6];
  if(id===0){oval(-17,-49,10,28,coat);oval(17,-49,10,28,coat);line(-17,-65,-17,-42,'#efb2b5',5);line(17,-65,17,-42,'#efb2b5',5);}
  if(id===1){for(const s of [-1,1]){c.beginPath();c.moveTo(s*32,-22);c.lineTo(s*31,-58);c.lineTo(s*9,-33);c.fillStyle=coat;c.fill();c.stroke();}}
  if(id===3){oval(-21,-35,15,16,coat);oval(21,-35,15,16,coat);}
  if(id===4){oval(-28,-34,14,14,coat);oval(28,-34,14,14,coat);}
  oval(0,21,29,28,coat);oval(-18,45,15,7,coat);oval(18,45,15,7,coat);
  oval(0,-12,37,32,coat);
  if(id===2){oval(-13,-15,15,21,'#fff4df');oval(13,-15,15,21,'#fff4df');}
  if(id===5){line(-3,-42,-10,-53,coat,5);line(0,-42,6,-52,coat,5);}
  for(const s of [-1,1]){if(mood==='sad')line(s*13-4,-15,s*13+4,-11);else if(bounce>5){line(s*13-4,-11,s*13,-15);line(s*13,-15,s*13+4,-11);}else oval(s*13,-14,2.7,4,'#29364c');}
  c.fillStyle='#eea1a5';for(const s of [-1,1]){c.beginPath();c.ellipse(s*25,-3,6,3,0,0,Math.PI*2);c.fill();}
  if(id===2||id===5)oval(0,0,7,4,'#eda74c');
  else{c.beginPath();if(mood==='sad')c.arc(0,12,6,Math.PI,Math.PI*2);else c.arc(0,0,7,0,Math.PI);c.stroke();}
  line(-20,18,20,18,['#75b9a4','#e17e7b','#e4bd65'][id%3],8);
  if(drummer){
   oval(0,42,30,17,'#cb766d');oval(0,33,30,14,'#fff1cf');
   for(const s of [-1,1]){line(s*26,15,s*40,bounce>5?31:0,coat,11);line(s*40,bounce>5?31:0,s*18,bounce>5?35:-22,'#edc78b',5);}
  }else{line(-26,17,-39,10-bounce*.6,coat,10);line(26,17,39,10-bounce*.6,coat,10);}
  c.restore();
 }
 return {draw,names};
})();
