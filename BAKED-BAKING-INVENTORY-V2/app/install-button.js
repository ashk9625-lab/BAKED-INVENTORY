'use client';

import {useEffect,useState} from 'react';

export default function InstallButton(){
  const [deferredPrompt,setDeferredPrompt]=useState(null);
  const [installed,setInstalled]=useState(false);

  useEffect(()=>{
    const isStandalone=window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
    setInstalled(isStandalone);

    const beforeInstall=(event)=>{
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled=()=>{
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt',beforeInstall);
    window.addEventListener('appinstalled',onInstalled);
    return ()=>{
      window.removeEventListener('beforeinstallprompt',beforeInstall);
      window.removeEventListener('appinstalled',onInstalled);
    };
  },[]);

  async function handleInstall(){
    if(installed){
      alert('BAKED Inventory is already installed on this computer.');
      return;
    }

    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    alert(
      'To install on this PC:\n\n' +
      'Chrome: click the install icon in the address bar, or Menu ⋮ → Cast, save and share → Install BAKED Inventory.\n\n' +
      'Microsoft Edge: Menu ⋯ → Apps → Install BAKED Inventory.'
    );
  }

  return (
    <button type="button" className="install-button" onClick={handleInstall}>
      {installed?'✓ App Installed':'↓ Install on PC'}
    </button>
  );
}
