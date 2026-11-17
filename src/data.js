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
  boss:{hp:1500,spd:9,dmg:15,r:36,g:80,core:40,cell:1,c:'#341a30'}
};
const SITES=['Crash Site','Research Wreck','Mining Hulk','War Graveyard','The Origin'];
const SITE_BG=[['#141712','#1b2019'],['#10161b','#172029'],['#18140d','#221c12'],['#151014','#1f171d'],['#170b0d','#221013']];
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
