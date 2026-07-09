'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { CarFront, KeyRound, Loader2, Zap } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            router.push('/dashboard');
        } catch (err) {
            setError(err.message || 'Giriş başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden selection:bg-primary/30">
            {/* Dark Mode Glowing Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-0"></div>

            <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="glass-panel p-10 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-border/50 relative overflow-hidden group">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -z-10 group-hover:bg-primary/20 transition-colors duration-700"></div>

                    <div className="flex justify-center mb-10">
                        <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                            <Zap size={32} className="text-primary animate-pulse" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-foreground tracking-tighter">Carvis<span className="text-primary">.ai</span></h1>
                        <p className="text-sm text-muted-foreground font-semibold mt-2">Merkezi yönetim sistemine giriş yapın</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-sm font-bold text-destructive text-center animate-in shake shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                            {error === 'Invalid login credentials' ? 'E-posta veya parola hatalı.' : error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">E-Posta Adresi</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-border/50 text-foreground text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-black/40 focus:ring-1 focus:ring-primary/50 transition-all placeholder-muted-foreground/50"
                                placeholder="admin@carvis.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Parola</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-border/50 text-foreground text-sm font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/50 focus:bg-black/40 focus:ring-1 focus:ring-primary/50 transition-all placeholder-muted-foreground/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <KeyRound size={18} /> SİSTEME GİRİŞ YAP
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    &copy; 2026 Carvis Technologies Inc.
                </p>
            </div>
        </div>
    );
}
