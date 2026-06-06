export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
}

export interface ElectronAPI {
  // Auth
  saveToken: (token: string) => Promise<boolean>;
  getToken: () => Promise<string | null>;
  deleteToken: () => Promise<boolean>;
  saveRefreshToken: (token: string) => Promise<boolean>;
  getRefreshToken: () => Promise<string | null>;
  deleteRefreshToken: () => Promise<boolean>;

  // Notifications
  showNotification: (
    title: string,
    body: string,
    options?: { silent?: boolean; urgency?: string }
  ) => Promise<{ success: boolean; reason?: string }>;

  // File Dialogs
  openFileDialog: (
    filters?: FileFilter[]
  ) => Promise<{ canceled: boolean; filePaths: string[] }>;
  saveFileDialog: (
    defaultPath?: string,
    filters?: FileFilter[]
  ) => Promise<{ canceled: boolean; filePath: string | null }>;
  openFolderDialog: () => Promise<{ canceled: boolean; folderPath: string | null }>;
  getAppPath: (pathName?: string) => Promise<string | null>;

  // Backup
  createBackup: () => Promise<{
    success: boolean;
    backup?: BackupInfo;
    error?: string;
  }>;
  restoreBackup: (
    path?: string
  ) => Promise<{ success: boolean; restoredFrom?: string; error?: string; reason?: string }>;
  listBackups: () => Promise<{
    success: boolean;
    backups: BackupInfo[];
    error?: string;
  }>;
  getBackupPath: () => Promise<string>;

  // Window Controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  toggleFullscreen: () => Promise<boolean>;

  // Window Events
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => () => void;
  onWindowFullscreen: (callback: (isFullscreen: boolean) => void) => () => void;

  // Updates
  checkForUpdates: () => Promise<{ status: string; updateInfo?: UpdateInfo; error?: string }>;
  installUpdate: () => Promise<void>;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateProgress: (callback: (progress: DownloadProgress) => void) => () => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateStatus: (
    callback: (status: { status: string; version?: string; error?: string }) => void
  ) => () => void;

  // Navigation
  onNavigate: (callback: (path: string) => void) => () => void;
  onCheckUpdatesFromTray: (callback: () => void) => () => void;

  // App Info
  getAppVersion: () => Promise<string>;
  getPlatform: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
