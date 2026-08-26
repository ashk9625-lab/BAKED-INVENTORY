import './globals.css';
import PwaRegister from './pwa-register';

export const metadata = {
  title: 'BAKED Baking Team Inventory',
  description: 'BAKED Baking Team Inventory and Work Management',
  manifest: '/manifest.webmanifest',
  themeColor: '#0b0f0d',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icon-192.png'
  }
};

export default function RootLayout({children}){
  return (
    <html lang="en">
      <body>
        <PwaRegister/>
        {children}
      </body>
    </html>
  );
}
