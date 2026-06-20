import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    if (!user) return null;
    try {
      const { data: rows } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1);

      if (rows && rows.length > 0) return rows[0];

      // Profile missing (OAuth user created before trigger) — auto-create it
      const { data: newProfile } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Kullanici",
            role: "customer",
          },
          { onConflict: "id" },
        )
        .select()
        .limit(1);

      return newProfile?.[0] || { role: "customer" };
    } catch (err) {
      if (err.code !== "42501") console.error("Profile fetch error:", err);
      return { role: "customer" };
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check if there's an OAuth hash in the URL before finishing load
    const isOAuthRedirect = window.location.hash.includes("access_token");
    if (isOAuthRedirect) {
      setLoading(true);
    }

    const updateUserData = async (session) => {
      if (session?.user) {
        let profile = await fetchProfile(session.user);
        
        // Roles and Application statuses are strictly enforced by the Database and Admin panel.
        // No client-side URL interception for privileges.
        
        // Check email confirmation OR if logged in via Social Provider
        const isVerified =
          profile?.is_verified ||
          !!session.user.email_confirmed_at ||
          ["google", "apple"].includes(session.user.app_metadata?.provider);

        if (isMounted) {
          setCurrentUser({ ...session.user, ...profile, isVerified });
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
          // Only stop loading if we are NOT in the middle of an OAuth redirect hash
          if (!window.location.hash.includes("access_token")) {
            setLoading(false);
          }
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        updateUserData(session);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        // If we get an auth change event (e.g. SIGNED_IN after OAuth hash parsed)
        // ensure we process it and remove loading.
        updateUserData(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const loginAsGuest = () => {
    // Valid UUID format for Postgres: 8-4-4-4-12
    const guestId =
      "00000000-0000-4000-8000-" +
      Math.random().toString(16).slice(2, 14).padStart(12, "0");
    const guestUser = {
      id: guestId,
      aud: "authenticated",
      role: "customer",
      email: "guest@rapidsy.app",
      confirmed_at: new Date().toISOString(),
      isAnonymous: true,
      user_metadata: { full_name: "Misafir Kullanıcı", role: "customer" },
    };
    setCurrentUser(guestUser);
    setLoading(false);
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    handleLogout,
    loginAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
