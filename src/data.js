"use strict";
// ===== DATA =====
const K=0.72; // 3/4 view vertical squash
const RAR=[{n:'COMMON',c:'#9aa4b2',m:1},{n:'RARE',c:'#4da3ff',m:1.8},{n:'EPIC',c:'#b366ff',m:3.2},{n:'LEGENDARY',c:'#ffb020',m:6}];
const TYPES={Thermal:{c:'#ff7a3d',b4:'Burn 40%/s'},Cryo:{c:'#5cd0ff',b4:'Slow 40%'},Arc:{c:'#ffe14d',b4:'Chain to 2'},Nano:{c:'#7dffb0',b4:'Hope regen 1.5%/s'}};
const CLS={
  lance:{g:'◆',dmg:16,rate:1.1,range:125,d:'Short beam, splash'},
  rail:{g:'➶',dmg:8,rate:1.7,range:310,d:'Long range, fast'},
  mortar:{g:'✹',dmg:13,rate:0.7,range:250,aoe:62,d:'Lobbed shell, area'}
};
const MODS=[
  ['Flame Lance','Thermal','lance'],['Heat Rail','Thermal','rail'],['Magma Mortar','Thermal','mortar'],
  ['Frost Lance','Cryo','lance'],['Cryo Rail','Cryo','rail'],['Hail Mortar','Cryo','mortar'],
  ['Arc Lance','Arc','lance'],['Volt Rail','Arc','rail'],['Storm Mortar','Arc','mortar'],
  ['Nano Lance','Nano','lance'],['Swarm Rail','Nano','rail'],['Mender Mortar','Nano','mortar']
].map(([n,ty,c],i)=>Object.assign({id:i,n,ty,c},CLS[c]));
const EK={
  crawler:{hp:22,spd:46,dmg:4,r:10,g:1,core:1,cell:.05,c:'#4b3a5c'},
  skitter:{hp:13,spd:92,dmg:3,r:8,g:1,core:1,cell:.04,c:'#5d4b2c'},
  brute:{hp:110,spd:28,dmg:12,r:16,g:5,core:3,cell:.3,c:'#5c2f3c'},
  carrier:{hp:110,spd:36,dmg:0,r:15,g:6,core:3,cell:.5,c:'#8a6a2a'},
  boss:{hp:1500,spd:9,dmg:15,r:36,g:80,core:40,cell:1,c:'#341a30'}
};
const SITES=['Crash Site','Research Wreck','Mining Hulk','War Graveyard','The Origin'];
const SITE_BG=[['#160f0b','#21170f'],['#10161b','#172029'],['#18140d','#221c12'],['#151014','#1f171d'],['#170b0d','#221013']];
const MAXCH=SITES.length, WAVE_LEN=20, BOSS_WAVE=10, BASE_RING=230;
const REACT=[{n:'LOW',ring:.85,dmg:.85,loot:.75,spawn:.8,c:'#5cd0ff'},{n:'NORMAL',ring:1,dmg:1,loot:1,spawn:1,c:'#7dffb0'},{n:'OVERDRIVE',ring:1.25,dmg:1.35,loot:1.6,spawn:1.35,c:'#ff5a3d'}];
const UPG=[
  {k:'dmg',n:'Module Damage',d:l=>`+${15*l}% damage`,base:10,g:1.45,max:25},
  {k:'hp',n:'Hope Capacity',d:l=>`+${25*l}% max Hope`,base:8,g:1.4,max:25},
  {k:'bolt',n:'Heat Ray',d:l=>`+${50*l}% cannon dmg`,base:10,g:1.45,max:15},
  {k:'gold',n:'Scrap Salvage',d:l=>`+${15*l}% scrap`,base:12,g:1.5,max:20},
  {k:'start',n:'Starting Scrap',d:l=>`+${8*l} scrap`,base:15,g:1.5,max:10},
  {k:'aspd',n:'Fire Rate',d:l=>`+${8*l}% fire rate`,base:20,g:1.55,max:12},
  {k:'luck',n:'Crate Luck',d:l=>`+${12*l}% rare odds`,base:25,g:1.6,max:10},
  {k:'regen',n:'Hope Efficiency',d:l=>`-${6*l}% Hope drain`,base:18,g:1.55,max:10},
  {k:'disc',n:'Crate Discount',d:l=>`-${6*l}% crate price`,base:40,g:1.7,max:5},
  {k:'slots',n:'Module Slots',d:l=>`${4+l} slots`,base:60,g:2.3,max:4}
];
// ===== v0.4 CONTENT =====
CLS.drone={g:'✈',dmg:6,rate:2.2,range:0,d:'Drone: hunts anywhere in the ring'};
[['Ember Drone','Thermal'],['Frost Drone','Cryo'],['Spark Drone','Arc'],['Nano Drone','Nano']]
  .forEach(([n,ty])=>MODS.push(Object.assign({id:MODS.length,n,ty,c:'drone'},CLS.drone)));
Object.assign(EK,{
  spitter:{hp:30,spd:40,dmg:5,r:10,g:2,core:2,cell:.08,c:'#3f5a3a'},   // keeps distance, spits acid
  bloater:{hp:60,spd:30,dmg:16,r:14,g:2,core:2,cell:.15,c:'#6a5a2a'},  // explodes on the hull; shoot it to blast its friends
  wisp:{hp:16,spd:72,dmg:4,r:7,g:1,core:1,cell:.03,c:'#4a4a7a'},       // flies & weaves; mortars deal half damage
  phantom:{hp:45,spd:58,dmg:8,r:11,g:2,core:2,cell:.08,c:'#2c2c40'},   // cloaked until it gets close
  splitter:{hp:70,spd:36,dmg:7,r:13,g:2,core:2,cell:.1,c:'#5a2a4a'}    // splits into 2 skitters
});
const BOSSES=[
  {n:'THE DEVOURER',c:'#341a30',hp:1.15,spd:1,d:'It swallowed the navigation core.'},
  {n:'BROOD MOTHER',c:'#24402f',hp:1.3,spd:0.9,d:'Births crawlers as it approaches.'},
  {n:'THE CRUSHER',c:'#4a3a24',hp:1.25,spd:1,d:'Armored. Only vulnerable after a charge.'},
  {n:'PHANTOM WARLORD',c:'#22223a',hp:1.2,spd:1.2,d:'Blinks through the dark with its guard.'},
  {n:'THE ORIGIN',c:'#3a0f1a',hp:1.55,spd:0.8,d:'The source of it all. It feeds on your light.'}
];
// [kind, weight, minThreat, minSite]
const SPAWN_TABLE=[['crawler',50,1,1],['skitter',25,3,1],['brute',10,5,1],['spitter',14,2,2],['bloater',10,2,3],['wisp',16,4,3],['phantom',12,2,4],['splitter',12,2,5]];
// per-site difficulty (creature HP and damage multipliers), tuned by simulation
const CH_HP=[1.05,4.8,13.2,45,67],CH_DMG=[1,1.6,2.5,3.6,4.4];
const WARP_WAVE=5; // after clearing a site you may start there at this threat
const SIG=[null,'crawler','spitter','bloater','phantom','splitter']; // signature creature per site
UPG.push({k:'auto',n:'Spell Autocast',d:l=>l?'Spells cast themselves':'Spells cast themselves',base:150,g:1,max:1});
// ===== v0.6 CONTENT =====
// Each type now plays differently (not just colour): applied to every module/drone of that type.
const TYPE_MOD={
  Thermal:{dmg:1.3,rate:0.8,d:'Heavy hits: +30% damage, fires slower'},
  Cryo:{dmg:0.85,rate:1.25,d:'Rapid fire, 12% chance to chill'},
  Arc:{dmg:1,rate:1,d:'Every hit arcs to 1 more creature (35%)'},
  Nano:{dmg:0.9,rate:1,d:'Every hit restores a little Hope'}
};
// Nightmare: harder replay of a cleared site with better rewards
const NM={hp:[10.5,6,5.3,3.4,4],dmg:[2.6,2,1.7,1.35,1.4],core:2.5,scrap:1.3,bossHp:1.4,luck:0.6}; // per-site multipliers (story end makes early sites trivial)
// Advanced repairs (tier 2) — unlocked by escaping and by clearing Nightmare sites
const UPG2=[
  {k:'crit',n:'Critical Strikes',d:l=>`${5*l}% crit chance (×2.5 dmg)`,base:400,g:1.55,max:10,req:'story'},
  {k:'second',n:'Second Wind',d:()=>'Once per run: revive at 30% Hope',base:2500,g:1,max:1,req:'story'},
  {k:'core2',n:'Core Refinery',d:l=>`+${10*l}% Xeno-cores`,base:800,g:1.45,max:20,req:'n1'},
  {k:'range',n:'Long Barrels',d:l=>`+${6*l}% module range`,base:900,g:1.6,max:10,req:'n1'},
  {k:'crate5',n:'Deep Salvage',d:()=>'Crates show +1 card',base:6000,g:1,max:1,req:'n2'},
  {k:'kit',n:'Field Kit',d:l=>`Start with ${l} random module${l===1?'':'s'}`,base:2500,g:2.2,max:3,req:'n2'},
  {k:'cap',n:'Capacitors',d:l=>`-${6*l}% spell cooldown`,base:3000,g:1.6,max:8,req:'n3'},
  {k:'relic',n:'Relic Bay',d:l=>`${3+l} relic slots`,base:15000,g:1,max:1,req:'n3'},
  {k:'bounty',n:'Bounty Hunter',d:l=>`+${25*l}% damage to bosses`,base:6000,g:1.55,max:8,req:'n4'},
  {k:'cellx',n:'Cell Recycler',d:l=>`+${20*l}% energy cells`,base:6000,g:1.55,max:10,req:'n4'},
  {k:'oc',n:'Overclock ∞',d:l=>`+${4*l}% all damage`,base:1500,g:1.17,max:999,req:'story'}
];
const REQ_TXT={story:'Escape the planet',n1:'Clear ☠ Crash Site',n2:'Clear ☠ Research Wreck',n3:'Clear ☠ Mining Hulk',n4:'Clear ☠ War Graveyard',n5:'Clear ☠ The Origin'};
const reqMet=r=>r==='story'?!!meta.story:!!(meta.night&&meta.night[+r.slice(1)]);
