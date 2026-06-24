import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import * as Icons from "lucide-react";
import { useUI } from "../../context/UIContext";
import { updateUserStatus } from "../../utils/supabaseApi";
 
import { motion, AnimatePresence } from "framer-motion";

/**
 * UserManagement Component
 * Admin interface to manage platform users, roles, and account status.
 */
const UserManagement = () => {
  const { showAlert } = useUI();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error(error);
      showAlert("Hata", "Kullanıcı listesi alınamadı: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Role Change
  const handleRoleUpdate = async (userId, newRole) => {
    if (
      !window.confirm(
        `Kullanıcının rolünü '${newRole}' olarak değiştirmek istediğinize emin misiniz?`
      )
    )
      return;
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      if (error) throw error;
      showAlert("Başarılı", "Kullanıcı rolü güncellendi.", "success");
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      showAlert("Hata", "Güncelleme başarısız.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(
    (user) =>
      (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/20";
      case "parking":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/20";
      case "mechanic":
        return "bg-orange-500/20 text-orange-400 border-orange-500/20";
      case "valet":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/20 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-sans text-slate-900 dark:text-white uppercase tracking-tighter leading-[1.2]">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-sans uppercase text-[10px] font-bold tracking-widest mt-1">
            Platformdaki tüm kullanıcıları görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <label htmlFor="user-search" className="sr-only">Kullanıcı Ara</label>
          <Icons.Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            id="user-search"
            type="text"
            placeholder="İsim, E-posta veya Rol ara..."
            className="w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50 transition font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-sans">
                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Kullanıcı
                </th>
                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Rol
                </th>
                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Kayıt Tarihi
                </th>
                <th className="p-4 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    <Icons.Loader2 className="animate-spin inline mr-2" /> Yükleniyor...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-black/5 dark:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5">
                          {user.full_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {user.full_name || "İsimsiz"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.email || user.phone_number || "İletişim yok"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black border ${getRoleBadgeColor(user.role)} uppercase tracking-tighter`}
                      >
                        {user.role || "customer"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {processingId === user.id ? (
                          <Icons.Loader2 className="animate-spin text-slate-500" size={18} />
                        ) : (
                          <div className="flex items-center gap-2">
                            <label htmlFor={`role-select-${user.id}`} className="sr-only">Rol Değiştir</label>
                            <select
                              id={`role-select-${user.id}`}
                              className="appearance-none bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:bg-black/10 dark:bg-white/10 font-bold font-sans"
                              value={user.role || "customer"}
                              onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                              disabled={user.role === "admin"}
                            >
                              <option value="customer">Müşteri</option>
                              <option value="parking">Otopark</option>
                              <option value="valet">Vale</option>
                              <option value="mechanic">Tamirci</option>
                            </select>
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white p-1.5 rounded-lg transition-all active-scale border border-black/5 dark:border-white/5"
                            >
                              <Icons.Eye size={16} />
                            </button>
                          </div>
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

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            ></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden font-sans"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icons.BadgeCheck className="text-primary-500" size={16} />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {selectedUser.role || "Müşteri"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {selectedUser.full_name || "İsimsiz Kullanıcı"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-500 hover:text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 p-2 rounded-full transition-colors"
                >
                  <Icons.UserX size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
                  <Icons.Banknote className="absolute -bottom-4 -right-4 text-slate-900 dark:text-white/5" size={80} />
                  <div className="relative z-10">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] mb-1 font-black uppercase tracking-widest">
                      Mevcut Bakiye
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">₺0</div>
                    <div className="text-xs text-yellow-500 mt-1 font-medium">
                      Bloke: ₺0
                    </div>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] mb-1 font-black uppercase tracking-widest">
                    Aktif İşler
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">0</div>
                  <div className="text-xs text-emerald-500 mt-1 font-medium">
                    Biten: 0
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-red-500 uppercase tracking-tight">
                      Kullanıcıyı Askıya Al
                    </div>
                    <div className="text-[10px] text-red-400/70 font-bold">
                      Sistem erişimini tamamen keser.
                    </div>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all hover:scale-105 active-scale uppercase"
                    disabled={processingId === selectedUser.id}
                    onClick={async () => {
                      setProcessingId(selectedUser.id);
                      const isSuspending = !selectedUser.is_suspended;
                      const { success, error } = await updateUserStatus(selectedUser.id, isSuspending);
                      
                      if (success) {
                        showAlert(
                          "Başarılı", 
                          `Kullanıcı ${isSuspending ? 'askıya alındı' : 'aktif edildi'}.`, 
                          "success"
                        );
                        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_suspended: isSuspending } : u));
                        setSelectedUser(null);
                      } else {
                        showAlert("Hata", "İşlem başarısız: " + error, "error");
                      }
                      setProcessingId(null);
                    }}
                  >
                    {selectedUser.is_suspended ? "AKTİF ET" : "ASKIYA AL"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
