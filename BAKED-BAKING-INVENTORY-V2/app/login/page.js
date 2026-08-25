import { prisma } from '../../lib/prisma';
import LoginForm from './login-form';
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const configured = await prisma.teamMember.count({ where: { passwordHash: { not: null } } });
  return <main className="auth-page">
    <div className="auth-card">
      <div className="brand">BAKED</div>
      <div className="subbrand">Baking Team Inventory</div>
      <h1>Staff Login</h1>
      <p className="muted">Sign in with your staff account.</p>
      <LoginForm />
      {!configured && <a className="setup-link" href="/setup">Create First Admin</a>}
    </div>
  </main>;
}
