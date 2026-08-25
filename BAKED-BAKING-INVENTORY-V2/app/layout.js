import './globals.css';

export const metadata = {
  title: 'BAKED Baking Team Inventory',
  description: 'BAKED Baking Team Inventory and Work Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
