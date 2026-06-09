import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user;
        setUser(currentUser || null);

        if (currentUser) {
          await fetchProfile(currentUser.id);
          const isAdminRole = currentUser.app_metadata?.role === "admin";
          const isOwnerEmail = currentUser.email === "vermabk319@gmail.com";
          setIsAdmin(isAdminRole || isOwnerEmail);

          // Store recent account locally
          if (currentUser.email) {
            try {
              const accounts = JSON.parse(
                localStorage.getItem("jerox_accounts") || "[]",
              );
              if (!accounts.some((a: any) => a.email === currentUser.email)) {
                accounts.push({
                  email: currentUser.email,
                  provider: currentUser.app_metadata?.provider,
                });
                localStorage.setItem(
                  "jerox_accounts",
                  JSON.stringify(accounts),
                );
              }
            } catch (e) {}
          }
        } else {
          // @ts-ignore
          if (import.meta.env.VITE_SUPABASE_URL === undefined) {
            console.log("Mocking user for local development");
            setUser({ email: "vermabk319@gmail.com" });
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (e) {
        console.error("Auth error", e);
      } finally {
        setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (_event: any, session: any) => {
          const currentUser = session?.user;
          setUser(currentUser || null);
          if (currentUser) {
            await fetchProfile(currentUser.id);
            setIsAdmin(
              currentUser.app_metadata?.role === "admin" ||
                currentUser.email === "vermabk319@gmail.com",
            );
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        },
      );

      return () => {
        listener?.subscription?.unsubscribe?.();
      };
    }

    checkUser();
  }, []);

  const signInWithOtp = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
  };

  const verifyOtp = async (email: string, token: string) => {
    return await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: {
    full_name?: string;
    avatar_url?: string;
    email?: string;
  }) => {
    // 1. Update user metadata
    const { data: authData, error: authError } = await supabase.auth.updateUser(
      {
        data: updates,
      },
    );
    if (authError) throw authError;
    if (authData?.user) setUser(authData.user);

    // 2. Update profiles table
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user;
    if (currentUser) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
      }
    }
  };

  return {
    user,
    profile,
    isAdmin,
    loading,
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };
}
