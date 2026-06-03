import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser {
  phone: string;
  name: string;
  email: string;
  id: string;
  avatarInitials: string;
  loginMethod: "otp" | "google";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (phone: string) => Promise<void>;
  signInWithGoogle: (googleName: string, email: string) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  updateUser: async () => {},
  signOut: async () => {},
});

const AUTH_KEY = "@bazarlink_auth_v1";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw) => { if (raw) setUser(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persist = async (u: AuthUser) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signIn = async (phone: string) => {
    await persist({
      phone,
      name: "BazarLink User",
      email: "",
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      avatarInitials: "BU",
      loginMethod: "otp",
    });
  };

  const signInWithGoogle = async (googleName: string, email: string) => {
    await persist({
      phone: "",
      name: googleName,
      email,
      id: "google_" + Date.now().toString() + Math.random().toString(36).slice(2, 7),
      avatarInitials: initials(googleName),
      loginMethod: "google",
    });
  };

  const updateUser = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      ...updates,
      avatarInitials: updates.name ? initials(updates.name) : user.avatarInitials,
    };
    await persist(updated);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInWithGoogle, updateUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
