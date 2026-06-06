import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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

export const AutoUpdater: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // Only run if electronAPI is available
    if (!window.electronAPI) return;

    const cleanupStatus = window.electronAPI.onUpdateStatus((data: any) => {
      if (data.status === 'checking') setStatus('checking');
      if (data.status === 'not-available') setStatus('idle');
      if (data.status === 'error') {
        setStatus('error');
        setErrorMsg(data.error || 'Unknown error');
      }
    });

    const cleanupAvailable = window.electronAPI.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateInfo(info);
      setStatus('available');
    });

    const cleanupProgress = window.electronAPI.onUpdateProgress((prog: DownloadProgress) => {
      setProgress(prog);
      setStatus('downloading');
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded((info: UpdateInfo) => {
      setUpdateInfo(info);
      setStatus('downloaded');
    });

    return () => {
      cleanupStatus();
      cleanupAvailable();
      cleanupProgress();
      cleanupDownloaded();
    };
  }, []);

  const handleInstall = () => {
    if (window.electronAPI) {
      window.electronAPI.installUpdate();
    }
  };

  const handleDismiss = () => {
    setStatus('idle');
  };

  if (status === 'idle' || status === 'checking') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="p-5">
        
        {/* Available State */}
        {status === 'available' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                <Download size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Update Available!</h3>
                <p className="text-sm text-slate-300 mt-1">Version {updateInfo?.version} is ready to download.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={handleDismiss} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dismiss
              </button>
              <div className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Downloading in background...
              </div>
            </div>
          </div>
        )}

        {/* Downloading State */}
        {status === 'downloading' && progress && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Downloading Update</h3>
                <p className="text-sm text-slate-300 mt-1">Version {updateInfo?.version}</p>
                
                {/* Progress Bar */}
                <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: \`\${progress.percent}%\` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>{Math.round(progress.percent)}%</span>
                  <span>{(progress.bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Downloaded State */}
        {status === 'downloaded' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                <CheckCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Update Ready</h3>
                <p className="text-sm text-slate-300 mt-1">Version {updateInfo?.version} has been downloaded and is ready to install.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={handleDismiss} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Later
              </button>
              <button 
                onClick={handleInstall} 
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                Restart & Install
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Update Failed</h3>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2" title={errorMsg}>{errorMsg}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleDismiss} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AutoUpdater;
