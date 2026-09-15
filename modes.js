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
 // 6키는 마디마다 리듬 꼴을 정해 둔다. 쉬는 박이 남아 있어야 손을 옮길 시간이 생긴다.
 const sixBars=[
  [[0,2]],
  [[0,1,2,3]],
  [[0,1,2,3.5]],
  [[0,1,2,3],[0,1,1.5,2,3],[0,.5,1,2,2.5,3],[0,1,2,2.5,3,3.5]],
  [[0,.5,1,2,3],[0,1,1.5,2,2.5,3],[0,.5,1,2,2.5,3,3.5],[0,1,1.5,2,3,3.5]],
  [[0,.5,1,1.5,2,3],[0,.5,1,2,2.5,3,3.5],[0,.5,1,1.5,2,2.5,3],[0,.5,1,1.75,2.5,3,3.5]]
 ];
 const sixLanes=[0,2,1,3,5,4,2,4,1,5,0,3],sixChordBars=[0,0,0,4,2,1];
 let musicTimer=null;
 let mode='pocket',state=null,frameId=0,generation=0,records={};
 try { records=JSON.parse(localStorage.getItem('rp-extra-best')||'{}')||{}; } catch {}
 const nav=document.createElement('nav');nav.className='game-tabs';nav.setAttribute('aria-label','게임 종류');
 nav.innerHTML='<button data-game="pocket" aria-pressed="true">♪ 리듬 포켓</button><button data-game="six" aria-pressed="false">▥ 6키 리듬</button><button data-game="drum" aria-pressed="false">◉ 태고 리듬</button>';
 document.querySelector('header').after(nav);
 const panel=document.createElement('section');panel.id='extraMode';panel.hidden=true;
 panel.innerHTML='<div id="extraMenu"><div class="intro"><div><p class="eyebrow">RHYTHM POCKET / NEW PLAY</p><h1 id="extraTitle"></h1><p id="extraHelp"></p></div></div><div class="section-title"><h2>테마 · 난이도 선택</h2><button class="quiet" id="extraSettings">타이밍 설정 ⚙</button></div><div id="extraLevels" class="extra-levels"></div></div><div id="extraPlay" hidden><div class="game-top"><button id="extraBack" class="quiet">← 테마 · 난이도 선택</button><strong id="extraLabel"></strong><button id="extraPause" class="quiet">Ⅱ 일시정지</button></div><div class="stats"><div><small>SCORE</small><b id="extraScore">0</b></div><div><small>COMBO</small><b id="extraCombo">0</b></div><div><small>PROGRESS</small><b id="extraProgress">0%</b></div></div><div class="extra-arena"><canvas id="extraCanvas" width="900" height="540" aria-label="다가오는 노트와 판정선"></canvas><div id="extraFeedback" role="status">준비!</div></div><div id="extraPads" class="extra-pads"></div><p class="extra-hint" id="extraHint"></p></div><dialog id="extraResult"><p class="eyebrow">NICE RHYTHM!</p><h2 id="extraResultTitle"></h2><p id="extraSummary"></p><p id="extraDetails"></p><p id="extraTip" class="next-tip"></p><button id="extraNext" class="primary">다음 라운드 →</button><button id="extraRetry" class="quiet">다시 도전</button><button id="extraDone" class="quiet">테마 · 난이도 선택</button></dialog>';
 nav.after(panel);
 function silence(){for(const n of nodes){try{n.stop();}catch{}}nodes.clear();}
 function cleanup(){document.body.classList.remove('extra-playing');clearInterval(musicTimer);musicTimer=null;generation++;cancelAnimationFrame(frameId);state=null;silence();$('extraResult').close();}
 function menu(){cleanup();$('extraMenu').hidden=false;$('extraPlay').hidden=true;drawMenu();}
 function drawMenu(){
  $('extraTitle').textContent=mode==='six'?'여섯 레인, 나만의 리듬.':'둥! 딱! 박자를 두드려요.';
  $('extraHelp').textContent=mode==='six'?'내려오는 노트를 판정선에서 S · D · F · J · K · L로 쳐요. 높은 난이도에는 동시치기도 등장해요.':'오른쪽에서 오는 빨강은 가운데(D · K), 파랑은 테두리(S · L)! 왼쪽 원에 맞춰 쳐요.';
  $('extraLevels').innerHTML=levels.map((l,i)=>`<button class="extra-card" data-level="${i}"><span class="extra-number">0${i+1}</span><span class="eyebrow">${'●'.repeat(i+1)}${'○'.repeat(5-i)}</span><h3>${GameThemes.get(mode,i).name}</h3><p>${GameThemes.get(mode,i).story}</p><p><strong>${l.name}</strong> · ${l.desc}</p><b>${l.bpm} BPM · ${Math.round(64*60/l.bpm)}초 · 노트 ${chartFor(i,mode).length}개</b><small>${records[mode+i]?`최고 ${records[mode+i].score.toLocaleString()}점 · ${records[mode+i].accuracy}%`:'새 기록에 도전하세요'}</small></button>`).join('');
  panel.querySelectorAll('[data-level]').forEach(b=>{
   const id=+b.dataset.level;b.onclick=()=>begin(id);
   const art=document.createElement('canvas');art.width=320;art.height=170;art.className='friend-preview';art.setAttribute('aria-label',RhythmFriends.names[id]+(mode==='drum'?' 북 연주자':' 리듬 친구'));
   b.prepend(art);const ctx=art.getContext('2d'),theme=GameThemes.get(mode,id);GameThemes.backdrop(ctx,theme,0,320,170);RhythmFriends.draw(ctx,id,160,110,.85,0,'happy',mode==='drum');b.style.borderColor=theme.accent;art.setAttribute('aria-label',theme.name+' · '+theme.story);
  });
 }
 let switchGeneration=0;
 async function switchMode(next){const token=++switchGeneration;window.Dokkaebi?.stop();cleanup();await home();if(token!==switchGeneration)return;mode=next;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===mode)));$('menu').hidden=mode!=='pocket';panel.hidden=!['six','drum'].includes(mode);if(mode==='dokkaebi')window.Dokkaebi.open();else if(mode!=='pocket')menu();}
 window.RhythmModes={switchMode};
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>switchMode(b.dataset.game));
 $('brand').onclick=()=>switchMode('pocket');
 function chartFor(level,type){
  const l=levels[level],notes=[];let index=0;
  if(type==='six'){
   const bars=sixBars[level];
   for(let bar=0;bar<16;bar++)for(const p of bars[bar%bars.length]){
    const lane=sixLanes[index%sixLanes.length],at=4+bar*4+p;
    notes.push({beat:at,lane,done:false});
    // 동시치기는 마디 첫 박에만, 난이도가 오를수록 자주 나온다.
    if(level>=3&&p===0&&bar%sixChordBars[level]===0)notes.push({beat:at,lane:(lane+3)%6,done:false});
    index++;
   }
   return notes.sort((a,b)=>a.beat-b.beat);
  }
  for(let beat=4;beat<68;beat+=l.step){
   // Repeating musical phrases make the chart learnable rather than random.
   const lane=(Math.floor(index/2)+Math.floor(index/7))%2;
   const at=beat+(level===2&&index%4===3?.5:0);
   notes.push({beat:at,lane,done:false});
   if(level===5&&index%8>=6)notes.push({beat:at+.25,lane:1-lane,done:false});
   index++;
  }
  return notes.sort((a,b)=>a.beat-b.beat);
 }
 async function begin(level){
  cleanup();const token=generation;
  try{await initAudio();}catch{$('extraHelp').textContent='소리를 시작하지 못했어요. 다시 눌러 주세요.';return;}
  if(token!==generation)return;
  const l=levels[level];state={level,notes:chartFor(level,mode),start:audio.currentTime+.2,spb:60/l.bpm,tick:0,score:0,combo:0,max:0,perfect:0,good:0,miss:0,paused:false,feedbackUntil:0};
  document.body.classList.add('extra-playing');window.scrollTo(0,0);
  $('extraMenu').hidden=true;$('extraPlay').hidden=false;$('extraLabel').textContent=`${GameThemes.get(mode,level).name} · ${l.name} · ${l.bpm} BPM`;$('extraPause').textContent='Ⅱ 일시정지';
  const labels=mode==='six'?['S','D','F','J','K','L']:['S · 딱','D · 둥','K · 둥','L · 딱'];
  $('extraPads').style.setProperty('--pads',labels.length);
  $('extraPads').innerHTML=labels.map((k,i)=>`<button data-pad="${mode==='six'?i:[1,0,0,1][i]}" class="${mode==='drum'?([0,3].includes(i)?'rim':'center'):''}">${k}</button>`).join('');
  panel.querySelectorAll('[data-pad]').forEach(b=>{
   const pointers=new Set();
   b.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();pointers.add(e.pointerId);b.setPointerCapture?.(e.pointerId);b.classList.add('pressed');hit(+b.dataset.pad);};
   const release=e=>{pointers.delete(e.pointerId);if(!pointers.size)b.classList.remove('pressed');};
   b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
   b.oncontextmenu=e=>e.preventDefault();b.onclick=e=>{if(e.detail===0)hit(+b.dataset.pad);};
  });
  $('extraHint').textContent=mode==='six'?'아래 6개 버튼을 터치 · 동시치기는 두 손가락 · 키보드 S D F / J K L':'빨강 = 둥 버튼 · 파랑 = 딱 버튼 · 양손으로 번갈아 터치';
  musicTimer=setInterval(scheduleExtra,25);scheduleExtra();frame();
 }
 function feedback(message){$('extraFeedback').textContent=message;if(state)state.feedbackUntil=audio.currentTime+.5;}
 function judge(note,result){note.done=true;state[result]++;state.reactions??={};state.reactions[note.lane]={beat:(audio.currentTime-state.start)/state.spb,mood:result==='miss'?'sad':'happy'};if(result==='miss')state.combo=0;else{state.combo++;state.max=Math.max(state.max,state.combo);state.score+=result==='perfect'?1000:650;}feedback(result.toUpperCase());}
 function hit(lane){
  if(!state||state.paused)return;
  const time=audio.currentTime-state.start-offset/1000;
  if(time<4*state.spb-.17)return;
  const note=state.notes.find(n=>!n.done&&n.lane===lane&&Math.abs(n.beat*state.spb-time)<=.16);
  if(note)judge(note,Math.abs(note.beat*state.spb-time)<=.065?'perfect':'good');
  else {state.combo=0;feedback('빈 타격');}
  if(mode==='drum')PocketMusic.taiko(audio.currentTime,lane===1,.65);else tone(hz(60+lane*2),audio.currentTime,.08,.13);
 }
 function pauseExtra(){panel.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));if(!state)return;if(state.paused){state.start+=audio.currentTime-state.pauseAt;state.paused=false;$('extraPause').textContent='Ⅱ 일시정지';}else{state.pauseAt=audio.currentTime;state.tick=Math.max(0,Math.ceil((state.pauseAt-state.start)/state.spb*4));state.paused=true;silence();$('extraPause').textContent='▶ 계속하기';feedback('잠깐 쉬는 중');}}
 document.addEventListener('keydown',e=>{if(mode==='pocket'||!state)return;if(e.code==='Escape'){e.preventDefault();if(!e.repeat)pauseExtra();return;}const index=keys.indexOf(e.code);if(index<0)return;e.preventDefault();if(e.repeat)return;if(mode==='six')hit(index);else if([0,1,4,5].includes(index))hit(index===1||index===4?0:1);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state&&!state.paused)pauseExtra();});
 window.addEventListener('blur',()=>{if(state&&!state.paused)pauseExtra();});
 function scheduleExtra(){
  if(!state||state.paused)return;
  const r=state,now=audio.currentTime;
  while(r.tick<272){const time=r.start+r.tick*.25*r.spb;if(time>now+.12)break;
   if(time>=now)PocketMusic.tick({tick:r.tick,time,spb:r.spb,notes:r.notes,style:r.level,mode,total:68});r.tick++;
  }
 }
 function frame(){
  if(!state)return;const r=state,now=r.paused?r.pauseAt:audio.currentTime,beat=(now-r.start)/r.spb;
  if(!r.paused){
   for(const n of r.notes)if(!n.done&&(now-r.start-offset/1000)-n.beat*r.spb>.16)judge(n,'miss');
   if(beat>=69){finish();return;}
   if(beat<4)feedback(`준비 · ${Math.max(1,4-Math.floor(Math.max(0,beat)))}`);else if(now>r.feedbackUntil)$('extraFeedback').textContent=r.combo>=10?'리듬을 이어가요!':'';
  }
  $('extraScore').textContent=r.score.toLocaleString();$('extraCombo').textContent=r.combo;$('extraProgress').textContent=Math.round(clamp((beat-4)/64,0,1)*100)+'%';
  draw(beat);frameId=requestAnimationFrame(frame);
 }
 function draw(beat){ArcadeVisuals.draw($('extraCanvas').getContext('2d'),mode,state,beat);}
 function finish(){clearInterval(musicTimer);musicTimer=null;const r=state;silence();const accuracy=Math.round((r.perfect+r.good*.65)/r.notes.length*100),key=mode+r.level;const rank=accuracy>=95?'S':accuracy>=85?'A':accuracy>=70?'B':'C';
  if(!records[key]||records[key].score<r.score){records[key]={score:r.score,accuracy};try{localStorage.setItem('rp-extra-best',JSON.stringify(records));}catch{}}
  $('extraResultTitle').textContent=`${rank} · ${GameThemes.get(mode,r.level).name} 완료!`;$('extraSummary').textContent=`${r.score.toLocaleString()}점 · 정확도 ${accuracy}% · 최대 ${r.max}콤보`;$('extraDetails').textContent=`PERFECT ${r.perfect} / GOOD ${r.good} / MISS ${r.miss}`;
  state=null;$('extraRetry').onclick=()=>begin(r.level);
  // 한 라운드가 끝나면 다음 난이도를 말풍선으로 안내한다.
  const last=r.level>=levels.length-1,target=last?0:r.level+1,nextLevel=levels[target],nextTheme=GameThemes.get(mode,target);
  $('extraTip').innerHTML=last
   ?'마지막 라운드까지 완주했어요! <b>'+nextTheme.name+'</b>로 돌아가 기록을 갱신해 볼까요?'
   :(accuracy>=70?'좋아요! 다음 라운드는 ':'조금 더 익히고 싶다면 다시 도전, 바로 가려면 ')+'<b>'+nextTheme.name+'</b> · '+nextLevel.name+' · '+nextLevel.bpm+' BPM<br>'+nextLevel.desc;
  $('extraNext').textContent=last?'첫 라운드로 →':'다음 라운드 →';
  $('extraNext').onclick=()=>{$('extraResult').close();begin(target);};
  $('extraResult').showModal();
 }
 $('extraBack').onclick=menu;$('extraPause').onclick=pauseExtra;$('extraDone').onclick=menu;$('extraResult').addEventListener('cancel',e=>{e.preventDefault();menu();});$('extraSettings').onclick=()=>$('settingsDialog').showModal();
})();
