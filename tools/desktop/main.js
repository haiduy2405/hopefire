const {app,BrowserWindow,ipcMain,screen}=require('electron');const path=require('path'),fs=require('fs');
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
app.commandLine.appendSwitch('ignore-gpu-blocklist');app.commandLine.appendSwitch('enable-gpu-rasterization');
// window modes: 'fullscreen' (default) | 'borderless' (frameless window covering the screen) | 'maximized' | 'windowed'
const CFG=()=>path.join(app.getPath('userData'),'window.json');
let mode='fullscreen',win=null;
try{const m=JSON.parse(fs.readFileSync(CFG(),'utf8')).mode;if(['fullscreen','borderless','maximized','windowed'].includes(m))mode=m}catch(_){}
function saveMode(){try{fs.writeFileSync(CFG(),JSON.stringify({mode}))}catch(_){}}
function create(){
  const bl=mode==='borderless',old=win;
  const disp=screen.getDisplayNearestPoint(old?old.getBounds():screen.getCursorScreenPoint()).bounds;
  const w=new BrowserWindow({width:bl?disp.width:1600,height:bl?disp.height:900,x:bl?disp.x:undefined,y:bl?disp.y:undefined,minWidth:960,minHeight:600,
    frame:!bl,resizable:!bl,backgroundColor:'#000000',autoHideMenuBar:true,title:'HOPEFIRE',show:false,
    icon:path.join(__dirname,'icon.png'),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:false,backgroundThrottling:false}});
  win=w;w.removeMenu();w.loadFile(path.join(__dirname,'index.html'));
  w.once('ready-to-show',()=>{if(mode==='fullscreen')w.setFullScreen(true);else if(mode==='maximized')w.maximize();w.show();if(old&&!old.isDestroyed())old.destroy()});
  w.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&(i.key==='F11'||(i.alt&&i.key==='Enter'))){setMode(w.isFullScreen()?'windowed':'fullscreen');e.preventDefault()}});
  w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
}
function setMode(m){
  if(!['fullscreen','borderless','maximized','windowed'].includes(m)||!win)return mode;
  const needNew=(m==='borderless')!==(mode==='borderless');mode=m;saveMode();
  if(needNew){create();return mode}
  if(m==='fullscreen')win.setFullScreen(true);
  else{win.setFullScreen(false);if(m==='maximized')win.maximize();else{win.unmaximize();win.setSize(1600,900);win.center()}}
  return mode;
}
ipcMain.on('hf-get-mode',e=>{e.returnValue=mode});
ipcMain.on('hf-set-mode',(e,m)=>{e.returnValue=setMode(m)});
const LOG=()=>path.join(app.getPath('userData'),'crash.log');
function clog(s){try{fs.appendFileSync(LOG(),new Date().toISOString()+' '+s+'\n')}catch(_){}}
app.on('child-process-gone',(e,d)=>clog('child-gone '+JSON.stringify(d)));
app.whenReady().then(()=>{create();if(win)win.webContents.on('render-process-gone',(e,d)=>{clog('render-gone '+JSON.stringify(d));try{win.reload()}catch(_){}});
  setTimeout(()=>{try{clog('gpu(after 8s) '+JSON.stringify(app.getGPUFeatureStatus()))}catch(_){}},8000)});app.on('window-all-closed',()=>app.quit());
