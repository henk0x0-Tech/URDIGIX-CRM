import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App(): React.JSX.Element {
  const [version, setVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setVersion);
      setPlatform(window.electronAPI.getPlatform());

      const unsubNavigate = window.electronAPI.onNavigate((path) => {
        console.log('Navigate to:', path);
      });

      const unsubUpdate = window.electronAPI.onUpdateAvailable((info) => {
        console.log('Update available:', info.version);
      });

      return () => {
        unsubNavigate();
        unsubUpdate();
      };
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        paddingTop: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
        }}
      >
        <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>U</span>
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
        URDIGIX Solutions ERP
      </h1>
      <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>
        Desktop Application
      </p>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '13px',
          color: '#64748b',
        }}
      >
        {version && <span>v{version}</span>}
        {platform && <span>•</span>}
        {platform && <span>{platform}</span>}
      </div>
      <p
        style={{
          fontSize: '14px',
          color: '#475569',
          marginTop: '48px',
          maxWidth: '400px',
          textAlign: 'center',
          lineHeight: '1.6',
        }}
      >
        Replace this page with your React application. The Electron shell is ready
        with IPC handlers, system tray, auto-updater, and secure token storage.
      </p>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
