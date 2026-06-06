import { ipcMain, safeStorage, app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import log from 'electron-log';

const TOKEN_FILENAME = 'auth-token.enc';
const REFRESH_TOKEN_FILENAME = 'auth-refresh-token.enc';

function getTokenDir(): string {
  const tokenDir = join(app.getPath('userData'), 'auth');
  if (!existsSync(tokenDir)) {
    mkdirSync(tokenDir, { recursive: true });
  }
  return tokenDir;
}

function getTokenPath(filename: string): string {
  return join(getTokenDir(), filename);
}

function saveEncryptedToken(filename: string, token: string): boolean {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      log.warn('Encryption not available, storing token in plain text');
      const path = getTokenPath(filename);
      writeFileSync(path, token, 'utf-8');
      return true;
    }

    const encrypted = safeStorage.encryptString(token);
    const path = getTokenPath(filename);
    writeFileSync(path, encrypted);
    log.info(`Token saved: ${filename}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Failed to save token ${filename}:`, message);
    return false;
  }
}

function getDecryptedToken(filename: string): string | null {
  try {
    const path = getTokenPath(filename);
    if (!existsSync(path)) {
      return null;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      log.warn('Encryption not available, reading plain text token');
      return readFileSync(path, 'utf-8');
    }

    const encrypted = readFileSync(path);
    return safeStorage.decryptString(encrypted);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Failed to read token ${filename}:`, message);
    return null;
  }
}

function deleteStoredToken(filename: string): boolean {
  try {
    const path = getTokenPath(filename);
    if (existsSync(path)) {
      unlinkSync(path);
      log.info(`Token deleted: ${filename}`);
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Failed to delete token ${filename}:`, message);
    return false;
  }
}

export function registerAuthIpcHandlers(): void {
  ipcMain.handle('save-token', (_event, token: string) => {
    return saveEncryptedToken(TOKEN_FILENAME, token);
  });

  ipcMain.handle('get-token', () => {
    return getDecryptedToken(TOKEN_FILENAME);
  });

  ipcMain.handle('delete-token', () => {
    return deleteStoredToken(TOKEN_FILENAME);
  });

  ipcMain.handle('save-refresh-token', (_event, token: string) => {
    return saveEncryptedToken(REFRESH_TOKEN_FILENAME, token);
  });

  ipcMain.handle('get-refresh-token', () => {
    return getDecryptedToken(REFRESH_TOKEN_FILENAME);
  });

  ipcMain.handle('delete-refresh-token', () => {
    return deleteStoredToken(REFRESH_TOKEN_FILENAME);
  });

  log.info('Auth IPC handlers registered');
}
