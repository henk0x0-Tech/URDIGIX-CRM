import { ipcMain, Notification, BrowserWindow, nativeImage } from 'electron';
import { join } from 'path';
import log from 'electron-log';

export function registerNotificationIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(
    'show-notification',
    (_event, title: string, body: string, options?: { silent?: boolean; urgency?: string }) => {
      try {
        if (!Notification.isSupported()) {
          log.warn('Notifications are not supported on this system');
          return { success: false, reason: 'not-supported' };
        }

        let icon: Electron.NativeImage | undefined;
        const iconPath = join(__dirname, '../../build/icon.ico');
        try {
          icon = nativeImage.createFromPath(iconPath);
          if (icon.isEmpty()) {
            icon = undefined;
          }
        } catch {
          icon = undefined;
        }

        const notification = new Notification({
          title,
          body,
          icon,
          silent: options?.silent ?? false,
          urgency: (options?.urgency as 'normal' | 'critical' | 'low') ?? 'normal',
          toastXml: undefined,
        });

        notification.on('click', () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) {
              mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
          }
        });

        notification.on('close', () => {
          log.debug('Notification closed:', title);
        });

        notification.on('failed', (_event, error) => {
          log.error('Notification failed:', error);
        });

        notification.show();
        log.info('Notification shown:', title);

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        log.error('Failed to show notification:', message);
        return { success: false, reason: message };
      }
    }
  );

  log.info('Notification IPC handlers registered');
}
