import './globals.css';

export const metadata = {
  title: 'Baked Baking Team Inventory',
  description: 'Internal inventory and production system for the Baked Baking Team.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
