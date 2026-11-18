"use strict";
// ===== RELICS =====
// Passive in-run items. Rare crate cards (after the first crate). Max 3 per run, no duplicates.
const RELICS=[
  {id:'lens',n:"Scavenger's Lens",g:'🔍',d:'+40% scrap from kills'},
  {id:'battery',n:'Spare Battery',g:'🔋',d:'+30% max Hope'},
  {id:'echo',n:'Echo Scanner',g:'📡',d:'Crates show 4 cards'},
  {id:'glass',n:'Glass Cannon',g:'💥',d:'+50% module damage, Hope drains 40% faster'},
  {id:'dampener',n:'Dampener Coil',g:'🌀',d:'Detection ring 15% smaller'},
  {id:'magnet',n:'Core Magnet',g:'🧲',d:'+35% Xeno-cores'},
  {id:'trigger',n:'Hair Trigger',g:'🎯',d:'Heat ray fires twice as fast'},
  {id:'thorns',n:'Static Hull',g:'⚡',d:'Creatures that strike the ship get shocked'}
];
const MAX_RELICS=3,RELIC_CHANCE=0.07;
const maxRelics=()=>MAX_RELICS+lv('relic');
function canRollRelic(){return R.relics.length<maxRelics()&&RELICS.some(x=>!R.relics.includes(x.id))}
function rollRelic(taken){const pool=RELICS.filter(x=>!R.relics.includes(x.id)&&!taken.includes(x.id));return pool.length?pool[Math.random()*pool.length|0]:null}
function addRelic(cd){
  const rl=cd.rl;if(R.relics.includes(rl.id))return;R.relics.push(rl.id);
  if(rl.id==='battery'){R.maxHope*=1.3;R.hope*=1.3}
  R.banner={s:'RELIC: '+rl.n.toUpperCase(),t:1.4};sfx('rare');renderChips();
  if(R.relics.length>=3)ach('relic3');
}
