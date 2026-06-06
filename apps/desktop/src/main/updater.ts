import { BrowserWindow, app, ipcMain } from 'electron';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import log from 'electron-log';

let mainWindow: BrowserWindow | null = null;

export function setupAutoUpdater(win: BrowserWindow): void {
  mainWindow = win;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
    sendToRenderer('update-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('Update available:', info.version);
    sendToRenderer('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    log.info('Update not available. Current version:', info.version);
    sendToRenderer('update-status', {
      status: 'not-available',
      version: info.version,
    });
  });

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    const logMessage = `Download speed: ${formatBytes(progress.bytesPerSecond)}/s - ${Math.round(progress.percent)}% (${formatBytes(progress.transferred)}/${formatBytes(progress.total)})`;
    log.info(logMessage);
    sendToRenderer('download-progress', {
      bytesPerSecond: progress.bytesPerSecond,
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    log.info('Update downloaded:', info.version);
    sendToRenderer('update-downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on('error', (error: Error) => {
    log.error('Auto-updater error:', error.message);
    sendToRenderer('update-status', {
      status: 'error',
      error: error.message,
    });
  });

  ipcMain.handle('check-for-updates', async () => {
    try {
      if (!app.isPackaged) {
        log.info('Skipping update check in development mode');
        return { status: 'dev-mode' };
      }
      const result = await autoUpdater.checkForUpdates();
      return {
        status: 'ok',
        updateInfo: result?.updateInfo,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Failed to check for updates:', message);
      return { status: 'error', error: message };
    }
  });

  ipcMain.handle('install-update', () => {
    log.info('Installing update and restarting...');
    setImmediate(() => {
      app.isQuitting = true;
      autoUpdater.quitAndInstall(false, true);
    });
  });

  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        log.error('Initial update check failed:', err);
      });
    }, 5000);

    setInterval(
      () => {
        autoUpdater.checkForUpdates().catch((err) => {
          log.error('Periodic update check failed:', err);
        });
      },
      4 * 60 * 60 * 1000
    );
  } else {
    log.info('Auto-updater disabled in development mode');
  }
}

function sendToRenderer(channel: string, data: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
