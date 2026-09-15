'use strict';
// All musical events use the same AudioContext clock and quarter-beat grid as charts.
const PocketMusic=(()=>{
 const roots=[60,62,57,65,60,59];
 const progressions=[[0,5,9,7],[0,9,5,7],[0,5,3,7],[0,7,9,5],[0,3,5,7],[0,5,7,0]];
 const melodies=[[0,4,7,9,7,4,2,7],[0,3,7,10,7,5,3,2],[0,7,12,10,7,3,5,7],[0,5,7,9,12,9,7,4],[0,3,7,10,12,7,5,3],[0,7,10,12,14,12,7,5]];
 function voice(midi,time,length,gain,kind='pluck'){
  const o=audio.createOscillator(),filter=audio.createBiquadFilter(),g=audio.createGain();
  o.type=kind==='pad'?'triangle':kind==='bass'?'triangle':'sine';o.frequency.setValueAtTime(hz(midi),time);
  filter.type='lowpass';filter.frequency.setValueAtTime(kind==='bass'?650:kind==='pad'?1700:5200,time);
  filter.frequency.exponentialRampToValueAtTime(kind==='bass'?180:850,time+length);
  g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(gain,time+(kind==='pad'?.06:.006));g.gain.exponentialRampToValueAtTime(.0001,time+length);
  o.connect(filter);filter.connect(g);g.connect(master);nodes.add(o);
  o.onended=()=>{nodes.delete(o);o.disconnect();filter.disconnect();g.disconnect();};o.start(time);o.stop(time+length+.02);
 }
 function taiko(time,rim=false,gain=1){
  // Tuned body plus a short noisy attack distinguishes don from ka.
  tone(rim?940:112,time,rim?.065:.24,(rim?.095:.16)*gain,'sine');
  tone(rim?1430:173,time,rim?.035:.12,.045*gain,'triangle');
  noise(time,rim?.022:.035,.055*gain,rim?3500:700);
 }
 function tick({tick,time,spb,notes,style=0,mode='pocket',total=68}){
  const beat=tick/4;
  if(beat<4){if(tick%4===0)tone(tick===12?1175:784,time,.075,.13,'sine');return;}
  if(beat>=total)return;
  const bar=Math.floor((beat-4)/4),step=tick%16,p=style%6;
  const root=roots[p],chord=progressions[p][Math.floor(bar/2)%4];
  const phase=Math.floor(bar/4)%4,breakdown=phase===2&&bar%4<2,ending=beat>=total-4;
  const minor=[1,2,4,5].includes(p),third=minor?3:4;
  const kicks=mode==='drum'?[0,8]:[[0,8],[0,6,8],[0,4,8,12],[0,7,8,14],[0,6,10],[0,4,8,14]][p];
  if(kicks.includes(step)&&(!breakdown||step===0))drum(time,'kick');
  if([4,12].includes(step)&&!breakdown)drum(time,'snare');
  if(step%(phase===3?1:2)===0&&!breakdown)noise(time,step===14?.085:.025,step%4===2?.045:.022,6500);
  if(bar%4===3&&step>=14&&!ending){taiko(time,step===15,.35);}
  if(step===0&&bar%4===0)noise(time,.32,.035,7500);
  if(step%4===0&&(!breakdown||step%8===0))voice(root-24+chord+(step===12?7:0),time,spb*.78,.14,'bass');
  if(step===0||(!breakdown&&step===8))for(const n of [0,third,7])voice(root+chord+n,time,spb*1.8,.022,'pad');
  // Quiet countermelody leaves the foreground free for the chart's playable notes.
  if(step%4===2&&!breakdown&&!ending){const m=melodies[p][(Math.floor(step/2)+bar)%8];voice(root+12+chord+m,time,spb*.42,.027);}
  const targets=notes.filter(n=>Math.abs(n.beat-beat)<.001);
  for(const [i,n] of targets.entries()){
   if(mode==='drum'){
    taiko(time,n.lane===1,.65/Math.sqrt(targets.length));
    if(i===0)voice(root+12+chord+melodies[p][Math.floor((beat-4)*2)%8],time,spb*.4,.055);
   }else{
    const pitch=mode==='six'?[0,2,third,5,7,12][n.lane]:melodies[p][Math.floor((beat-4)*2)%8];
    voice(root+12+chord+pitch,time,n.hold?n.hold*spb:spb*.46,.11/Math.sqrt(targets.length));
    voice(root+24+chord+pitch,time,.10,.016/Math.sqrt(targets.length));
   }
  }
  if(mode==='pocket'&&guideSound&&notes.some(n=>n.hold&&Math.abs(n.beat+n.hold-beat)<.001))voice(root+24,time,.12,.085);
  if(ending&&step===0)for(const n of [0,third,7,12])voice(root+n,time,spb*3,.026,'pad');
 }
 return {tick,taiko};
})();
