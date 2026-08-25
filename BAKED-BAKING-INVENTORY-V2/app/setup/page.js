import { prisma } from '../../lib/prisma';
import { redirect } from 'next/navigation';
import SetupForm from './setup-form';
export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const configured = await prisma.teamMember.count({ where: { passwordHash: { not: null } } });
  if (configured) redirect('/login');
  return <main className="auth-page">
    <div className="auth-card">
      <div className="brand">BAKED</div>
      <div className="subbrand">Baking Team Inventory</div>
      <h1>Create First Admin</h1>
      <p className="muted">This screen only works before the first login account is created.</p>
      <SetupForm />
    </div>
  </main>;
}
