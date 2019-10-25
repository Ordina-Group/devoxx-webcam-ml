const Loader = require("./coco/web-loader").Loader;

const { app, BrowserWindow } = require('electron');

// https://github.com/electron/electron/issues/14801

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true
        }
    });

    console.log(Loader);

    win.webContents.openDevTools();
    // and load the index.html of the app.
    win.loadFile('./src/devoxx/site/index.html');
}

app.on('ready', createWindow);
