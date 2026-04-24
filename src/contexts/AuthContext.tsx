import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// ─── Role system ───────────────────────────────────────────
export type MerchantRole = "merchant_owner" | "merchant_admin" | "merchant_staff";

/** @deprecated Use MerchantRole instead */
export type UserRole = MerchantRole | "platform_admin";

export type Permission =
  // Dashboard
  | "dashboard:view"
  // Enterprise / Branch
  | "enterprise:view"
  | "enterprise:manage"
  | "enterprise:delete"
  // Users
  | "users:view"
  | "users:manage"
  | "users:manage_roles"
  // Membership Cards
  | "cards:view"
  | "cards:create"
  | "cards:edit"
  | "cards:delete"
  // Loyalty Programs
  | "programs:view"
  | "programs:create"
  | "programs:edit"
  | "programs:delete"
  | "programs:assign"
  // Members / Subscribers
  | "members:view"
  | "members:manage"
  // Campaigns operational
  | "campaigns:view"
  | "campaigns:manage"
  // Redemption / Activity
  | "redemptions:view"
  | "redemptions:manage"
  | "activity:view"
  // Monetization / Billing (future)
  | "billing:view"
  | "billing:manage"
  | "quota:manage"
  // Settings
  | "settings:view"
  | "settings:manage"
  // Platform admin (future)
  | "admin:portal";

/**
 * Permission matrix — merchant_owner > merchant_admin > merchant_staff
 * platform_admin is separate and for future central admin only.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  merchant_owner: [
    "dashboard:view",
    "enterprise:view", "enterprise:manage", "enterprise:delete",
    "users:view", "users:manage", "users:manage_roles",
    "cards:view", "cards:create", "cards:edit", "cards:delete",
    "programs:view", "programs:create", "programs:edit", "programs:delete", "programs:assign",
    "members:view", "members:manage",
    "campaigns:view", "campaigns:manage",
    "redemptions:view", "redemptions:manage",
    "activity:view",
    "billing:view", "billing:manage", "quota:manage",
    "settings:view", "settings:manage",
  ],
  merchant_admin: [
    "dashboard:view",
    "enterprise:view", "enterprise:manage",
    "users:view", "users:manage",
    "cards:view", "cards:create", "cards:edit",
    "programs:view", "programs:create", "programs:edit", "programs:assign",
    "members:view", "members:manage",
    "campaigns:view", "campaigns:manage",
    "redemptions:view", "redemptions:manage",
    "activity:view",
    "settings:view",
  ],
  merchant_staff: [
    "dashboard:view",
    "cards:view",
    "programs:view",
    "members:view",
    "campaigns:view",
    "redemptions:view",
    "activity:view",
  ],
  platform_admin: [
    "dashboard:view",
    "enterprise:view", "enterprise:manage", "enterprise:delete",
    "users:view", "users:manage", "users:manage_roles",
    "cards:view", "cards:create", "cards:edit", "cards:delete",
    "programs:view", "programs:create", "programs:edit", "programs:delete", "programs:assign",
    "members:view", "members:manage",
    "campaigns:view", "campaigns:manage",
    "redemptions:view", "redemptions:manage",
    "activity:view",
    "billing:view", "billing:manage", "quota:manage",
    "settings:view", "settings:manage",
    "admin:portal",
  ],
};

// ─── User type ─────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: MerchantRole;
  isOnboarded: boolean;
  businessId?: string;
}

// ─── Context type ──────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  completeOnboarding: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasRole: (role: MerchantRole) => boolean;
  hasAnyRole: (roles: MerchantRole[]) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch the user's merchant role from user_roles table.
 * Falls back to merchant_owner for backward compatibility.
 */
async function fetchMerchantRole(userId: string): Promise<MerchantRole> {
  try {
    const { data, error } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (error || !data) return "merchant_owner"; // fallback for existing users
    return (data as any).role as MerchantRole;
  } catch {
    return "merchant_owner";
  }
}

async function ensureMerchantProfile(su: SupabaseUser): Promise<void> {
  try {
    await (supabase as any)
      .from("merchant_profiles")
      .insert({
        auth_user_id: su.id,
        full_name:
          su.user_metadata?.full_name ??
          su.user_metadata?.name ??
          su.email?.split("@")[0] ??
          null,
        email: su.email ?? null,
        phone_no: su.user_metadata?.phone ?? null,
        profile_image_url: su.user_metadata?.avatar_url ?? null,
        status: "active",
      })
      .select()
      .limit(1);
    // Silently ignored if auth_user_id already exists (unique index)
  } catch {
    // non-critical — do not block auth flow
  }
}

function mapSupabaseUser(su: SupabaseUser, role: MerchantRole): User {
  return {
    id: su.id,
    email: su.email ?? "",
    name: su.user_metadata?.name ?? su.user_metadata?.full_name ?? su.email ?? "",
    role,
    isOnboarded: su.user_metadata?.is_onboarded ?? true,
    businessId: su.user_metadata?.business_id,
  };
}

// ─── Provider ──────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserWithRole = useCallback(async (supabaseUser: SupabaseUser) => {
    const role = await fetchMerchantRole(supabaseUser.id);
    setUser(mapSupabaseUser(supabaseUser, role));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (event === "SIGNED_IN") {
          ensureMerchantProfile(session.user);
        }
        loadUserWithRole(session.user).finally(() => setIsLoading(false));
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserWithRole(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserWithRole]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, is_onboarded: false },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const completeOnboarding = useCallback(async () => {
    await supabase.auth.updateUser({ data: { is_onboarded: true } });
    setUser((prev) => (prev ? { ...prev, isOnboarded: true } : null));
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]) => {
      if (!user) return false;
      const userPerms = ROLE_PERMISSIONS[user.role] ?? [];
      return permissions.some((p) => userPerms.includes(p));
    },
    [user]
  );

  const hasRole = useCallback((role: MerchantRole) => user?.role === role, [user]);
  const hasAnyRole = useCallback((roles: MerchantRole[]) => !!user && roles.includes(user.role), [user]);

  const isOwner = user?.role === "merchant_owner";
  const isAdmin = user?.role === "merchant_admin";
  const isStaff = user?.role === "merchant_staff";

  const value = useMemo(
    () => ({
      user, isAuthenticated: !!user, isLoading,
      login, signup, logout, forgotPassword, resetPassword, completeOnboarding,
      hasPermission, hasAnyPermission, hasRole, hasAnyRole,
      isOwner, isAdmin, isStaff,
    }),
    [user, isLoading, login, signup, logout, forgotPassword, resetPassword, completeOnboarding, hasPermission, hasAnyPermission, hasRole, hasAnyRole, isOwner, isAdmin, isStaff]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hooks ─────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
