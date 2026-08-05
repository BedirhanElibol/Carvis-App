import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

const getStoredGuestUser = () => {
  try {
    const storedGuest =
      localStorage.getItem("carvis_guest") ||
      localStorage.getItem("rapidsy_guest");
    if (!storedGuest) return null;

    const guestUser = JSON.parse(storedGuest);
    return guestUser?.isAnonymous ? guestUser : null;
  } catch {
    localStorage.removeItem("carvis_guest");
    localStorage.removeItem("rapidsy_guest");
    return null;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    if (!user) return null;
    try {
      const isSuperAdmin = user.email === "bedirelibol7@gmail.com";

      const { data: rows } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1);

      if (rows && rows.length > 0) {
        const profile = rows[0];
        if (isSuperAdmin) {
          return {
            ...profile,
            role: "admin",
            application_status: "approved",
            is_approved_partner: true,
            is_active_provider: true,
          };
        }
        return profile;
      }

      // Profile missing (OAuth user created before trigger) — auto-create it
      const defaultRole = isSuperAdmin ? "admin" : "customer";
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
            role: defaultRole,
            application_status: isSuperAdmin ? "approved" : "pending",
            is_approved_partner: isSuperAdmin,
            is_active_provider: isSuperAdmin,
          },
          { onConflict: "id" },
        )
        .select()
        .limit(1);

      const created = newProfile?.[0] || { role: defaultRole };
      return isSuperAdmin
        ? { ...created, role: "admin", application_status: "approved" }
        : created;
    } catch (err) {
      if (err.code !== "42501") console.error("Profile fetch error:", err);
      return user.email === "bedirelibol7@gmail.com"
        ? { role: "admin", application_status: "approved" }
        : { role: "customer" };
    }
  };

  useEffect(() => {
    const updateUserData = async (session) => {
      if (session?.user) {
        let profile = await fetchProfile(session.user);
        
        const isVerified =
          profile?.is_verified ||
          !!session.user.email_confirmed_at ||
          ["google", "apple"].includes(session.user.app_metadata?.provider);

        setCurrentUser({ ...session.user, ...profile, isVerified });
        localStorage.removeItem("carvis_guest");
        localStorage.removeItem("rapidsy_guest");
      } else {
        setCurrentUser(getStoredGuestUser());
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserData(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      updateUserData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("SignOut error:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem("carvis_guest");
    localStorage.removeItem("rapidsy_guest");
    sessionStorage.clear();
    window.location.href = "/";
  };

  const loginAsGuest = () => {
    const guestId =
      "00000000-0000-4000-8000-" +
      Math.random().toString(16).slice(2, 14).padStart(12, "0");
    const guestUser = {
      id: guestId,
      aud: "authenticated",
      role: "customer",
      email: "guest@rapidsy.app",
      full_name: "Misafir Sürücü",
      isAnonymous: true,
      isVerified: true,
      application_status: "approved",
    };
    try {
      localStorage.setItem("carvis_guest", JSON.stringify(guestUser));
      localStorage.setItem("rapidsy_guest", JSON.stringify(guestUser));
    } catch (e) {
      console.warn("LocalStorage save guest failed", e);
    }
    setCurrentUser(guestUser);
    return guestUser;
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginAsGuest,
      handleLogout,
      setCurrentUser,
      fetchProfile,
    }),
    [currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
