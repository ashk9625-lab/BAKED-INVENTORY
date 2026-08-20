'use client';

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (standalone) setInstalled(true);

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (installed) return;

    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    if (isIOS) {
      setShowIOSHelp(v => !v);
      return;
    }

    alert('On your phone, open this site in Chrome or Edge, then use the browser menu and choose “Install app” or “Add to Home screen”.');
  }

  return (
    <div className="install-wrap">
      <button
        type="button"
        className="install-button"
        onClick={install}
        disabled={installed}
      >
        {installed ? '✓ App Installed' : '⬇ Install App'}
      </button>

      {showIOSHelp && (
        <div className="install-help">
          On iPhone/iPad: open this site in Safari, tap the Share button, then choose <b>Add to Home Screen</b>.
        </div>
      )}
    </div>
  );
}
