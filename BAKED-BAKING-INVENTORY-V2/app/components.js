import Link from 'next/link';
export function Shell({children}) {
  const links = [
    ['/', 'Dashboard'], ['/products','Products'], ['/inventory','Stock Movements'],
    ['/production','Production'], ['/recipes','Recipes / BOM'], ['/suppliers','Suppliers'],
    ['/purchase-orders','Purchase Orders'], ['/transfers','Transfers'],
    ['/reports','Reports'], ['/team','Team & Roles']
  ];
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">BAKED</div><div className="subbrand">Baking Team Inventory</div>
      <nav className="nav">{links.map(([h,l])=><Link key={h} href={h}>{l}</Link>)}</nav>
      <div className="muted small">V2 • Live database</div>
    </aside>
    <main className="main">{children}</main>
  </div>
}
export function EmptyRow({colSpan, children='No records yet.'}) {
  return <tr><td className="muted" colSpan={colSpan}>{children}</td></tr>
}
