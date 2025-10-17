const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const externalDisplay = displays.find((d) => d.id !== primaryDisplay.id);

  // Default window options
  const windowOptions = {
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (externalDisplay) {
    // Position window on external display and go fullscreen for TV-like experience
    windowOptions.x = externalDisplay.bounds.x + 50;
    windowOptions.y = externalDisplay.bounds.y + 50;
  }

  const mainWindow = new BrowserWindow(windowOptions);

  if (externalDisplay) {
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Simple dev auto-reload: watch renderer files and reload on change
  if (!app.isPackaged) {
    const fs = require('node:fs');
    const watchTargets = [
      path.join(__dirname, 'index.html'),
      path.join(__dirname, 'index.css'),
      path.join(__dirname, 'renderer.js'),
      path.join(__dirname, 'config.js'),
      path.join(__dirname, 'data'),
      path.join(__dirname, 'assets'),
      path.join(__dirname, 'fonts'),
    ];
    const reload = () => { if (!mainWindow.isDestroyed()) mainWindow.webContents.reloadIgnoringCache(); };
    for (const target of watchTargets) {
      if (fs.existsSync(target)) {
        fs.watch(target, { recursive: true }, () => reload());
      }
    }
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
