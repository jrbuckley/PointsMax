import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MockUser = {
  id: string;
  email: string;
  displayName: string | null;
};

/** Mock-only: persisted so "Sign in" works after app restart (no real backend). */
type RegisteredMockAccount = {
  user: MockUser;
  password: string;
};

type AuthState = {
  user: MockUser | null;
  registeredAccount: RegisteredMockAccount | null;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (input: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  /** Clears mock registration (used with "Clear all data"). */
  clearMockRegistration: () => void;
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      registeredAccount: null,

      async signIn(email, password) {
        await delay(400);
        const e = normalizeEmail(email);
        if (!isValidEmail(e)) {
          return { ok: false, error: "Enter a valid email address." };
        }
        if (!password.trim()) {
          return { ok: false, error: "Enter your password." };
        }
        const reg = get().registeredAccount;
        if (!reg) {
          return { ok: false, error: "No account found. Create one first." };
        }
        if (reg.user.email !== e) {
          return {
            ok: false,
            error: "No mock account for that email. Use the email you signed up with.",
          };
        }
        if (reg.password !== password) {
          return { ok: false, error: "Incorrect password." };
        }
        set({ user: reg.user });
        return { ok: true };
      },

      async signUp({ email, password, displayName }) {
        await delay(500);
        const e = normalizeEmail(email);
        if (!isValidEmail(e)) {
          return { ok: false, error: "Enter a valid email address." };
        }
        if (password.length < 6) {
          return { ok: false, error: "Password must be at least 6 characters." };
        }
        const name = displayName?.trim() || null;
        const user: MockUser = {
          id: `mock_${Date.now()}`,
          email: e,
          displayName: name,
        };
        set({
          user,
          registeredAccount: { user, password },
        });
        return { ok: true };
      },

      signOut() {
        set({ user: null });
      },

      clearMockRegistration() {
        set({ user: null, registeredAccount: null });
      },
    }),
    {
      name: "points-exchange-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        user: s.user,
        registeredAccount: s.registeredAccount,
      }),
    },
  ),
);
