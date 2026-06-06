import { BrowserWindow, app, ipcMain } from 'electron';
import log from 'electron-log';
import { registerAuthIpcHandlers } from './auth.ipc';
import { registerNotificationIpcHandlers } from './notification.ipc';
import { registerFileIpcHandlers } from './file.ipc';
import { registerBackupIpcHandlers } from './backup.ipc';
import { registerWindowIpcHandlers } from './window.ipc';

export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  log.info('Registering IPC handlers...');

  registerAuthIpcHandlers();
  registerNotificationIpcHandlers(mainWindow);
  registerFileIpcHandlers();
  registerBackupIpcHandlers();
  registerWindowIpcHandlers(mainWindow);

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-platform', () => {
    return process.platform;
  });

  log.info('All IPC handlers registered');
}
