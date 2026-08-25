'use client';

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
      return;
    }
    alert('If the install prompt does not appear, open your browser menu and choose "Install app" or "Add to Home screen".');
  }

  return (
    <button type="button" className="install-button" onClick={handleInstall}>
      ↓ Install App
    </button>
  );
}
