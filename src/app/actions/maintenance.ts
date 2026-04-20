 'use server'
 
 import { cookies } from 'next/headers'
 import { revalidatePath } from 'next/cache'
import { adminAuth } from '@/lib/firebase'
import type { ListUsersResult } from 'firebase-admin/auth'
 
 export async function autoFixAction(prevState: any, formData: FormData) {
   const cookieStore = await cookies()
   const role = cookieStore.get('user_role')?.value
   const email = cookieStore.get('user_email')?.value
   if (role !== 'admin' || !email) {
     return { error: 'غير مصرح: هذه العملية لمدير النظام فقط' }
   }
   try {
     let pageToken: string | undefined = undefined
    do {
      const res: ListUsersResult = await adminAuth.listUsers(1000, pageToken)
      for (const u of res.users) {
         const claims = (u.customClaims || {}) as Record<string, any>
         const roleU = claims.role as string | undefined
         if (roleU === 'player' || roleU === 'coordinator') {
           let ownerUid = claims.ownerAdminUid as string | undefined
           let ownerEmail = (claims.ownerAdminEmail as string | undefined)?.toLowerCase()
           if (ownerEmail && ownerEmail !== ownerEmail.toLowerCase()) {
             ownerEmail = ownerEmail.toLowerCase()
           }
           let ownerRecord:
             | (import('firebase-admin/auth').UserRecord)
             | undefined
           try {
             if (ownerUid) {
               ownerRecord = await adminAuth.getUser(ownerUid)
             } else if (ownerEmail) {
               ownerRecord = await adminAuth.getUserByEmail(ownerEmail)
               ownerUid = ownerRecord?.uid
             }
           } catch {}
           const newClaims: Record<string, any> = { ...claims }
           if (ownerUid && !newClaims.ownerAdminUid) newClaims.ownerAdminUid = ownerUid
           if (ownerEmail && newClaims.ownerAdminEmail !== ownerEmail) newClaims.ownerAdminEmail = ownerEmail
           if (newClaims.ownerAdminUid !== claims.ownerAdminUid || newClaims.ownerAdminEmail !== claims.ownerAdminEmail) {
             await adminAuth.setCustomUserClaims(u.uid, newClaims)
           }
           if (ownerRecord) {
             const shouldDisable = !!ownerRecord.disabled
             if (shouldDisable && !u.disabled) {
               await adminAuth.updateUser(u.uid, { disabled: true })
             } else if (!shouldDisable && u.disabled) {
               await adminAuth.updateUser(u.uid, { disabled: false })
             }
           }
         }
       }
      pageToken = res.pageToken
     } while (pageToken)
 
     const paths = [
       '/admin',
       '/admin/players',
       '/admin/server',
       '/admin/settings',
       '/coordinator',
       '/coordinator/war-management',
       '/member',
       '/super-admin',
       '/',
     ]
     for (const p of paths) revalidatePath(p)
 
     return { success: 'تم تنفيذ التصحيح التلقائي وتحديث الموقع' }
   } catch (e) {
     return { error: 'فشل تنفيذ التصحيح التلقائي' }
   }
 }
