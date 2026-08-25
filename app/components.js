import Link from 'next/link';
import InstallButton from './install-button';
import { requireUser } from '../lib/auth';

export async function Shell({children, requiredRoles=[]}) {
  const user = await requireUser(requiredRoles);

  const links = [
    ['/', 'Dashboard'],
    ['/work-management', 'Work Management'],
    ['/products','Products'],
    ['/inventory','Stock Movements'],
    ['/production','Production'],
    ['/recipes','Recipes / BOM'],
    ['/suppliers','Suppliers'],
    ['/reports','Reports'],
    ...(user.role === 'ADMIN' ? [['/team','Team & Permissions']] : [])
  ];

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">BAKED</div>
      <div className="subbrand">Baking Team Inventory</div>
      <InstallButton />
      <nav className="nav">{links.map(([h,l])=><Link key={h} href={h}>{l}</Link>)}</nav>
      <div className="staff-card">
        <strong>{user.name}</strong>
        <span>{user.role.replaceAll('_',' ')}</span>
        <form action="/api/auth/logout" method="post">
          <button className="logout-button" type="submit">Log Out</button>
        </form>
      </div>
      <div className="muted small">V3 • Staff audit enabled</div>
    </aside>
    <main className="main">{children}</main>
  </div>;
}

export function EmptyRow({colSpan, children='No records yet.'}) {
  return <tr><td className="muted" colSpan={colSpan}>{children}</td></tr>;
}
