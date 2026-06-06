import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import { join } from 'path';
import log from 'electron-log';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow): void {
  const iconPath = join(__dirname, '../../build/icon.ico');
  let trayIcon: Electron.NativeImage;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = createFallbackIcon();
    }
  } catch {
    log.warn('Tray icon not found, using fallback');
    trayIcon = createFallbackIcon();
  }

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('URDIGIX Solutions ERP');

  const contextMenu = buildContextMenu(mainWindow);
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  log.info('System tray created');
}

function buildContextMenu(mainWindow: BrowserWindow): Menu {
  return Menu.buildFromTemplate([
    {
      label: 'Show URDIGIX ERP',
      type: 'normal',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Dashboard',
      type: 'normal',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/dashboard');
      },
    },
    {
      label: 'Projects',
      type: 'normal',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/projects');
      },
    },
    {
      label: 'Tasks',
      type: 'normal',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('navigate', '/tasks');
      },
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      type: 'normal',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('check-updates-from-tray');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
}

export function setTrayBadge(count: number): void {
  if (!tray) return;

  if (count > 0) {
    tray.setToolTip(`URDIGIX Solutions ERP - ${count} notification${count > 1 ? 's' : ''}`);
  } else {
    tray.setToolTip('URDIGIX Solutions ERP');
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
    log.info('System tray destroyed');
  }
}

function createFallbackIcon(): Electron.NativeImage {
  const size = 32;
  const canvas = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (dist <= radius) {
        canvas[idx] = 59;     // R
        canvas[idx + 1] = 130; // G
        canvas[idx + 2] = 246; // B
        canvas[idx + 3] = 255; // A
      } else {
        canvas[idx] = 0;
        canvas[idx + 1] = 0;
        canvas[idx + 2] = 0;
        canvas[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(canvas, {
    width: size,
    height: size,
  });
}
