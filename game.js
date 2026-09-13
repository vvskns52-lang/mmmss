'use strict';
const H=(beat,hold)=>({beat,hold});
const STAGES=[
 {name:'당근 뽑기',genre:'GARDEN POP',bpm:104,bg:'#bde8cd',action:'쏙!',short:'뽑기 · 정박에서 엇박으로',hint:'당근이 동그란 흙 구멍에 올 때 쏙! 뒤로 갈수록 반 박 빠른 당근과 두 개 연속 당근이 나와요.',patterns:[[3],[1,3],[2.5,3.5],[1.5,3]],bars:16,root:60,melody:[0,4,7,9,7,4,2,4],wave:'triangle',level:1},
 {name:'고양이 베이커리',genre:'BUTTER SWING',bpm:112,bg:'#ffd4ad',action:'꾹!',short:'반죽 · 두 번 탭 + 밀기',hint:'반죽이 밀대 아래로 오면 톡톡! 파란 반죽은 누르고 있다가 꼬리 끝에서 놓아 길게 펴주세요.',patterns:[[2,3],[2,2.5,3.5],[H(1,1),3,3.5],[1.5,2.5,3]],bars:16,root:62,melody:[0,3,7,10,9,7,3,2],wave:'triangle',level:2},
 {name:'우주 택배',genre:'COSMIC DISCO',bpm:118,bg:'#272e58',action:'슝!',short:'발사 · 엇박 + 충전',hint:'도킹 링에 맞춰 상자를 발사해요. 파란 노트는 충전! 시작에서 누르고 꼬리 끝에서 놓아 발사하세요.',patterns:[[1.5,3],[.5,2.5,3.5],[H(.5,1.5),3.5],[1.25,2,3.25]],bars:16,root:57,melody:[0,7,12,10,7,5,3,7],wave:'square',level:3},
 {name:'펭귄 아이스밴드',genre:'POLAR FUNK',bpm:110,bg:'#b9e3f6',action:'탁!',short:'드럼 · 교대 타격 + 빠른 필인',hint:'양쪽 드럼을 한 버튼으로 번갈아 쳐요. 분홍 노트가 이어지면 타타탁! 4분의 1박 필인도 등장해요.',patterns:[[1,3],[1,2.5,3,3.5],[1,2,3,3.25,3.5],[.5,1.5,2.5,3.5]],bars:16,root:65,melody:[0,5,7,10,7,5,3,0],wave:'sine',level:4},
 {name:'개구리의 연못',genre:'LILY BOSSA',bpm:122,bg:'#c5dda0',action:'폴짝!',short:'점프 · 엇박 + 도약',hint:'연잎이 개구리 아래에 오면 폴짝! 파란 노트는 웅크렸다가 끝에서 놓아 크게 뛰어요. 엇박 착지를 조심!',patterns:[[1,2.5,3.5],[.5,1.5,3],[H(1,1.5),3.5],[.75,1.5,2.75,3.5]],bars:16,root:59,melody:[0,4,7,11,9,7,4,2],wave:'triangle',level:4},
 {name:'한밤의 리믹스',genre:'MIDNIGHT REMIX',bpm:128,bg:'#ffb9c9',action:'좋아!',short:'종합 · 두 마디마다 세계 전환',hint:'농장, 빵집, 우주, 밴드, 연못이 두 마디마다 바뀝니다. 앞의 모든 엇박과 홀드 패턴이 다시 등장해요!',patterns:[[3]],bars:20,root:60,melody:[0,7,10,12,10,7,5,3],wave:'sawtooth',level:5}
];
const $=id=>document.getElementById(id), hz=m=>440*Math.pow(2,(m-69)/12), clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let best={},offset=0;
try{best=JSON.parse(localStorage.getItem('rp-groove-best')||'{}');if(!best||typeof best!=='object')best={};offset=clamp(Number(localStorage.getItem('rp-offset'))||0,-200,200);}catch{}
let audio,master,noiseBuffer,muted=false,selected=0,practice=false,run=null,loop=null,raf=null,starting=false,volume=.7,guideSound=true;
try{const prefs=JSON.parse(localStorage.getItem('rp-sound')||'{}');if(Number.isFinite(prefs.volume))volume=clamp(prefs.volume,0,1);if(typeof prefs.guide==='boolean')guideSound=prefs.guide;}catch{}
const nodes=new Set();
function renderMenu(){
 $('stages').innerHTML=STAGES.map((s,i)=>`<button class="stage" style="--bg:${s.bg}" data-stage="${i}" aria-label="${s.name} 시작"><div class="stage-art"><canvas id="thumb${i}" width="600" height="282" aria-hidden="true"></canvas><span class="stage-num">0${i+1}</span><span class="stage-level">${'●'.repeat(s.level)}${'○'.repeat(5-s.level)}</span></div><div class="stage-copy"><h3>${s.name}<span>↗</span></h3><p>${s.short}</p><span class="best">${'★'.repeat(best[i]?.stars||0)}${'☆'.repeat(3-(best[i]?.stars||0))}<span>${best[i]?best[i].rank+' · '+best[i].score.toLocaleString()+'점':s.bpm+' BPM'}</span></span></div></button>`).join('');
 document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>choose(+b.dataset.stage));
 STAGES.forEach((s,i)=>Scenes.draw($('thumb'+i),i,7));
 $('collection').textContent=`★ ${Object.values(best).reduce((sum,b)=>sum+(b.stars||0),0)} / 18 · 스테이지마다 별 3개`;
}
function setPractice(value){practice=value;$('normalMode').classList.toggle('selected',!value);$('practiceMode').classList.toggle('selected',value);$('normalMode').setAttribute('aria-pressed',String(!value));$('practiceMode').setAttribute('aria-pressed',String(value));}
function choose(i){selected=i;const s=STAGES[i];$('dialogGenre').textContent=`STAGE 0${i+1} / ${s.genre}`;$('dialogTitle').textContent=s.name;$('dialogInfo').textContent=s.hint;$('mechanicPreview').innerHTML=`<span>● 탭</span><span class="offbeat">● 엇박 / 연타</span>${i>0&&i!==3?'<span class="holdmark">━━━━ 홀드</span>':''}`;$('introDialog').showModal();}
async function initAudio(){
 if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();master=audio.createGain();const limiter=audio.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=8;master.connect(limiter);limiter.connect(audio.destination);noiseBuffer=audio.createBuffer(1,audio.sampleRate,audio.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
 if(audio.state==='suspended')await audio.resume();master.gain.setValueAtTime(muted?0:.65*volume,audio.currentTime);
}
function track(o,g){nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect();};}
function tone(freq,time,len=.12,vol=.12,type='triangle'){
 const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(vol,time+.006);g.gain.exponentialRampToValueAtTime(.0001,time+len);o.connect(g);g.connect(master);track(o,g);o.start(time);o.stop(time+len+.02);
}
function noise(time,len,volume,highpass){const o=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();o.buffer=noiseBuffer;f.type='highpass';f.frequency.value=highpass;g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.0001,time+len);o.connect(f);f.connect(g);g.connect(master);track(o,g);o.start(time);o.stop(time+len+.01);}
function drum(time,kind){if(kind==='hat'){noise(time,.045,.09,7000);return;}if(kind==='snare'){noise(time,.13,.17,1100);tone(170,time,.08,.08,'triangle');return;}const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(145,time);o.frequency.exponentialRampToValueAtTime(42,time+.13);g.gain.setValueAtTime(.38,time);g.gain.exponentialRampToValueAtTime(.0001,time+.22);o.connect(g);g.connect(master);track(o,g);o.start(time);o.stop(time+.25);}
function sceneFor(index,bar){return index===5?Math.floor(Math.max(0,bar)/2)%5:index;}
function chart(s,index,bars=s.bars){
 const notes=[];
 for(let bar=0;bar<bars;bar++){
  const scene=sceneFor(index,bar),source=STAGES[scene];
  const pIndex=index===5?(bar+Math.floor(bar/10))%source.patterns.length:bar<2?0:(bar-2)%source.patterns.length;
  const pattern=source.patterns[pIndex];
  for(const entry of pattern){const v=typeof entry==='number'?{beat:entry,hold:0}:entry;notes.push({beat:4+bar*4+v.beat,hold:v.hold||0,off:v.beat%1!==0,index:notes.length,scene,state:null,started:false});}
 }
 for(let i=1;i<notes.length;i++)if(notes[i].beat-notes[i-1].beat<=.5){notes[i].off=true;notes[i-1].off=true;}
 return notes;
}
function stop(){if(loop)clearInterval(loop);if(raf)cancelAnimationFrame(raf);loop=null;raf=null;run=null;for(const o of nodes){try{o.stop();}catch{}}nodes.clear();if(master&&audio)master.gain.setValueAtTime(0,audio.currentTime);$('tap').classList.remove('pressed');}
async function start(mode='play'){
 if(starting)return;starting=true;
 try{stop();await initAudio();}catch{$('dialogInfo').textContent='소리를 시작하지 못했어요. 다시 눌러 주세요.';starting=false;return;}
 $('introDialog').close();$('result').close();const s=STAGES[selected],bars=mode==='demo'?8:s.bars,spb=60/(s.bpm*(practice?.8:1));
 run={s,index:selected,mode,practice,spb,start:audio.currentTime+.35,notes:chart(s,selected,bars),total:4+bars*4,nextTick:0,lastBeat:-1,lastBar:-99,sceneId:sceneFor(selected,0),score:0,combo:0,maxCombo:0,perfect:0,good:0,miss:0,extras:0,paused:false,down:false,holding:null,holdProgress:0,lastHitBeat:-99,lastMissBeat:-99,lastHitIndex:0,particles:[],feedbackUntil:0,timingErrors:[],resumeUntil:0,patternKey:null};
 document.body.classList.add('play-active');$('pauseOverlay').hidden=true;$('timingText').textContent='가운데에 맞춰요';$('timingMarker').style.left='50%';buildLane();
 $('menu').hidden=true;$('play').hidden=false;$('stageLabel').textContent=`0${selected+1} / ${s.name}${mode==='demo'?' · 시범':practice?' · 연습':''}`;$('sceneName').textContent=s.name;$('genre').textContent=`${s.genre} · ${Math.round(60/spb)} BPM`;$('instruction').textContent=s.hint;$('judgement').textContent=mode==='demo'?'자동 시범 · 박자를 눈과 귀로 익혀요':'첫 네 박은 듣기만 해요';$('pause').textContent='Ⅱ 일시정지';$('tap').disabled=mode==='demo';$('tap').innerHTML=mode==='demo'?'시범 연주 중':'탭! <kbd>SPACE</kbd>';$('arena').classList.remove('hit','miss','fever');$('progressLabel').textContent=mode==='demo'?'AUTO DEMO':'PROGRESS';updateScene(0);updateStats();loop=setInterval(schedule,25);schedule();raf=requestAnimationFrame(frame);starting=false;
}
function musicTick(tick,time){
 const b=tick/4,step=tick%16,bar=Math.max(0,Math.floor((b-4)/4)),s=STAGES[sceneFor(run.index,bar)];
 if(b<4){if(tick%4===0)tone(tick===0?1050:790,time,.08,.18,'sine');return;}
 const chord=[0,5,3,7][Math.floor(bar/2)%4],minor=[1,2,3].includes(sceneFor(run.index,bar));
 const id=sceneFor(run.index,bar),phase=Math.floor(bar/4),ending=bar%4===3;
 const kicks=[[0,8],[0,6,10],[0,4,8,12],[0,7,10],[0,6,8,14]][id];
 if(kicks.includes(step))drum(time,'kick');
 if((id===4?[4,11]:[4,12]).includes(step))drum(time,'snare');
 if(step%2===0&&(phase>0||step%4===2))drum(time,'hat');
 if(ending&&step>=14){drum(time,'hat');if(id===3)tone(hz(53+(step-14)*3),time,.10,.10,'triangle');}
 if(step%4===0)tone(hz(s.root-24+chord+(step===12?7:0)),time,run.spb*.65,.18,'triangle');
 if(step===0||step===10)[0,minor?3:4,7,10].forEach(n=>tone(hz(s.root+chord+n),time,run.spb*.7,.023,s.wave));
 if(step%2===0&&!(phase===0&&step%4===2)&&!(ending&&step===14)){const index=(tick/2+Math.floor(bar/4)*2)%s.melody.length;const octave=bar%8>=6?12:0;const note=hz(s.root+12+s.melody[index]+octave);tone(note,time,run.spb*(id===1?.48:.34),s.wave==='square'||s.wave==='sawtooth'?.024:.065,s.wave);if(phase>=2)tone(note/2,time+.008,run.spb*.5,.018,'sine');}
 if(run.combo>=8&&step%4===2)tone(hz(s.root+24+s.melody[(step/2)%8]),time,.10,.025,'sine');
 const target=run.notes.find(n=>Math.abs(n.beat-b)<.001);
 if(target&&guideSound)tone(target.hold?740:target.off?1480:1245,time,.065,.09,'sine');
 const cue=run.notes.find(n=>Math.abs(n.beat-.5-b)<.001);
 if(cue&&guideSound)tone(cue.hold?370:622,time,.055,.065,'sine');
 if(guideSound&&run.notes.some(n=>n.hold&&Math.abs(n.beat+n.hold-b)<.001))tone(1865,time,.075,.08,'sine');
}
function schedule(){if(!run||run.paused||audio.currentTime<run.resumeUntil)return;while(run.nextTick/4<run.total){const time=run.start+run.nextTick/4*run.spb;if(time>audio.currentTime+.12)break;if(time>=audio.currentTime-.02)musicTick(run.nextTick,time);run.nextTick++;}}
function beatNow(){return (audio.currentTime-run.start)/run.spb;}
function inputSeconds(){return audio.currentTime-run.start-offset/1000;}
function windowFor(n){const prev=run.notes[n.index-1],next=run.notes[n.index+1];return Math.min(run.practice?.20:.165,prev?(n.beat-prev.beat-prev.hold)*run.spb*.47:1,next?(next.beat-n.beat)*run.spb*.47:1);}
function updateStats(){if(!run)return;$('score').textContent=String(run.score).padStart(5,'0');$('combo').textContent=run.combo;$('progress').textContent=`${run.perfect+run.good+run.miss} / ${run.notes.length}`;const fever=run.combo>=8;$('feverFill').style.transform=`scaleX(${Math.min(1,run.combo/8)})`;$('feverLabel').textContent=fever?'FEVER! ×1.2 · 리듬을 이어가요':`${run.combo} / 8 COMBO · FEVER까지`;$('arena').classList.toggle('fever',fever);}
function feedback(label,cls){$('judgement').textContent=label;$('arena').classList.remove('hit','miss');void $('judgement').offsetWidth;$('arena').classList.add(cls);run.feedbackUntil=beatNow()+.7;}
function burst(n){const pos=[[608,265],[684,305],[668,234],[n.index%2?600:400,318],[350,300]][n.scene];for(let i=0;i<(run.combo>=8?24:12);i++){const angle=i*2.399;run.particles.push({x:pos[0],y:pos[1],vx:Math.cos(angle)*(65+i*3),vy:-90+Math.sin(angle)*85,born:beatNow(),color:['#ffda53','#fff3db','#ff849b','#79e3ee'][i%4]});}run.particles=run.particles.slice(-100);}
function judge(n,type,error=0){
 if(n.state)return;n.state=type;run[type]++;if(run.holding===n){run.holding=null;run.holdProgress=0;}
 if(type!=='miss'&&run.mode!=='demo'){run.timingErrors.push(error*1000);$('timingMarker').style.left=`${50+clamp(error/.17,-1,1)*47}%`;$('timingText').textContent=Math.abs(error)<.012?'ON TIME':`${error>0?'+':''}${Math.round(error*1000)} ms`;}
 if(type==='miss'){run.combo=0;run.lastMissBeat=beatNow();feedback(n.hold&&n.started?'HOLD MISS · 끝에서 놓아요':'MISS · 다음 박자에 다시!','miss');}
 else{run.combo++;run.maxCombo=Math.max(run.maxCombo,run.combo);const fever=run.combo>=8;run.score+=Math.round((type==='perfect'?1000:650)*(n.hold?1.5:1)*(fever?1.2:1));run.lastHitBeat=beatNow();run.lastHitIndex=n.index;burst(n);feedback(run.mode==='demo'?(n.hold?'이렇게 놓기!':'지금 탭!'):type==='perfect'?(n.hold?'HOLD PERFECT!':fever?'PERFECT! ×1.2':'PERFECT!'):`GOOD · ${error<0?'EARLY':'LATE'}`,'hit');tone(n.scene===3?220:n.scene===4?740:1760,audio.currentTime,.085,.07,n.scene===3?'triangle':'sine');}
 updateStats();
}
function press(){
 if(!run||run.paused||audio.currentTime<run.resumeUntil||run.mode==='demo'||run.down)return;run.down=true;$('tap').classList.add('pressed');
 if(run.holding)return;
 const t=inputSeconds();if(t<4*run.spb-.2)return;
 let n=null,error=Infinity;for(const note of run.notes){if(note.state||note.started)continue;const e=t-note.beat*run.spb;if(Math.abs(e)<Math.abs(error)){n=note;error=e;}}
 if(n&&Math.abs(error)<=windowFor(n)){if(n.hold){n.started=true;n.startError=error;run.holding=n;feedback('꾹… 파란 꼬리 끝에서 놓기!','hit');tone(740,audio.currentTime,.12,.08);return;}judge(n,Math.abs(error)<=Math.min(.070,windowFor(n)*.6)?'perfect':'good',error);}
 else if(t<run.total*run.spb){run.extras++;run.combo=0;run.score=Math.max(0,run.score-120);run.lastMissBeat=beatNow();feedback('엇! 다음 신호를 기다려요','miss');updateStats();}
}
function release(){
 if(!run)return;run.down=false;$('tap').classList.remove('pressed');if(run.paused)return;
 const n=run.holding;if(!n)return;const error=inputSeconds()-(n.beat+n.hold)*run.spb;
 if(Math.abs(error)>(run.practice?.22:.17))judge(n,'miss',error);else judge(n,Math.abs(error)<=.085&&Math.abs(n.startError)<=.075?'perfect':'good',error);
}
function updateScene(bar){const id=sceneFor(run.index,bar);run.sceneId=id;const s=STAGES[id];$('arena').style.setProperty('--bg',s.bg);$('arena').classList.toggle('space-world',id===2);$('sceneName').textContent=run.index===5?`REMIX / ${s.name}`:s.name;if(run.index===5)$('instruction').textContent=s.hint;}
function renderPattern(bar,beat){const start=4+bar*4;const notes=run.notes.filter(n=>n.beat>=start&&n.beat<start+4);let h='';for(let i=0;i<16;i++){const n=notes.find(n=>Math.abs(n.beat-start-i/4)<.01),tail=notes.some(n=>n.hold&&start+i/4>n.beat&&start+i/4<=n.beat+n.hold);h+=`<span class="step ${i%4===0?'downbeat':''} ${n?(n.hold?'holdmark':n.off?'offbeat':'target'):tail?'tail':''} ${Math.floor((beat-start)*4)===i?'current':''}">${n?n.hold?'━':'●':tail?'━':i%4===0?i/4+1:'·'}</span>`;}$('pattern').innerHTML=h;$('patternLabel').textContent=bar<0?'첫 4박은 준비 시간':`이번 마디 ${bar+1} · 1 e & a / 2 e & a / 3 e & a / 4 e & a`;}
function buildLane(){let h='';run.lane=[];for(let b=0;b<run.total;b++)h+=`<i class="note listen" id="tick-${b}"></i>`;for(const n of run.notes){if(n.hold)h+=`<i class="hold-tail" id="tail-${n.index}" style="width:${n.hold*13}%"></i>`;h+=`<i class="note ${n.hold?'holdnote':n.off?'offnote':''}" id="note-${n.index}"></i>`;}$('lane').innerHTML=h;for(let b=0;b<run.total;b++)run.lane.push({el:$(`tick-${b}`),beat:b,hold:0});for(const n of run.notes){run.lane.push({el:$(`note-${n.index}`),beat:n.beat,hold:0,n});if(n.hold)run.lane.push({el:$(`tail-${n.index}`),beat:n.beat,hold:n.hold,n});}}
function drawLane(beat){for(const item of run.lane){const visible=item.beat+item.hold>beat-4&&item.beat<beat+5;item.el.hidden=!visible;if(visible){item.el.style.left=`${50+(item.beat-beat)*13}%`;item.el.classList.toggle('done',!!item.n?.state);}}}
function advance(){
 if(!run||run.paused||audio.currentTime<run.resumeUntil)return;const beat=beatNow(),sec=inputSeconds();
 for(const n of run.notes){if(n.state)continue;if(run.mode==='demo'){
   if(n.hold&&beat>=n.beat&&!n.started){n.started=true;n.startError=0;run.holding=n;feedback('누르고…','hit');}
   if(beat>=n.beat+n.hold)judge(n,'perfect');
  }else if(n.started){if(sec>(n.beat+n.hold)*run.spb+(run.practice?.22:.17))judge(n,'miss');}
  else if(sec>n.beat*run.spb+windowFor(n)+.02)judge(n,'miss');
 }
 if(run.holding)run.holdProgress=clamp((beat-run.holding.beat)/run.holding.hold,0,1);
 if(beat>run.total+1){finish();return;}
}
function frame(){
 if(!run)return;
 if(!run.paused&&audio.currentTime<run.resumeUntil){$('pauseTitle').textContent=String(Math.ceil((run.resumeUntil-audio.currentTime)/run.spb));raf=requestAnimationFrame(frame);return;}
 if(!run.paused&&run.resumeUntil){run.resumeUntil=0;$('pauseOverlay').hidden=true;$('tap').disabled=run.mode==='demo';}
 if(!run.paused){advance();if(!run)return;const beat=beatNow(),bar=Math.floor((beat-4)/4);
  if(bar!==run.lastBar){run.lastBar=bar;updateScene(Math.max(0,bar));}
  if(beat<4)$('cue').textContent=beat<0?'READY?':`${Math.floor(beat)+1} · 듣고 준비!`;
  else if(run.holding)$('cue').textContent=run.holdProgress>.75?'곧 놓기!':'누르고…';
  else{const n=run.notes.find(n=>!n.state&&n.beat>=beat-.15);if(run.index===5&&bar%2===1&&beat%4>2.6)$('cue').textContent='다음 → '+STAGES[sceneFor(5,bar+1)].name;else $('cue').textContent=n&&n.beat-beat<.5?(n.hold?'꾹 누를 준비!':n.off?'엇박! '+STAGES[n.scene].action:STAGES[n.scene].action):'리듬을 들어요';}
  if(beat>run.feedbackUntil)$('arena').classList.remove('hit','miss');
  const key=Math.floor(beat*4);if(run.patternKey!==key){renderPattern(bar,beat);run.patternKey=key;}
  $('songProgress').style.transform=`scaleX(${clamp((beat-4)/(run.total-4),0,1)})`;$('phrase').textContent=beat<4?'READY':run.index===5?'REMIX':['INTRO','GROOVE','BUILD UP','FINALE'][Math.min(3,Math.floor(bar/4))];
  drawLane(beat);Scenes.draw($('world'),run.index,beat,run);
 }
 raf=requestAnimationFrame(frame);
}
function finish(){
 const r=run,accuracy=clamp((r.perfect+r.good*.65-r.extras*.12)/r.notes.length,0,1);const rank=accuracy>=.95?'S':accuracy>=.8?'A':accuracy>=.6?'B':'C';const goals=[accuracy>=.6,r.maxCombo>=8,accuracy>=.9],stars=goals.filter(Boolean).length;
 const average=r.timingErrors.length?r.timingErrors.reduce((a,b)=>a+b,0)/r.timingErrors.length:0;
 $('resultAdvice').textContent=r.mode==='demo'?'색깔 원이 가운데 선에 닿는 순간을 기억해 주세요.':r.timingErrors.length===0?'먼저 시범을 들어보세요. 노란 원이 가운데 선에 닿을 때 한 번 눌러요.':Math.abs(average)>25?`평균 ${Math.round(Math.abs(average))}ms ${average>0?'늦게':'빠르게'} 눌렀어요. ${average>0?'조금 먼저':'조금 기다렸다가'} 눌러 보세요.`:r.miss>r.notes.length*.25?'타이밍은 좋습니다. 연습 모드에서 엇박 패턴을 익혀 보세요.':'타이밍이 안정적이에요. 엇박과 홀드 끝까지 리듬을 이어 보세요.';
 $('resultBreakdown').innerHTML=[r.perfect,r.good,r.miss].map(n=>`<span style="width:${n/r.notes.length*100}%"></span>`).join('');
 $('rank').textContent=r.mode==='demo'?'♪':rank;$('resultEyebrow').textContent=r.mode==='demo'?'이제 내 손으로 해볼까요?':r.practice?'연습 완료 · 기록은 본게임에서':'THAT’S YOUR RHYTHM!';$('resultTitle').textContent=r.mode==='demo'?'박자가 들리기 시작했나요?':r.miss===0&&r.extras===0?'FULL COMBO!':rank==='S'?'이 세계의 리듬 마스터!':rank==='A'?'완전히 감 잡았어요!':rank==='B'?'좋아요, 한 번 더!':'시범을 듣고 다시 도전!';$('resultSummary').textContent=r.mode==='demo'?'탭은 짧게, 파란 노트는 끝에서 놓기.':`${r.s.name} · ${r.score.toLocaleString()}점 · 정확도 ${Math.round(accuracy*100)}%`;
 $('resultStats').innerHTML=`<span><b>${r.perfect}</b>PERFECT</span><span><b>${r.good}</b>GOOD</span><span><b>${r.miss}</b>MISS</span><span><b>${r.maxCombo}</b>최대 콤보</span>`;$('missions').innerHTML=r.mode==='demo'?'':goals.map((ok,i)=>`<span class="${ok?'earned':''}">${ok?'★':'☆'} ${['정확도 60%','8콤보 달성','정확도 90%'][i]}</span>`).join('');
 if(r.mode==='play'&&!r.practice){const old=best[selected];best[selected]={score:Math.max(old?.score||0,r.score),rank:!old||r.score>(old.score||0)?rank:old.rank,stars:Math.max(old?.stars||0,stars)};try{localStorage.setItem('rp-groove-best',JSON.stringify(best));}catch{}}
 $('next').textContent=r.mode==='demo'?'직접 플레이 →':selected===5?'처음부터 한 번 더 →':'다음 스테이지 →';$('next').dataset.demo=String(r.mode==='demo');stop();$('tap').disabled=true;$('result').showModal();renderMenu();
}
async function pause(){if(!run||run.resumeUntil>audio.currentTime)return;const r=run;if(r.paused){const delay=r.spb*3;r.nextTick=Math.max(0,Math.ceil((audio.currentTime-r.start)/r.spb*4));for(const o of nodes){try{o.stop();}catch{}}nodes.clear();r.start+=delay;r.resumeUntil=audio.currentTime+delay;await audio.resume();if(run!==r)return;r.paused=false;$('pause').textContent='Ⅱ 일시정지';$('resume').hidden=true;$('pauseHint').textContent='다시 리듬에 맞춰요';for(let i=0;i<3;i++)tone(i===2?1050:790,audio.currentTime+i*r.spb,.07,.12,'sine');}else{r.paused=true;await audio.suspend();if(run!==r)return;$('pause').textContent='▶ 계속하기';$('cue').textContent='잠깐 쉬는 중';$('tap').disabled=true;$('pauseOverlay').hidden=false;$('pauseTitle').textContent='잠깐 쉬는 중';$('pauseHint').textContent='계속하기를 누르면 세 박 뒤에 시작해요.';$('resume').hidden=false;}}
async function home(){stop();document.body.classList.remove('play-active');if(audio?.state==='suspended')await audio.resume();$('introDialog').close();$('result').close();$('play').hidden=true;$('menu').hidden=false;renderMenu();}
$('start').onclick=()=>start('play');$('demo').onclick=()=>start('demo');$('normalMode').onclick=()=>setPractice(false);$('practiceMode').onclick=()=>setPractice(true);$('cancel').onclick=()=>$('introDialog').close();
$('tap').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();$('tap').setPointerCapture?.(e.pointerId);press();});$('tap').addEventListener('pointerup',e=>{e.preventDefault();release();});$('tap').addEventListener('pointercancel',release);$('tap').addEventListener('lostpointercapture',()=>{if(run?.down)release();});
$('tap').onclick=e=>{if(e.detail===0&&run&&!run.down){press();release();}};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&run&&!document.querySelector('dialog[open]')){e.preventDefault();if(!e.repeat)press();}if(e.code==='Escape'&&run&&!document.querySelector('dialog[open]')){e.preventDefault();pause();}});
document.addEventListener('keyup',e=>{if(e.code==='Space'&&run){e.preventDefault();release();}});
$('pause').onclick=pause;$('back').onclick=home;$('brand').onclick=home;$('retry').onclick=()=>start('play');$('resultBack').onclick=home;$('next').onclick=()=>{const demo=$('next').dataset.demo==='true';$('result').close();if(demo){start('play');return;}choose((selected+1)%6);};$('result').addEventListener('cancel',e=>{e.preventDefault();home();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&!run.paused)pause();});
$('sound').onclick=()=>{muted=!muted;if(master)master.gain.setValueAtTime(muted?0:.65*volume,audio.currentTime);$('sound').textContent=muted?'♪ 소리 꺼짐':'♫ 소리 켜짐';$('sound').setAttribute('aria-label',muted?'소리 켜기':'소리 끄기');};
$('resume').onclick=pause;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{if(run)feedback('이 브라우저에서는 전체 화면을 지원하지 않아요','miss');}};
function soundPrefs(){try{localStorage.setItem('rp-sound',JSON.stringify({volume,guide:guideSound}));}catch{}}
$('volume').value=Math.round(volume*100);$('volumeLabel').textContent=Math.round(volume*100)+'%';$('guideSound').checked=guideSound;
$('volume').oninput=e=>{volume=Number(e.target.value)/100;$('volumeLabel').textContent=e.target.value+'%';if(master)master.gain.setValueAtTime(muted?0:.65*volume,audio.currentTime);soundPrefs();};$('guideSound').onchange=e=>{guideSound=e.target.checked;soundPrefs();};
$('settings').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();$('offset').value=offset;$('offsetLabel').textContent=offset+' ms';$('offset').oninput=e=>{offset=Number(e.target.value);$('offsetLabel').textContent=offset+' ms';try{localStorage.setItem('rp-offset',offset);}catch{}};
setPractice(false);renderMenu();
