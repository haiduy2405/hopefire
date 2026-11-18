window.HF_DESKTOP=true;
try{const {ipcRenderer}=require('electron');window.HF_WIN={get:()=>ipcRenderer.sendSync('hf-get-mode'),set:m=>ipcRenderer.sendSync('hf-set-mode',m)}}catch(_){}
