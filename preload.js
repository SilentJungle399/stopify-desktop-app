const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	playerState: (data) => ipcRenderer.send("playerState", data),
});
