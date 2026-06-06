import { contextBridge, ipcRenderer } from 'electron';

interface FileFilter {
  name: string;
  extensions: string[];
}

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

const electronAPI = {
  // ─── Auth ──────────────────────────────────────────────────────
  saveToken: (token: string): Promise<boolean> =>
    ipcRenderer.invoke('save-token', token),

  getToken: (): Promise<string | null> =>
    ipcRenderer.invoke('get-token'),

  deleteToken: (): Promise<boolean> =>
    ipcRenderer.invoke('delete-token'),

  saveRefreshToken: (token: string): Promise<boolean> =>
    ipcRenderer.invoke('save-refresh-token', token),

  getRefreshToken: (): Promise<string | null> =>
    ipcRenderer.invoke('get-refresh-token'),

  deleteRefreshToken: (): Promise<boolean> =>
    ipcRenderer.invoke('delete-refresh-token'),

  // ─── Notifications ─────────────────────────────────────────────
  showNotification: (
    title: string,
    body: string,
    options?: { silent?: boolean; urgency?: string }
  ): Promise<{ success: boolean; reason?: string }> =>
    ipcRenderer.invoke('show-notification', title, body, options),

  // ─── File Dialogs ──────────────────────────────────────────────
  openFileDialog: (
    filters?: FileFilter[]
  ): Promise<{ canceled: boolean; filePaths: string[] }> =>
    ipcRenderer.invoke('open-file-dialog', filters),

  saveFileDialog: (
    defaultPath?: string,
    filters?: FileFilter[]
  ): Promise<{ canceled: boolean; filePath: string | null }> =>
    ipcRenderer.invoke('save-file-dialog', defaultPath, filters),

  openFolderDialog: (): Promise<{ canceled: boolean; folderPath: string | null }> =>
    ipcRenderer.invoke('open-folder-dialog'),

  getAppPath: (pathName?: string): Promise<string | null> =>
    ipcRenderer.invoke('get-app-path', pathName),

  // ─── Backup ────────────────────────────────────────────────────
  createBackup: (): Promise<{
    success: boolean;
    backup?: { filename: string; path: string; size: number; createdAt: string };
    error?: string;
  }> => ipcRenderer.invoke('create-backup'),

  restoreBackup: (
    path?: string
  ): Promise<{ success: boolean; restoredFrom?: string; error?: string; reason?: string }> =>
    ipcRenderer.invoke('restore-backup', path),

  listBackups: (): Promise<{
    success: boolean;
    backups: { filename: string; path: string; size: number; createdAt: string }[];
    error?: string;
  }> => ipcRenderer.invoke('list-backups'),

  getBackupPath: (): Promise<string> =>
    ipcRenderer.invoke('get-backup-path'),

  // ─── Window Controls ──────────────────────────────────────────
  minimizeWindow: (): Promise<void> =>
    ipcRenderer.invoke('minimize-window'),

  maximizeWindow: (): Promise<void> =>
    ipcRenderer.invoke('maximize-window'),

  closeWindow: (): Promise<void> =>
    ipcRenderer.invoke('close-window'),

  isMaximized: (): Promise<boolean> =>
    ipcRenderer.invoke('is-maximized'),

  toggleFullscreen: (): Promise<boolean> =>
    ipcRenderer.invoke('toggle-fullscreen'),

  // ─── Window Events ─────────────────────────────────────────────
  onWindowMaximized: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: boolean): void => {
      callback(value);
    };
    ipcRenderer.on('window-maximized', handler);
    return () => {
      ipcRenderer.removeListener('window-maximized', handler);
    };
  },

  onWindowFullscreen: (callback: (isFullscreen: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: boolean): void => {
      callback(value);
    };
    ipcRenderer.on('window-fullscreen', handler);
    return () => {
      ipcRenderer.removeListener('window-fullscreen', handler);
    };
  },

  // ─── Updates ───────────────────────────────────────────────────
  checkForUpdates: (): Promise<{ status: string; updateInfo?: UpdateInfo; error?: string }> =>
    ipcRenderer.invoke('check-for-updates'),

  installUpdate: (): Promise<void> =>
    ipcRenderer.invoke('install-update'),

  onUpdateAvailable: (callback: (info: UpdateInfo) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo): void => {
      callback(info);
    };
    ipcRenderer.on('update-available', handler);
    return () => {
      ipcRenderer.removeListener('update-available', handler);
    };
  },

  onUpdateProgress: (callback: (progress: DownloadProgress) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: DownloadProgress): void => {
      callback(progress);
    };
    ipcRenderer.on('download-progress', handler);
    return () => {
      ipcRenderer.removeListener('download-progress', handler);
    };
  },

  onUpdateDownloaded: (callback: (info: UpdateInfo) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo): void => {
      callback(info);
    };
    ipcRenderer.on('update-downloaded', handler);
    return () => {
      ipcRenderer.removeListener('update-downloaded', handler);
    };
  },

  onUpdateStatus: (
    callback: (status: { status: string; version?: string; error?: string }) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      status: { status: string; version?: string; error?: string }
    ): void => {
      callback(status);
    };
    ipcRenderer.on('update-status', handler);
    return () => {
      ipcRenderer.removeListener('update-status', handler);
    };
  },

  // ─── Navigation (from tray) ───────────────────────────────────
  onNavigate: (callback: (path: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, path: string): void => {
      callback(path);
    };
    ipcRenderer.on('navigate', handler);
    return () => {
      ipcRenderer.removeListener('navigate', handler);
    };
  },

  onCheckUpdatesFromTray: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback();
    };
    ipcRenderer.on('check-updates-from-tray', handler);
    return () => {
      ipcRenderer.removeListener('check-updates-from-tray', handler);
    };
  },

  // ─── App Info ──────────────────────────────────────────────────
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke('get-app-version'),

  getPlatform: (): string => process.platform,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
