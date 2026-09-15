const fs=require('fs');
fs.appendFileSync('dokkaebi.css',`\n.dk-stages{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0 0 20px}.dk-stage{display:flex;flex-direction:column;align-items:flex-start;gap:9px;text-align:left;padding:19px;border:1px solid #627887;border-radius:14px;background:#243547;color:#dce7e8;cursor:pointer}.dk-stage small{font-weight:800;letter-spacing:.08em;color:#dfbd80}.dk-stage strong{font-size:19px}.dk-stage span{font-size:12px;opacity:.8}.dk-stage.selected{background:#ead09e;border-color:#ead09e;color:#27394a;box-shadow:0 4px 0 #927349}.dk-stage.selected small{color:#705125}.dk-stage:focus-visible{outline:3px solid #fff;outline-offset:3px}@media(max-width:600px){.dk-stages{gap:7px}.dk-stage{padding:12px 8px;gap:8px}.dk-stage strong{font-size:14px;line-height:1.45}.dk-stage small,.dk-stage span{font-size:10px}}\n`);
let s=fs.readFileSync('dokkaebi.js','utf8').replace('후반에는 밀가루가 박자 힌트를 가려요.','보통·어려움에서는 밀가루가 힌트를 가려요.');
s=s.replace("function selectStage(i)","if(record&&!stageRecords[1])stageRecords[1]=record;\n function selectStage(i)");
fs.writeFileSync('dokkaebi.js',s);
let t=fs.readFileSync('test-dokkaebi.cjs','utf8').replace("ev(fs.readFileSync('dokkaebi.js','utf8'));","ev(fs.readFileSync('dokkaebi-art.js','utf8'));ev(fs.readFileSync('dokkaebi.js','utf8'));");
const a=t.indexOf(' context.window.Dokkaebi.open();await'),z=t.indexOf(' const before=',a);
t=t.slice(0,a)+` for(let stage=0;stage<3;stage++){
  const ch=ev('DokkaebiChart.build(null,'+stage+')'),spb=60/ch.config.bpm;
  for(const n of ch.notes)for(const bait of ch.baits.filter(b=>!b.call))assert(Math.abs(n.beat-bait.beat)*spb>.36);
  for(const side of [0,1])for(const top of [260,269]){const p=ev('DokkaebiArt.pose('+side+',1,'+top+')');assert.equal(p.faceY,top);assert(Math.abs(p.x-450)<37);}
  context.window.Dokkaebi.open();$('dkStage'+stage).onclick();await $('dkStart').onclick();const start=audio.currentTime+.35;
  for(const n of ch.notes)hit(start+n.beat*spb);tick(start+(ch.total+2)*spb);
  assert($('dkSummary').textContent.includes('100%'));assert($('dkResultTitle').textContent.includes(' · S · '));assert.equal(JSON.parse(saved['rp-dokkaebi-stages'])[stage].accuracy,100);assert.equal(timers.size,0);
 }
 context.window.Dokkaebi.open();$('dkStage1').onclick();
`+t.slice(z);
t=t.replaceAll("saved['rp-dokkaebi-best']","saved['rp-dokkaebi-stages']").replace('PASS: 31 response notes;','PASS: 3 difficulty charts and independent records; exact rice-mallet contact;');
fs.writeFileSync('test-dokkaebi.cjs',t);
