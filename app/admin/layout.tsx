// app/admin/layout.tsx
// Server component — fetches admin profile once and passes it to the client shell.

import { getAdminProfile } from '@/lib/admin';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminProfile = await getAdminProfile();

  return <AdminShell adminProfile={adminProfile}>{children}</AdminShell>;
}
