const { app, BrowserWindow } = require('electron');

//Webcam issues on mac! ==> use npm run electron_mac
//https://github.com/electron/electron/issues/14801

function createWindow () {
    let win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
        }
    });

    win.webContents.openDevTools();
    win.loadFile('./src/devoxx/site/index.html');
}

app.on('ready', createWindow);
