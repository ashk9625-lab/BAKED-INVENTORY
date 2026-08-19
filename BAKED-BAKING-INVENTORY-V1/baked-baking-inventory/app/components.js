import Link from 'next/link';

export function Shell({ children }) {
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">BAKED</div><div className="subbrand">Baking Team Inventory</div>
      <nav className="nav">
        <Link href="/">Dashboard</Link>
        <Link href="/products">Products</Link>
        <Link href="/inventory">Stock Movements</Link>
        <Link href="/production">Production</Link>
      </nav>
    </aside>
    <main className="main">{children}</main>
  </div>
}
