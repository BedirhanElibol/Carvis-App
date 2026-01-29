import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (user) => {
        if (!user) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error || !data) {
                console.warn("Role fetch warning:", error || "No profile data");
                return 'customer'; // Fail safe
            }
            return data.role || 'customer';
        } catch (err) {
            console.error(err);
            return 'customer';
        }
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const role = await fetchUserRole(session.user);
                setCurrentUser({ ...session.user, role });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // If user is already set and ID matches, maybe don't refetch? 
                // But for safety on role update, let's fetch.
                const role = await fetchUserRole(session.user);
                setCurrentUser({ ...session.user, role });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const loginAsGuest = () => {
        const guestUser = {
            id: 'guest-' + Math.random().toString(36).substr(2, 9),
            aud: 'authenticated',
            role: 'customer', // Explicitly set role
            email: 'guest@carvis.app',
            confirmed_at: new Date().toISOString(),
            isAnonymous: true,
            user_metadata: {
                full_name: 'Misafir Kullanıcı',
                role: 'customer' // Double assurance
            }
        };
        // setSession({ user: guestUser }); // setSession is not defined in this context
        setCurrentUser(guestUser);
        setLoading(false);
    };

    const value = {
        currentUser,
        setCurrentUser,
        loading,
        handleLogout,
        loginAsGuest
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
