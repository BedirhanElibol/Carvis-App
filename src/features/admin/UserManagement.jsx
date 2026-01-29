import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Shield, UserX, UserCheck, MoreVertical, Loader2, BadgeCheck } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const { showAlert, t } = useUI();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Admin Policy allows this
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error(error);
            showAlert("Hata", "Kullanıcı listesi alınamadı: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle Role Change
    const handleRoleUpdate = async (userId, newRole) => {
        if (!confirm(`Kullanıcının rolünü '${newRole}' olarak değiştirmek istediğinize emin misiniz?`)) return;

        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            showAlert("Başarılı", "Kullanıcı rolü güncellendi.", "success");
            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            showAlert("Hata", "Güncelleme başarısız.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 'parking': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20';
            case 'mechanic': return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
            case 'valet': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-outfit text-white">Kullanıcı Yönetimi</h1>
                    <p className="text-slate-400">Platformdaki tüm kullanıcıları görüntüleyin ve yönetin.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="İsim, E-posta veya Rol ara..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rol</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kayıt Tarihi</th>
                                <th className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        <Loader2 className="animate-spin inline mr-2" /> Yükleniyor...
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
                                    <tr key={user.id} className="hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{user.full_name || 'İsimsiz'}</p>
                                                    <p className="text-xs text-slate-500">{user.email || user.phone_number || 'İletişim yok'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(user.role)} uppercase`}>
                                                {user.role || 'customer'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {processingId === user.id ? (
                                                    <Loader2 className="animate-spin text-slate-500" size={18} />
                                                ) : (
                                                    <div className="group relative">
                                                        <select
                                                            className="appearance-none bg-slate-900 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:bg-white/10"
                                                            value={user.role || 'customer'}
                                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                            disabled={user.role === 'admin'} // Cannot create/demote admins easily for safety
                                                        >
                                                            <option value="customer">Müşteri</option>
                                                            <option value="parking">Otopark</option>
                                                            <option value="valet">Vale</option>
                                                            <option value="mechanic">Tamirci</option>
                                                        </select>
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
        </div>
    );
};

export default UserManagement;
