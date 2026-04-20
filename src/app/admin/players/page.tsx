'use client';

import { useState, useEffect, useActionState, startTransition } from 'react';
import { UserPlus, Search, Mail, Lock, User, Loader2, AlertCircle, Eye, Trash2, UserMinus, KeyRound, Copy } from 'lucide-react';
import { createMember, getMembers, updateMember, disableMemberAction, enableMemberAction, deleteMemberAction, resetPasswordAction } from '@/app/actions/members';

type ListedUser = {
  uid: string;
  email?: string;
  displayName?: string;
  metadata: { creationTime: string; disabled: boolean };
  customClaims?: { role?: 'coordinator' | 'player'; [key: string]: unknown };
};

export default function PlayersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ListedUser | null>(null);
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const refreshUsers = async () => {
    const result = await getMembers();
    startTransition(() => {
      if (result.users) {
        setUsers(result.users as ListedUser[]);
        setError('');
      } else if (result.error) {
        setError(result.error);
      }
      setLoading(false);
    });
  };

  const [formState, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const result = await createMember(prev, formData);
    if (result.success) {
      setIsModalOpen(false);
      setLoading(true);
      await refreshUsers();
      return { success: result.success };
    }
    return { error: result.error };
  }, null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
      void refreshUsers();
    }, 0);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">اللاعبين</h1>
          <p className="text-muted-foreground">إدارة وإنشاء حسابات اللاعبين والمنسقين</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-5 h-5" />
          إضافة لاعب/منسق
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="بحث عن لاعب..." 
          className="w-full bg-secondary/30 border border-border rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
        />
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-foreground">المستخدم</th>
                <th className="px-6 py-4 font-bold text-foreground">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-bold text-foreground">الدور</th>
                <th className="px-6 py-4 font-bold text-foreground">تاريخ التسجيل</th>
                <th className="px-6 py-4 font-bold text-foreground">الحالة</th>
                <th className="px-6 py-4 font-bold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    لا يوجد أعضاء مسجلين حالياً
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                          {user.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium">{user.displayName || 'مستخدم بدون اسم'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.customClaims?.role === 'coordinator' 
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {user.customClaims?.role === 'coordinator' ? 'منسق' : 'لاعب عادي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.metadata.creationTime).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.metadata.disabled
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {user.metadata.disabled ? 'معطل' : 'نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          className="text-primary hover:underline text-sm font-medium"
                          onClick={() => { setEditingUser(user); setEditModalOpen(true); }}
                        >
                          تعديل
                        </button>
                        {(user.customClaims?.role === 'player' || user.customClaims?.role === 'coordinator') && (
                          <DetailsButton user={user} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">إضافة لاعب/منسق</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {formState?.error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {formState.error}
                </div>
              )}
              
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      name="displayName"
                      required
                      type="text" 
                      placeholder="مثال: أحمد محمد"
                      className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      name="email"
                      required
                      type="email" 
                      placeholder="user@example.com"
                      className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      name="password"
                      required
                      type="password" 
                      placeholder="******"
                      className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الدور</label>
                  <select
                    name="role"
                    required
                    defaultValue="player"
                    className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary/50 outline-none"
                  >
                    <option value="player">لاعب عادي</option>
                    <option value="coordinator">منسق</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors font-medium"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      "حفظ"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">تعديل بيانات العضو</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            
            <EditForm 
              user={editingUser} 
              onClose={() => setEditModalOpen(false)} 
              onUpdated={async () => { 
                setEditModalOpen(false); 
                setLoading(true); 
                await refreshUsers(); 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsButton({ user }: { user: ListedUser }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)} title="تفاصيل الحساب">
        <Eye className="w-4 h-4" />
      </button>
      {open && (
        <AccountDetailsModal user={user} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function AccountDetailsModal({ user, onClose }: { user: ListedUser, onClose: () => void }) {
  const role = user.customClaims?.role || 'player';
  const [disableState, disableAction, disablePending] = useActionState(disableMemberAction, null);
  const [enableState, enableAction, enablePending] = useActionState(enableMemberAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteMemberAction, null);
  const [resetState, resetAction, resetPending] = useActionState(resetPasswordAction, null);
  const temp = (resetState as any)?.tempPassword as string | undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">تفاصيل الحساب</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {disableState?.error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{disableState.error}</div>}
          {enableState?.error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{enableState.error}</div>}
          {deleteState?.error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{deleteState.error}</div>}
          {resetState?.error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{resetState.error}</div>}
          {disableState?.success && <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">تم تعطيل الحساب</div>}
          {enableState?.success && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">تم تفعيل الحساب</div>}
          {deleteState?.success && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">تم حذف الحساب</div>}
          {resetState?.success && temp && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center justify-between">
              <span>كلمة المرور المؤقتة: {temp}</span>
              <button
                onClick={() => navigator.clipboard.writeText(temp)}
                className="text-blue-300 hover:text-blue-200"
                title="نسخ"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">البريد</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">الدور</p>
            <p className="font-medium">{role === 'coordinator' ? 'منسق' : 'لاعب'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <form action={resetAction}>
              <input type="hidden" name="uid" value={user.uid} />
              <input type="hidden" name="role" value={role} />
              <button
                type="submit"
                disabled={resetPending}
                className="w-full px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                إعادة تعيين كلمة المرور
              </button>
            </form>

            {user.metadata.disabled ? (
              <form action={enableAction}>
                <input type="hidden" name="uid" value={user.uid} />
                <input type="hidden" name="role" value={role} />
                <button
                  type="submit"
                  disabled={enablePending}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center gap-2"
                >
                  تفعيل الحساب
                </button>
              </form>
            ) : (
              <form action={disableAction}>
                <input type="hidden" name="uid" value={user.uid} />
                <input type="hidden" name="role" value={role} />
                <button
                  type="submit"
                  disabled={disablePending}
                  className="w-full px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 flex items-center justify-center gap-2"
                >
                  <UserMinus className="w-4 h-4" />
                  تعطيل الحساب
                </button>
              </form>
            )}

            <form action={deleteAction}>
              <input type="hidden" name="uid" value={user.uid} />
              <input type="hidden" name="role" value={role} />
              <button
                type="submit"
                disabled={deletePending}
                className="w-full px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف الحساب
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
function EditForm({ user, onClose, onUpdated }: { user: ListedUser, onClose: () => void, onUpdated: () => void }) {
  const [state, formAction, isPending] = useActionState(async (_: unknown, formData: FormData) => {
    const result = await updateMember(_, formData);
    if (result.success) {
      onUpdated();
      return { success: result.success };
    }
    return { error: result.error };
  }, null);

  return (
    <form action={formAction} className="p-6 space-y-4">
      {state?.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="uid" value={user.uid} />

      <div className="space-y-2">
        <label className="text-sm font-medium">الاسم الكامل</label>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            name="displayName"
            defaultValue={user.displayName || ''}
            type="text" 
            placeholder="مثال: أحمد محمد"
            className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">الدور</label>
        <select
          name="role"
          defaultValue={user.customClaims?.role || 'player'}
          className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary/50 outline-none"
        >
          <option value="player">لاعب عادي</option>
          <option value="coordinator">منسق</option>
        </select>
      </div>

      <div className="pt-4 flex gap-3">
        <button 
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors font-medium"
        >
          إغلاق
        </button>
        <button 
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ التغييرات"
          )}
        </button>
      </div>
    </form>
  );
}
