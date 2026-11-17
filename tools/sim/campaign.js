()=>{meta=defMeta();meta.tut={start:1,crate:1,mod:1,syn:1,cell:1,reactor:1,boss:1,done1:1,intro:1,spell:1,site2:1,site3:1,site4:1,site5:1};
const out={milestones:[]};let T=0,runs=0;
function buy(){let b=true;while(b){b=false;const pool=UPG.concat(UPG2.filter(u=>reqMet(u.req))).filter(u=>lv(u.k)<u.max).sort((a,c)=>upCost(a)-upCost(c));const u=pool[0];if(u&&meta.mastery>=upCost(u)){meta.mastery-=upCost(u);meta.up[u.k]=lv(u.k)+1;b=true}}}
function play(ch,night){hide();newRun(ch,false,false,night);let s=0;
  while(!R.over&&s<60*600){
    if(R.gold>=packCost()&&!R.paused){openPack();revealCards(packCost());let bi=0,bs=-1;curCards.forEach((c,i)=>{let sc=c.rl?8:c.sp?(R.spells.find(x=>x.d.id===c.sp.id)?5:R.spells.length<3?4:0)+c.r:c.r*2+(R.mods.find(h=>h.t.id===c.t.id)?3:0);if(sc>bs){bs=sc;bi=i}});pick(bi)}
    update(1/60);s++;if(R.boss&&R.boss.dead&&!R.over){for(let k=0;k<100;k++)update(1/60);if(!R.over)endRun(true)}}
  T+=R.t;runs++;return R.won}
while(runs<400){
  buy();
  if(!meta.story){const c=meta.chapter;if(play(c,false)&&c===5)out.milestones.push(['STORY',runs,Math.round(T/60)]);continue}
  let c=0;for(let i=1;i<=5;i++)if(!meta.night[i]){c=i;break}if(!c)break;
  if(play(c,true))out.milestones.push(['NIGHT'+c,runs,Math.round(T/60)]);
}
out.totalRuns=runs;out.totalMin=Math.round(T/60);out.up=JSON.stringify(meta.up);out.ach=Object.keys(meta.ach).length+'/'+ACH.length;return out}
