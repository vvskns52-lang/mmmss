'use strict';
(() => {
 const levels = [
  {name:'입문',bpm:90,step:2,desc:'천천히 기본 박자 익히기'},
  {name:'쉬움',bpm:100,step:1,desc:'일정한 박자와 손 바꾸기'},
  {name:'보통',bpm:112,step:1,desc:'엇박이 섞인 리듬'},
  {name:'어려움',bpm:124,step:.5,desc:'빠른 연결과 패턴 변화'},
  {name:'전문가',bpm:138,step:.5,desc:'촘촘한 연타와 복합 패턴'},
  {name:'마스터',bpm:152,step:.5,desc:'16분음표까지 도전'}
 ];
 const keys=['KeyS','KeyD','KeyF','KeyJ','KeyK','KeyL'];
 let mode='pocket',state=null,frameId=0,generation=0,records={};
 try { records=JSON.parse(localStorage.getItem('rp-extra-best')||'{}')||{}; } catch {}
 const nav=document.createElement('nav');nav.className='game-tabs';nav.setAttribute('aria-label','게임 종류');
 nav.innerHTML='<button data-game="pocket" aria-pressed="true">♪ 리듬 포켓</button><button data-game="six" aria-pressed="false">▥ 6키 리듬</button><button data-game="drum" aria-pressed="false">◉ 태고 리듬</button>';
 document.querySelector('header').after(nav);
 const panel=document.createElement('section');panel.id='extraMode';panel.hidden=true;
 panel.innerHTML='<div id="extraMenu"><div class="intro"><div><p class="eyebrow">RHYTHM POCKET / NEW PLAY</p><h1 id="extraTitle"></h1><p id="extraHelp"></p></div></div><div class="section-title"><h2>난이도 선택</h2><button class="quiet" id="extraSettings">타이밍 설정 ⚙</button></div><div id="extraLevels" class="extra-levels"></div></div><div id="extraPlay" hidden><div class="game-top"><button id="extraBack" class="quiet">← 난이도 선택</button><strong id="extraLabel"></strong><button id="extraPause" class="quiet">Ⅱ 일시정지</button></div><div class="stats"><div><small>SCORE</small><b id="extraScore">0</b></div><div><small>COMBO</small><b id="extraCombo">0</b></div><div><small>PROGRESS</small><b id="extraProgress">0%</b></div></div><div class="extra-arena"><canvas id="extraCanvas" width="900" height="540" aria-label="다가오는 노트와 판정선"></canvas><div id="extraFeedback" role="status">준비!</div></div><div id="extraPads" class="extra-pads"></div><p class="extra-hint" id="extraHint"></p></div><dialog id="extraResult"><p class="eyebrow">NICE RHYTHM!</p><h2 id="extraResultTitle"></h2><p id="extraSummary"></p><p id="extraDetails"></p><button id="extraRetry" class="primary">다시 도전</button><button id="extraDone" class="quiet">난이도 선택</button></dialog>';
 nav.after(panel);
 function silence(){for(const n of nodes){try{n.stop();}catch{}}nodes.clear();}
 function cleanup(){generation++;cancelAnimationFrame(frameId);state=null;silence();$('extraResult').close();}
 function menu(){cleanup();$('extraMenu').hidden=false;$('extraPlay').hidden=true;drawMenu();}
 function drawMenu(){
  $('extraTitle').textContent=mode==='six'?'여섯 레인, 나만의 리듬.':'둥! 딱! 박자를 두드려요.';
  $('extraHelp').textContent=mode==='six'?'내려오는 노트를 판정선에서 S · D · F · J · K · L로 쳐요. 높은 난이도에는 동시치기도 등장해요.':'오른쪽에서 오는 빨강은 가운데(D · K), 파랑은 테두리(S · L)! 왼쪽 원에 맞춰 쳐요.';
  $('extraLevels').innerHTML=levels.map((l,i)=>`<button class="extra-card" data-level="${i}"><span class="extra-number">0${i+1}</span><span class="eyebrow">${'●'.repeat(i+1)}${'○'.repeat(5-i)}</span><h3>${l.name}</h3><p>${l.desc}</p><b>${l.bpm} BPM · ${Math.round(64*60/l.bpm)}초</b><small>${records[mode+i]?`최고 ${records[mode+i].score.toLocaleString()}점 · ${records[mode+i].accuracy}%`:'새 기록에 도전하세요'}</small></button>`).join('');
  panel.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>begin(+b.dataset.level));
 }
 async function switchMode(next){cleanup();await home();mode=next;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===mode)));$('menu').hidden=mode!=='pocket';panel.hidden=mode==='pocket';if(mode!=='pocket')menu();}
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>switchMode(b.dataset.game));
 $('brand').onclick=()=>switchMode('pocket');
 function chartFor(level,type){
  const l=levels[level],notes=[];let index=0;
  for(let beat=4;beat<68;beat+=l.step){
   // Repeating musical phrases make the chart learnable rather than random.
   const lane=type==='six'?[0,2,1,3,5,4,2,4,1,5,0,3][index%12]:(Math.floor(index/2)+Math.floor(index/7))%2;
   const at=beat+(level===2&&index%4===3?.5:0);
   notes.push({beat:at,lane,done:false});
   if(type==='six'&&level>=3&&index%(level===3?8:4)===0)notes.push({beat:at,lane:(lane+3)%6,done:false});
   if(level===5&&index%8>=6)notes.push({beat:at+.25,lane:type==='six'?(lane+1)%6:1-lane,done:false});
   index++;
  }
  return notes.sort((a,b)=>a.beat-b.beat);
 }
 async function begin(level){
  cleanup();const token=generation;
  try{await initAudio();}catch{$('extraHelp').textContent='소리를 시작하지 못했어요. 다시 눌러 주세요.';return;}
  if(token!==generation)return;
  const l=levels[level];state={level,notes:chartFor(level,mode),start:audio.currentTime+.2,spb:60/l.bpm,tick:0,score:0,combo:0,max:0,perfect:0,good:0,miss:0,paused:false,feedbackUntil:0};
  $('extraMenu').hidden=true;$('extraPlay').hidden=false;$('extraLabel').textContent=`${mode==='six'?'6키':'태고'} · ${l.name} · ${l.bpm} BPM`;$('extraPause').textContent='Ⅱ 일시정지';
  const labels=mode==='six'?['S','D','F','J','K','L']:['S · 딱','D · 둥','K · 둥','L · 딱'];
  $('extraPads').style.setProperty('--pads',labels.length);
  $('extraPads').innerHTML=labels.map((k,i)=>`<button data-pad="${mode==='six'?i:[1,0,0,1][i]}" class="${mode==='drum'?([0,3].includes(i)?'rim':'center'):''}">${k}</button>`).join('');
  panel.querySelectorAll('[data-pad]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();hit(+b.dataset.pad);};b.onclick=e=>{if(e.detail===0)hit(+b.dataset.pad);};});
  $('extraHint').textContent=mode==='six'?'S D F / J K L · 노트가 아래 선에 닿으면 입력 · ESC 일시정지':'빨강 둥 = D / K · 파랑 딱 = S / L · ESC 일시정지';
  frame();
 }
 function feedback(message){$('extraFeedback').textContent=message;if(state)state.feedbackUntil=audio.currentTime+.5;}
 function judge(note,result){note.done=true;state[result]++;if(result==='miss')state.combo=0;else{state.combo++;state.max=Math.max(state.max,state.combo);state.score+=result==='perfect'?1000:650;}feedback(result.toUpperCase());}
 function hit(lane){
  if(!state||state.paused)return;
  const time=audio.currentTime-state.start-offset/1000;
  if(time<4*state.spb-.17)return;
  const note=state.notes.find(n=>!n.done&&n.lane===lane&&Math.abs(n.beat*state.spb-time)<=.16);
  if(note)judge(note,Math.abs(note.beat*state.spb-time)<=.065?'perfect':'good');
  else {state.combo=0;feedback('빈 타격');}
  if(mode==='drum')drum(audio.currentTime,lane===0?'kick':'snare');else tone(hz(60+lane*2),audio.currentTime,.08,.13);
 }
 function pauseExtra(){if(!state)return;if(state.paused){state.start+=audio.currentTime-state.pauseAt;state.paused=false;$('extraPause').textContent='Ⅱ 일시정지';}else{state.pauseAt=audio.currentTime;state.paused=true;silence();$('extraPause').textContent='▶ 계속하기';feedback('잠깐 쉬는 중');}}
 document.addEventListener('keydown',e=>{if(mode==='pocket'||!state)return;if(e.code==='Escape'){e.preventDefault();if(!e.repeat)pauseExtra();return;}const index=keys.indexOf(e.code);if(index<0)return;e.preventDefault();if(e.repeat)return;if(mode==='six')hit(index);else if([0,1,4,5].includes(index))hit(index===1||index===4?0:1);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state&&!state.paused)pauseExtra();});
 window.addEventListener('blur',()=>{if(state&&!state.paused)pauseExtra();});
 function frame(){
  if(!state)return;const r=state,now=r.paused?r.pauseAt:audio.currentTime,beat=(now-r.start)/r.spb;
  if(!r.paused){
   while(r.tick<=272&&r.start+r.tick*.25*r.spb<now+.1){const t=r.start+r.tick*.25*r.spb;if(t>=now){const k=r.tick;if(k%4===0)drum(t,k%8===0?'kick':'snare');if(k>=16&&k%2===0){tone(hz(48+[0,7,3,10][Math.floor(k/16)%4]),t,.15,.08);tone(hz(72+[0,2,7,5,3,7,10,7][Math.floor(k/2)%8]),t,.1,.05,'sine');}if(k<16&&k%4===0)tone(900,t,.05,.1);}r.tick++;}
   for(const n of r.notes)if(!n.done&&(now-r.start-offset/1000)-n.beat*r.spb>.16)judge(n,'miss');
   if(beat>=69){finish();return;}
   if(beat<4)feedback(`준비 · ${Math.max(1,4-Math.floor(Math.max(0,beat)))}`);else if(now>r.feedbackUntil)$('extraFeedback').textContent=r.combo>=10?'리듬을 이어가요!':'';
  }
  $('extraScore').textContent=r.score.toLocaleString();$('extraCombo').textContent=r.combo;$('extraProgress').textContent=Math.round(clamp((beat-4)/64,0,1)*100)+'%';
  draw(beat);frameId=requestAnimationFrame(frame);
 }
 function draw(beat){
  const c=$('extraCanvas').getContext('2d');c.fillStyle='#171d35';c.fillRect(0,0,900,540);
  const colors=['#f2ba58','#81d7d3','#ed8d9e','#ed8d9e','#81d7d3','#f2ba58'];
  c.font='bold 20px sans-serif';c.textAlign='center';
  if(mode==='six'){
   for(let i=0;i<6;i++){c.fillStyle=i%2?'#252c49':'#202640';c.fillRect(90+i*120,0,118,540);c.fillStyle=colors[i];c.fillText(['S','D','F','J','K','L'][i],150+i*120,510);}
   c.fillStyle='#fff5da';c.fillRect(90,458,718,4);
   for(const n of state.notes){const y=460-(n.beat-beat)*125;if(n.done||y< -20||y>490)continue;c.fillStyle=colors[n.lane];c.fillRect(98+n.lane*120,y-9,102,18);c.fillStyle='#ffffff90';c.fillRect(102+n.lane*120,y-7,94,3);}
  }else{
   c.fillStyle='#303954';c.fillRect(0,195,900,150);c.strokeStyle='#fff5da';c.lineWidth=5;c.beginPath();c.arc(140,270,49,0,Math.PI*2);c.stroke();
   c.fillStyle='#f8edda';c.fillText('여기서 치기',140,385);
   for(const n of state.notes){const x=140+(n.beat-beat)*160;if(n.done||x< -40||x>950)continue;c.fillStyle=n.lane===0?'#ff817e':'#73d4ed';c.beginPath();c.arc(x,270,28,0,Math.PI*2);c.fill();c.fillStyle='#172039';c.fillText(n.lane===0?'둥':'딱',x,277);}
   c.fillStyle='#ff817e';c.fillText('● 가운데  D / K',350,465);c.fillStyle='#73d4ed';c.fillText('● 테두리  S / L',610,465);
  }
 }
 function finish(){const r=state;silence();const accuracy=Math.round((r.perfect+r.good*.65)/r.notes.length*100),key=mode+r.level;const rank=accuracy>=95?'S':accuracy>=85?'A':accuracy>=70?'B':'C';
  if(!records[key]||records[key].score<r.score){records[key]={score:r.score,accuracy};try{localStorage.setItem('rp-extra-best',JSON.stringify(records));}catch{}}
  $('extraResultTitle').textContent=`${rank} · ${levels[r.level].name} 완료!`;$('extraSummary').textContent=`${r.score.toLocaleString()}점 · 정확도 ${accuracy}% · 최대 ${r.max}콤보`;$('extraDetails').textContent=`PERFECT ${r.perfect} / GOOD ${r.good} / MISS ${r.miss}`;
  state=null;$('extraRetry').onclick=()=>begin(r.level);$('extraResult').showModal();
 }
 $('extraBack').onclick=menu;$('extraPause').onclick=pauseExtra;$('extraDone').onclick=menu;$('extraResult').addEventListener('cancel',e=>{e.preventDefault();menu();});$('extraSettings').onclick=()=>$('settingsDialog').showModal();
})();
