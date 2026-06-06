import { ipcMain, app, dialog } from 'electron';
import { join, basename } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import log from 'electron-log';

const execFileAsync = promisify(execFile);

interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
}

function getBackupDir(): string {
  const backupDir = join(app.getPath('userData'), 'backups');
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function generateBackupFilename(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  return `urdigix-backup-${timestamp}.sql`;
}

export function registerBackupIpcHandlers(): void {
  ipcMain.handle('create-backup', async () => {
    try {
      const backupDir = getBackupDir();
      const filename = generateBackupFilename();
      const outputPath = join(backupDir, filename);

      const dbHost = process.env['DB_HOST'] ?? 'localhost';
      const dbPort = process.env['DB_PORT'] ?? '5432';
      const dbName = process.env['DB_NAME'] ?? 'urdigix';
      const dbUser = process.env['DB_USER'] ?? 'postgres';

      const pgDumpPath = process.env['PG_DUMP_PATH'] ?? 'pg_dump';

      const args = [
        '-h', dbHost,
        '-p', dbPort,
        '-U', dbUser,
        '-d', dbName,
        '-F', 'c',
        '-b',
        '-v',
        '-f', outputPath,
      ];

      const env = { ...process.env };
      if (process.env['DB_PASSWORD']) {
        env['PGPASSWORD'] = process.env['DB_PASSWORD'];
      }

      await execFileAsync(pgDumpPath, args, {
        env,
        timeout: 300000,
      });

      const stats = statSync(outputPath);
      log.info(`Backup created: ${filename} (${formatBytes(stats.size)})`);

      return {
        success: true,
        backup: {
          filename,
          path: outputPath,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
        } satisfies BackupInfo,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Backup creation failed:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('restore-backup', async (_event, backupPath?: string) => {
    try {
      let filePath = backupPath;

      if (!filePath) {
        const result = await dialog.showOpenDialog({
          title: 'Select Backup File',
          defaultPath: getBackupDir(),
          filters: [
            { name: 'SQL Backup Files', extensions: ['sql', 'dump', 'backup'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, reason: 'canceled' };
        }

        filePath = result.filePaths[0];
      }

      if (!existsSync(filePath)) {
        return { success: false, error: 'Backup file not found' };
      }

      const confirmResult = await dialog.showMessageBox({
        type: 'warning',
        title: 'Restore Backup',
        message: `Are you sure you want to restore from:\n${basename(filePath)}?`,
        detail: 'This will overwrite the current database. This action cannot be undone.',
        buttons: ['Cancel', 'Restore'],
        defaultId: 0,
        cancelId: 0,
      });

      if (confirmResult.response !== 1) {
        return { success: false, reason: 'canceled' };
      }

      const dbHost = process.env['DB_HOST'] ?? 'localhost';
      const dbPort = process.env['DB_PORT'] ?? '5432';
      const dbName = process.env['DB_NAME'] ?? 'urdigix';
      const dbUser = process.env['DB_USER'] ?? 'postgres';

      const pgRestorePath = process.env['PG_RESTORE_PATH'] ?? 'pg_restore';

      const args = [
        '-h', dbHost,
        '-p', dbPort,
        '-U', dbUser,
        '-d', dbName,
        '-c',
        '-v',
        filePath,
      ];

      const env = { ...process.env };
      if (process.env['DB_PASSWORD']) {
        env['PGPASSWORD'] = process.env['DB_PASSWORD'];
      }

      await execFileAsync(pgRestorePath, args, {
        env,
        timeout: 600000,
      });

      log.info(`Backup restored from: ${basename(filePath)}`);
      return { success: true, restoredFrom: filePath };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('Backup restore failed:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('list-backups', () => {
    try {
      const backupDir = getBackupDir();
      const files = readdirSync(backupDir);

      const backups: BackupInfo[] = files
        .filter((file) => /\.(sql|dump|backup)$/i.test(file))
        .map((file) => {
          const filePath = join(backupDir, file);
          const stats = statSync(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { success: true, backups };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      log.error('List backups failed:', message);
      return { success: false, backups: [], error: message };
    }
  });

  ipcMain.handle('get-backup-path', () => {
    return getBackupDir();
  });

  log.info('Backup IPC handlers registered');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
