const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements={},events={},saved={},timers=new Set();let frame=null,draws=0,sounds=0;
const ctx2=new Proxy({},{get:(o,k)=>o[k]??((...args)=>{args.forEach(a=>{if(typeof a==='number')assert(Number.isFinite(a));});draws++;}),set:(o,k,v)=>(o[k]=v,true)});
function element(){return {dataset:{},hidden:false,style:{},classList:{add(){},remove(){},toggle(){}},getContext:()=>ctx2,append(){},after(){},setAttribute(){},showModal(){this.open=true;},close(){this.open=false;},addEventListener(t,f){this[t]=f;},setPointerCapture(){}};}
const $=id=>elements[id]??=element(),audio={currentTime:0};const context=vm.createContext({console,document:{createElement:element,querySelector:s=>s==='dialog[open]'?null:element(),body:element(),addEventListener:(k,f)=>events[k]=f},window:{scrollTo(){},addEventListener(){},RhythmModes:{switchMode(){}}},localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},$,audio,offset:0,nodes:new Set(),initAudio:async()=>{},tone(){sounds++;},noise(){sounds++;},hz:n=>440*2**((n-69)/12),setInterval:f=>(timers.add(f),f),clearInterval:f=>timers.delete(f),requestAnimationFrame:f=>(frame=f,1),cancelAnimationFrame:()=>frame=null});
const ev=s=>vm.runInContext(s,context);ev(fs.readFileSync('dokkaebi-art.js','utf8'));ev(fs.readFileSync('dokkaebi.js','utf8'));
function tick(t){audio.currentTime=t;for(const f of timers)f();const next=frame;frame=null;if(next)next();}
function hit(t){tick(t);$('dkTap').onpointerdown({pointerType:'mouse',button:0,pointerId:1,preventDefault(){}});$('dkTap').onpointerup();}
(async()=>{
 const chart=ev('DokkaebiChart.build()');assert.equal(chart.notes.length,31);assert.equal(chart.baits.filter(n=>!n.call).length,2);for(const n of chart.notes){assert(chart.calls.some(c=>c.beat===n.beat-4));for(const b of chart.baits.filter(b=>!b.call))assert(Math.abs(n.beat-b.beat)*.6>.36);}
 for(let stage=0;stage<3;stage++){
  const ch=ev('DokkaebiChart.build(null,'+stage+')'),spb=60/ch.config.bpm;
  for(const n of ch.notes)for(const bait of ch.baits.filter(b=>!b.call))assert(Math.abs(n.beat-bait.beat)*spb>.36);
  for(const side of [0,1])for(const top of [260,269]){const p=ev('DokkaebiArt.pose('+side+',1,'+top+')');assert.equal(p.faceY,top);assert(Math.abs(p.x-450)<37);}
  context.window.Dokkaebi.open();$('dkStage'+stage).onclick();await $('dkStart').onclick();const start=audio.currentTime+.35;
  for(const n of ch.notes)hit(start+n.beat*spb);tick(start+(ch.total+2)*spb);
  assert($('dkSummary').textContent.includes('100%'));assert($('dkResultTitle').textContent.includes(' · S · '));assert.equal(JSON.parse(saved['rp-dokkaebi-stages'])[stage].accuracy,100);assert.equal(timers.size,0);
 }
 context.window.Dokkaebi.open();$('dkStage1').onclick();
 const before=saved['rp-dokkaebi-stages'];context.window.Dokkaebi.open();await $('dkDemo').onclick();const demoStart=audio.currentTime+.35;tick(demoStart+31*.6);assert($('dkResultTitle').textContent.includes('직접'));assert.equal(saved['rp-dokkaebi-stages'],before);
 context.window.Dokkaebi.open();await $('dkStart').onclick();const missStart=audio.currentTime+.35;tick(missStart+70*.6);assert($('dkSummary').textContent.includes('0%'));
 context.window.Dokkaebi.open();await $('dkStart').onclick();const baitStart=audio.currentTime+.35;hit(baitStart+chart.baits.find(n=>!n.call).beat*.6);assert($('dkFeedback').textContent.includes('에취'));
 $('dkPause').onclick();assert.equal($('dkPauseCover').hidden,false);const held=$('dkScore').textContent;tick(audio.currentTime+5);assert.equal($('dkScore').textContent,held);$('dkResume').onclick();assert.equal($('dkPauseCover').hidden,true);context.window.Dokkaebi.stop();assert.equal(timers.size,0);assert.equal(elements.dokkaebiMode?.hidden??true,true);
 assert(sounds>10);assert(draws>100);console.log('PASS: 3 difficulty charts and independent records; exact rice-mallet contact; 4-beat echo; bait separation; perfect/miss/demo; pause; mode cleanup; '+draws+' finite drawing operations.');
})().catch(e=>{console.error(e);process.exitCode=1;});

