import CoordinatorShell from './Shell';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase';
 
export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;
  const email = cookieStore.get('user_email')?.value;
  const sessionIdCookie = cookieStore.get('session_id')?.value;
 
  if (!role || !email || !sessionIdCookie) {
    redirect('/login');
  }
 
  try {
    const user = await adminAuth.getUserByEmail(email);
    const claims = (user.customClaims || {}) as Record<string, any>;
    const currentSessionId = claims.sessionId as string | undefined;
    const userRole = claims.role as string | undefined;
    if (user.disabled) {
      redirect('/login');
    }
    if (userRole !== 'coordinator') {
      redirect('/login');
    }
    if (!currentSessionId || currentSessionId !== sessionIdCookie) {
      redirect('/login');
    }
    const ownerUid = claims.ownerAdminUid as string | undefined;
    const ownerEmail = (claims.ownerAdminEmail as string | undefined)?.toLowerCase();
    if (ownerUid || ownerEmail) {
      try {
        let ownerRecord:
          | (import('firebase-admin/auth').UserRecord)
          | undefined;
        if (ownerUid) {
          ownerRecord = await adminAuth.getUser(ownerUid);
        } else if (ownerEmail) {
          ownerRecord = await adminAuth.getUserByEmail(ownerEmail);
        }
        if (ownerRecord && ownerRecord.disabled) {
          redirect('/login');
        }
      } catch {}
    }
  } catch {
    redirect('/login');
  }
 
  return <CoordinatorShell>{children}</CoordinatorShell>;
}
