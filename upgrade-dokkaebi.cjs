const fs=require('node:fs');let s=fs.readFileSync('dokkaebi.js','utf8');
function change(a,b){if(!s.includes(a))throw Error('Missing anchor '+a.slice(0,80));s=s.replace(a,b);}
change('const DokkaebiChart={',`const DokkaebiChart={
 stages:[
 {name:'달빛 입문',level:'쉬움',bpm:84,rounds:6,hints:6,flour:[],baitRounds:[],duet:5,desc:'정박과 짧은 따라 치기 · 힌트가 끝까지 보여요',patterns:[[0,2],[0,1,3],[0,2,3],[0,1,2],[0,1.5,3],[0,1,2,3]]},
 {name:'장난꾸러기 떡방',level:'보통',bpm:100,rounds:8,hints:2,flour:[4,5],baitRounds:[2,5],duet:6,desc:'반 박 엇박 · 에취 가짜 신호 · 밀가루 구름',patterns:[[0,1,2],[0,1.5,3],[0,.5,2,3],[.5,1.5,2.5],[0,1,2.5,3],[0,.5,1.5,3],[0,1.5,2,3],[0,.5,1.5,2.5,3,3.5]]},
 {name:'도깨비 달밤 축제',level:'어려움',bpm:116,rounds:10,hints:1,flour:[3,4,7,8],baitRounds:[2,5,7],duet:8,desc:'4분의 1박 변화 · 긴 리듬 기억 · 마지막 합주',patterns:[[0,.5,1.5,2.5,3],[0,.75,1.5,2.75,3.5],[0,.5,2,3],[.5,1.25,2,2.75,3.5],[0,.75,1.5,2.5,3.25],[0,.5,1.5,3],[0,.5,1.25,2,2.75,3.5],[0,.5,2,3],[0,.75,1.5,2.25,3],[0,.5,1,1.75,2.5,3,3.5]]}
 ],`);
const from=s.indexOf(' build(rounds=8)'),to=s.indexOf('\n accuracy(',from);
s=s.slice(0,from)+` build(rounds=null,stage=1){const config=this.stages[stage];rounds=rounds??config.rounds;const calls=[],notes=[],baits=[];for(let r=0;r<rounds;r++){const start=4+r*8;for(const p of config.patterns[r]){calls.push({beat:start+p,round:r});notes.push({beat:start+4+p,round:r,done:false});if(r>=config.duet)calls.push({beat:start+4+p,round:r});}if(config.baitRounds.includes(r)){const fake=r===5?2.25:1.25;baits.push({beat:start+fake,round:r,call:true,done:false});baits.push({beat:start+4+fake,round:r,call:false,done:false});}}return{calls,notes,baits,total:4+rounds*8,config,rounds,stage};},`+s.slice(to);
change('<div class="dk-preview">','<div id="dkStages" class="dk-stages" role="group" aria-label="떡방아 난이도 선택"></div><div class="dk-preview">');
change('<h2>쿵, 쿵… 이제 네 차례!</h2>','<h2 id="dkStageTitle">쿵, 쿵… 이제 네 차례!</h2><p id="dkStageInfo"></p>');
change('active=false,record=null','active=false,record=null,selectedStage=0,stageRecords={}');
change("function silence(){",`try{stageRecords=JSON.parse(localStorage.getItem('rp-dokkaebi-stages')||'{}')||{};}catch{}
 function selectStage(i){selectedStage=i;menu();}
 function silence(){`);
const m=s.indexOf(' function menu(){'),me=s.indexOf('\n function thump',m);
s=s.slice(0,m)+` function menu(){stopGame();$('dkMenu').hidden=false;$('dkPlay').hidden=true;const config=DokkaebiChart.stages[selectedStage];record=stageRecords[selectedStage]||null;$('dkStages').innerHTML=DokkaebiChart.stages.map((v,i)=>\`<button id="dkStage\${i}" class="dk-stage \${i===selectedStage?'selected':''}" aria-pressed="\${i===selectedStage}"><small>0\${i+1} · \${v.level}</small><strong>\${v.name}</strong><span>\${v.bpm} BPM · \${v.rounds}번의 수업</span></button>\`).join('');DokkaebiChart.stages.forEach((_,i)=>$('dkStage'+i).onclick=()=>selectStage(i));$('dkStageTitle').textContent=config.name;$('dkStageInfo').textContent=config.desc;$('dkBest').textContent=record?\`이 스테이지 최고 \${record.score.toLocaleString()}점 · \${record.accuracy}%\`:\`\${config.level} · \${config.rounds}번의 수업 · 약 \${Math.round((4+config.rounds*8)*60/config.bpm)}초\`;draw($('dkPreview'),0,null);}
`+s.slice(me);
change("const rounds=kind==='demo'?3:8;","const config=DokkaebiChart.stages[selectedStage],rounds=kind==='demo'?3:config.rounds;");
change("...DokkaebiChart.build(rounds),kind,spb:60/(kind==='practice'?80:100)","...DokkaebiChart.build(rounds,selectedStage),kind,spb:60/(config.bpm*(kind==='practice'?.8:1))");
change("${Math.min(8,round+1)} / ${r.kind==='demo'?3:8} 수업","${r.config.level} · ${Math.min(r.rounds,round+1)} / ${r.rounds} 수업");
s=s.replaceAll('round>=6','round>=r.config.duet').replaceAll('round===4||round===5','r.config.flour.includes(round)').replaceAll("r.kind!=='play'||round<2","r.kind!=='play'||round<r.config.hints");
change("record={score:r.score,accuracy};try{localStorage.setItem('rp-dokkaebi-best',JSON.stringify(record));}catch{}","record={score:r.score,accuracy};stageRecords[r.stage]=record;try{localStorage.setItem('rp-dokkaebi-stages',JSON.stringify(stageRecords));}catch{}");
change("${rank} · ${accuracy>=80?","${r.config.name} · ${rank} · ${accuracy>=80?");
const d=s.indexOf(' function draw(canvas,b,r)'),de=s.indexOf('\n tab.onclick',d);
s=s.slice(0,d)+` function draw(canvas,b,r){DokkaebiArt.draw(canvas,b,r,selectedStage);}
`+s.slice(de);
fs.writeFileSync('dokkaebi.js',s);
let h=fs.readFileSync('index.html','utf8');h=h.replace('<script src="dokkaebi.js" defer>','<script src="dokkaebi-art.js" defer></script><script src="dokkaebi.js" defer>');fs.writeFileSync('index.html',h);
