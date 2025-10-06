"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface UserProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
  role: string;
  type: string;
  confirmed: boolean;
  education?: Record<string, unknown> | null;
  job?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  token: string | null;
  profile: UserProfile | null;
}

interface AuthContextValue extends AuthState {
  login: (profile: UserProfile, token: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "classroom-auth";
const initialState: AuthState = { token: null, profile: null };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed?.token && parsed?.profile) {
        setState(parsed);
      }
    } catch (error) {
      console.error("อ่านข้อมูลผู้ใช้จาก localStorage ไม่สำเร็จ", error);
    }
  }, []);

  const login = (profile: UserProfile, token: string) => {
    const nextState: AuthState = { profile, token };
    setState(nextState);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  };

  const logout = () => {
    setState(initialState);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth ต้องถูกใช้ภายใน AuthProvider");
  }
  return context;
}
