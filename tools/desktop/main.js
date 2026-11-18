const {app,BrowserWindow}=require('electron');const path=require('path');
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
function create(){
  const w=new BrowserWindow({width:1600,height:900,minWidth:960,minHeight:600,backgroundColor:'#000000',autoHideMenuBar:true,title:'HOPEFIRE',
    icon:path.join(__dirname,'icon.png'),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:false,backgroundThrottling:false}});
  w.removeMenu();w.loadFile(path.join(__dirname,'index.html'));
  w.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&(i.key==='F11'||(i.alt&&i.key==='Enter'))){w.setFullScreen(!w.isFullScreen());e.preventDefault()}});
  w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
}
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
