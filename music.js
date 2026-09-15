'use strict';
const PocketMusic=(()=>{
 const scales=[[0,2,4,5,7,9,11],[0,2,3,5,7,9,10],[0,2,3,5,7,8,10],[0,2,4,5,7,9,11],[0,2,4,6,7,9,11],[0,2,3,5,7,8,10]];
 const roots=[60,62,57,65,60,59];
 const changes=[[0,5,3,4,0,2,3,4],[0,3,5,4,2,5,3,4],[0,5,2,6,3,5,4,0],[0,4,5,3,2,5,3,4],[0,1,3,4,5,3,1,4],[0,5,3,6,0,2,3,4]];
 const motifs=[[0,2,4,5,4,2,1,2],[0,1,4,6,5,4,2,1],[0,4,7,6,4,2,3,4],[0,3,4,5,7,5,4,2],[0,2,4,6,7,4,3,2],[0,4,6,7,8,7,4,2]];
 const instruments={pocket:['marimba','piano','synth','bell','pluck','synth'],six:['piano','pluck','marimba','piano','bell','synth'],drum:['pluck','marimba','piano','bell','pluck','synth']};
 function note(root,scale,degree){return root+scale[((degree%7)+7)%7]+12*Math.floor(degree/7);}
 function voice(midi,time,length,gain,kind='pluck',pan=0,echo=0){
  const f=hz(midi),g=audio.createGain(),filter=audio.createBiquadFilter(),panner=audio.createStereoPanner();
  length=Math.max(.09,length);filter.type='lowpass';filter.Q.value=.6;
  const cutoff=kind==='bass'?1100:kind==='pad'?2200:kind==='synth'?4200:7200;
  filter.frequency.setValueAtTime(cutoff,time);filter.frequency.exponentialRampToValueAtTime(kind==='bass'?220:kind==='pad'?1100:1800,time+length);
  const attack=kind==='pad'?.10:kind==='synth'?.012:.003;
  g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(gain,time+Math.min(attack,length*.3));
  if(kind==='pad'){g.gain.linearRampToValueAtTime(gain*.65,time+length*.65);g.gain.exponentialRampToValueAtTime(.0001,time+length);}
  else {g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*.23),time+length*.3);g.gain.exponentialRampToValueAtTime(.0001,time+length);}
  filter.connect(g);g.connect(panner);panner.pan.value=pan;panner.connect(master);
  const extra=[];
  if(echo){const delay=audio.createDelay(2),wet=audio.createGain();delay.delayTime.value=echo;wet.gain.value=.19;panner.connect(delay);delay.connect(wet);wet.connect(master);extra.push(delay,wet);}
  const specs=kind==='pad'?[[1,'triangle',-.07],[1,'triangle',.07]]:kind==='bass'?[[1,'sine',0],[2,'triangle',0]]:kind==='synth'?[[1,'sawtooth',-.035],[1,'triangle',.035]]:kind==='bell'?[[1,'sine',0],[2.01,'sine',0],[3.98,'sine',0]]:kind==='marimba'?[[1,'sine',0],[3.99,'sine',0]]:kind==='piano'?[[1,'triangle',0],[2,'sine',0],[3,'sine',0]]:[[1,'triangle',0],[2,'sine',0]];
  let alive=specs.length;
  specs.forEach(([ratio,wave,detune],i)=>{const o=audio.createOscillator(),partial=audio.createGain();o.type=wave;o.frequency.setValueAtTime(f*ratio,time);o.detune.value=detune*100;
   partial.gain.setValueAtTime(i===0?.75:kind==='pad'?.35:kind==='synth'?.23:.18/(i||1),time);
   if(i&&['piano','marimba','bell','pluck'].includes(kind))partial.gain.exponentialRampToValueAtTime(.0001,time+length*(kind==='bell'?.8:.3));
   o.connect(partial);partial.connect(filter);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();partial.disconnect();if(--alive===0){filter.disconnect();g.disconnect();panner.disconnect();extra.forEach(n=>n.disconnect());}};
   o.start(time);o.stop(time+length+echo+.03);
  });
 }
 function taiko(time,rim=false,gain=1){
  tone(rim?960:102,time,rim?.045:.27,(rim?.09:.18)*gain,'sine');tone(rim?1560:167,time,rim?.028:.16,.06*gain,'triangle');tone(rim?2300:235,time,.04,.022*gain,'sine');noise(time,rim?.02:.035,.045*gain,rim?4200:850);
 }
 function percussion(time,kind,velocity=1){
  if(kind==='kick'){const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(135,time);o.frequency.exponentialRampToValueAtTime(44,time+.1);g.gain.setValueAtTime(.34*velocity,time);g.gain.exponentialRampToValueAtTime(.0001,time+.29);o.connect(g);g.connect(master);track(o,g);o.start(time);o.stop(time+.3);noise(time,.012,.025*velocity,2800);}
  else if(kind==='snare'){noise(time,.12,.10*velocity,1700);tone(185,time,.075,.055*velocity,'triangle');noise(time+.012,.055,.045*velocity,3600);}
  else if(kind==='open')noise(time,.16,.032*velocity,6800);
  else if(kind==='hat')noise(time,.032,.04*velocity,7200);
  else if(kind==='shaker')noise(time,.045,.021*velocity,5100);
  else {tone(110,time,.13,.075*velocity,'sine');noise(time,.026,.02*velocity,1400);}
 }
 function tick({tick,time,spb,notes,style=0,mode='pocket',total=68}){
  const beat=tick/4;if(beat<4){if(tick%4===0)tone(tick===12?1175:784,time,.06,.11,'sine');return;}if(beat>=total)return;
  const bar=Math.floor((beat-4)/4),step=tick%16,p=style%6,scale=scales[p],root=roots[p];
  const ending=beat>=total-4,phase=Math.floor(bar/4)%4,quiet=phase===2&&bar%4<2;
  const chord=ending?0:changes[p][Math.floor(bar/2)%8],instrument=instruments[mode][p];
  const energy=phase===0?.72:quiet?.46:phase===3?1:.88;
  const kicks=[[0,8,10],[0,6,10],[0,4,8,12],[0,7,10],[0,6,8,14],[0,4,8,11,14]][p];
  if((mode==='drum'?[0,8]:kicks).includes(step)&&(!quiet||step===0))percussion(time,'kick',energy);
  if([4,12].includes(step)&&!quiet)percussion(time,'snare',energy*.9);
  if(!quiet&&step%2===0)percussion(time,step===14&&phase>0?'open':'hat',(step%4===0?.58:.9)*energy);
  // Small changes in accent and occasional ghost notes give the groove phrasing.
  if(!quiet&&phase>0&&[3,7,11,15].includes(step))percussion(time,'shaker',.5+(step%3)*.15);
  if(!quiet&&bar%4===3&&[13,14,15].includes(step)){percussion(time,'tom',.4+(step-13)*.16);if(step===15)percussion(time,'snare',.38);}
  if(step===0&&bar%4===0&&bar>0)noise(time,.38,.028,7500);
  if(!quiet&&phase===3&&step===11)percussion(time,'snare',.22);
  const bassSteps=p===1||p===4?[0,6,8,14]:[0,4,8,11,14];
  if(bassSteps.includes(step)&&(!quiet||step===0)){
   const degree=chord+(step===11?4:step===14?6:0);voice(note(root-24,scale,degree),time,spb*(step===11?.38:.8),.17*energy,'bass');
  }
  // Diatonic seventh/ninth voicings keep bass, chords and melody in the same key.
  if(step===0){for(const [i,d] of [0,2,4,6].entries())voice(note(root,scale,chord+d)-12,time,spb*3.6,.031*energy,'pad',(i-1.5)*.23);}
  if([2,10].includes(step)&&!quiet){for(const [i,d] of [2,4,8].entries())voice(note(root,scale,chord+d),time+i*.006,spb*.75,.024*energy,'piano',(i-1)*.3);}
  if(phase>0&&step%2===1&&!ending){const d=[0,4,2,6,4,8,6,2][Math.floor(step/2)];voice(note(root+12,scale,chord+d),time,spb*.28,.022*energy,'pluck',step%4===1?-.55:.55);}
  const targets=notes.filter(n=>Math.abs(n.beat-beat)<.001),phrase=motifs[p];
  for(const [i,n] of targets.entries()){
   // The foreground onset always stays exactly on the playable note's timestamp.
   const degree=mode==='six'?[0,1,2,3,4,7][n.lane]:phrase[(Math.floor((beat-4)*2)+Math.floor(bar/4)*2)%8];
   const pitch=note(root+12,scale,chord+degree+(phase===3&&bar%2===1?7:0));
   if(mode==='drum')taiko(time,n.lane===1,.55/Math.sqrt(targets.length));
   if(mode!=='drum'||i===0)voice(pitch,time,n.hold?n.hold*spb:spb*(instrument==='bell'?1.25:.8),(mode==='drum'?.085:.125)/Math.sqrt(targets.length),instrument,mode==='six'?(n.lane-2.5)*.12:0,targets.length===1&&step%4===0?spb*.75:0);
  }
  if(!targets.length&&[6,14].includes(step)&&!quiet&&!ending)voice(note(root+12,scale,chord+phrase[(bar+step/2)%8]),time,spb*.6,.047,instrument,step===6?-.35:.35,spb*.75);
  if(mode==='pocket'&&guideSound&&notes.some(n=>n.hold&&Math.abs(n.beat+n.hold-beat)<.001))voice(note(root+24,scale,chord+4),time,.2,.07,'bell');
  if(ending&&step===0)for(const [i,d] of [0,2,4,7].entries())voice(note(root,scale,d),time+i*.012,spb*3.8,.037,'piano',(i-1.5)*.25);
 }
 return {tick,taiko};
})();

