"use client";

import {
  getCurrentUser,
  signInWithGoogle,
  signOut,
  supabase,
} from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session and set user

    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error initializing user: ", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    // Listen for changes in auth state( sign in, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: signInWithGoogle,
    signOut: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
