import {
  app,
  BrowserWindow,
  globalShortcut,
  shell,
  nativeImage,
} from 'electron';
import { join } from 'path';
import log from 'electron-log';
import { createTray, destroyTray } from './tray';
import { setupAutoUpdater } from './updater';
import { registerAllIpcHandlers } from './ipc/index';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

log.initialize();
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Application starting...');

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log.warn('Another instance is already running. Quitting...');
  app.quit();
} else {
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();
    registerAllIpcHandlers(mainWindow!);
    createTray(mainWindow!);
    setupAutoUpdater(mainWindow!);
    registerGlobalShortcuts();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      } else {
        mainWindow?.show();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    if (mainWindow) {
      mainWindow.removeAllListeners('close');
      mainWindow.close();
    }
    destroyTray();
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 360,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });

  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 480px;
          height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          border-radius: 16px;
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #f8fafc;
          -webkit-app-region: drag;
        }
        .logo-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 32px;
        }
        .loader {
          width: 200px;
          height: 3px;
          background: #1e293b;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .loader::after {
          content: '';
          position: absolute;
          left: -60%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent);
          border-radius: 2px;
          animation: loading 1.4s ease-in-out infinite;
        }
        @keyframes loading {
          0% { left: -60%; }
          100% { left: 100%; }
        }
        .version {
          position: absolute;
          bottom: 16px;
          font-size: 11px;
          color: #475569;
        }
      </style>
    </head>
    <body>
      <img src="data:image/png;base64,${require('fs').readFileSync(require('path').join(__dirname, '../../build/icon.png')).toString('base64')}" class="logo-img" />
      <h1>URDIGIX</h1>
      <p class="subtitle">Solutions ERP</p>
      <div class="loader"></div>
      <span class="version">v${app.getVersion()}</span>
    </body>
    </html>
  `;

  splashWindow.loadURL(
    `data:text/html;charset=UTF-8,${encodeURIComponent(splashHtml)}`
  );
}

function createMainWindow(): void {
  const preloadPath = join(__dirname, '../preload/index.js');
  const iconPath = join(__dirname, '../../build/icon.png');

  let icon: Electron.NativeImage | undefined;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    log.warn('App icon not found at:', iconPath);
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    frame: true,
    backgroundColor: '#0f172a',
    icon,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#94a3b8',
      height: 40,
    },
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      spellcheck: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      setTimeout(() => {
        splashWindow?.close();
        splashWindow = null;
        mainWindow?.show();
        mainWindow?.focus();
      }, 1500);
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      log.info('Window hidden to tray');
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    log.error(`Failed to load: ${errorCode} - ${errorDescription}`);
  });

  if (isDev) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173');
  } else {
    const indexPath = join(__dirname, '../renderer/index.html');
    mainWindow.loadFile(indexPath);
  }
}

function registerGlobalShortcuts(): void {
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow && isDev) {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

declare module 'electron' {
  interface App {
    isQuitting?: boolean;
  }
}

app.isQuitting = false;

app.on('before-quit', () => {
  app.isQuitting = true;
});

export { mainWindow };
