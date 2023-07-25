const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const DiscordRPC = require("discord-rpc");
const path = require("path");

const clientId = "900755240532471888";
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: "ipc" });

rpc.login({ clientId });
app.rpc = true;

rpc.on("ready", () => {
	console.log("RPC Connected");
});

const menu = Menu.buildFromTemplate([
	{
		label: "App",
		submenu: [
			{
				label: "Open dev tools",
				click() {
					BrowserWindow.getFocusedWindow().webContents.openDevTools();
				},
			},
			{
				label: "Restart",
				click() {
					app.relaunch();
					app.exit();
				},
			},
			{
				label: "Exit",
				click() {
					app.quit();
				},
			},
		],
	},
	{
		label: "Discord",
		submenu: [
			{
				label: "Connect / Disconnect",
				click() {
					app.rpc = !app.rpc;
				},
			},
		],
	},
]);

const createWindow = async () => {
	const win = new BrowserWindow({
		title: "Stopify",
		icon: "stopify.png",
		minWidth: 1200,
		minHeight: 800,
		webPreferences: {
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.setMenu(menu);
	await win.loadURL(
		process.env.NODE_ENV === "development"
			? "http://localhost:3000"
			: "https://stopify.silentjungle.me/"
	);

	win.webContents.setWindowOpenHandler(({ url }) => {
		require("electron").shell.openExternal(url);
		return { action: "deny" };
	});
};

ipcMain.on("playerState", (event, data) => {
	if (rpc.user && data.song && data.playing && data.knownUsers && app.rpc) {
		rpc.setActivity({
			details: data.song.title + " - " + data.song.artist,
			largeImageKey: data.song.thumbnail,
			largeImageText: data.song.title,
			smallImageKey: "https://i.imgur.com/l1Y1XHM_d.webp?maxwidth=760&fidelity=grand",
			smallImageText: "Playing on stopify",
			startTimestamp: Date.now() - data.currentTime * 1000,
			buttons: [
				{
					label: `Listen along (${data.knownUsers.length} User(s))`,
					url: "https://stopify.silentjungle.me/",
				},
			],
		});
	} else {
		rpc.clearActivity();
	}
});

app.on("window-all-closed", () => {
	rpc.clearActivity();
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(() => {
	createWindow();
});
