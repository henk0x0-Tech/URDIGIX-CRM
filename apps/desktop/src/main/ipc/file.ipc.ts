import { ipcMain, dialog, app } from 'electron';
import log from 'electron-log';

interface FileFilter {
  name: string;
  extensions: string[];
}

export function registerFileIpcHandlers(): void {
  ipcMain.handle('open-file-dialog', async (_event, filters?: FileFilter[]) => {
    try {
      const defaultFilters: FileFilter[] = [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'] },
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'] },
        { name: 'URDIGIX Files', extensions: ['urdigix'] },
      ];

      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: filters ?? defaultFilters,
        title: 'Select File',
      });

      if (result.canceled) {
        return { canceled: true, filePaths: [] };
      }

      return { canceled: false, filePaths: result.filePaths };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Open file dialog error:', message);
      return { canceled: true, filePaths: [], error: message };
    }
  });

  ipcMain.handle('save-file-dialog', async (_event, defaultPath?: string, filters?: FileFilter[]) => {
    try {
      const defaultFilters: FileFilter[] = [
        { name: 'All Files', extensions: ['*'] },
        { name: 'PDF Documents', extensions: ['pdf'] },
        { name: 'Excel Spreadsheets', extensions: ['xlsx', 'xls'] },
        { name: 'CSV Files', extensions: ['csv'] },
      ];

      const result = await dialog.showSaveDialog({
        defaultPath: defaultPath ?? app.getPath('documents'),
        filters: filters ?? defaultFilters,
        title: 'Save File',
        properties: ['showOverwriteConfirmation', 'createDirectory'],
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true, filePath: null };
      }

      return { canceled: false, filePath: result.filePath };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Save file dialog error:', message);
      return { canceled: true, filePath: null, error: message };
    }
  });

  ipcMain.handle('open-folder-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Folder',
      });

      if (result.canceled) {
        return { canceled: true, folderPath: null };
      }

      return { canceled: false, folderPath: result.filePaths[0] ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Open folder dialog error:', message);
      return { canceled: true, folderPath: null, error: message };
    }
  });

  ipcMain.handle('get-app-path', (_event, pathName?: string) => {
    try {
      if (pathName) {
        return app.getPath(pathName as Parameters<typeof app.getPath>[0]);
      }
      return app.getPath('userData');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Get app path error:', message);
      return null;
    }
  });

  log.info('File IPC handlers registered');
}
