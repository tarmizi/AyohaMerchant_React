import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type MerchantUser = Tables<"merchant_users">;
export type MerchantUserInsert = TablesInsert<"merchant_users">;
export type MerchantUserUpdate = TablesUpdate<"merchant_users">;

const QUERY_KEY = "merchant_users";

export async function uploadMerchantAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("merchant-avatars")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("merchant-avatars").getPublicUrl(path);
  return data.publicUrl;
}

async function hashPassword(password: string): Promise<string> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await supabase.functions.invoke("hash-password", {
    body: { password },
  });
  if (res.error) throw new Error("Failed to hash password");
  return res.data.hash;
}

export function useMerchantUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("merchant_users")
        .select("id, merchant_account_id, account_name, email, phone_number, profile_image_url, register_date, user_type, user_status, last_login_date, username, is_deleted, created_at, updated_at")
        .eq("merchant_account_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MerchantUser[];
    },
    enabled: !!user,
  });
}

export function useMerchantUser(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, user?.id, id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from("merchant_users")
        .select("id, merchant_account_id, account_name, email, phone_number, profile_image_url, register_date, user_type, user_status, last_login_date, username, is_deleted, created_at, updated_at")
        .eq("id", id)
        .eq("merchant_account_id", user.id)
        .eq("is_deleted", false)
        .maybeSingle();
      if (error) throw error;
      return data as MerchantUser | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateMerchantUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      account_name: string;
      email: string;
      phone_number: string;
      user_type: "Administrator" | "Owner" | "Staff";
      user_status: "Active" | "Inactive";
      username: string;
      password: string;
      profile_image_url?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const password_hash = await hashPassword(input.password);
      const { data, error } = await supabase
        .from("merchant_users")
        .insert({
          merchant_account_id: user.id,
          account_name: input.account_name,
          email: input.email,
          phone_number: input.phone_number,
          user_type: input.user_type,
          user_status: input.user_status,
          username: input.username,
          password_hash,
          ...(input.profile_image_url ? { profile_image_url: input.profile_image_url } : {}),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateMerchantUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
      ...updates
    }: Partial<{
      account_name: string;
      email: string;
      phone_number: string;
      user_type: "Administrator" | "Owner" | "Staff";
      user_status: "Active" | "Inactive";
      username: string;
      password: string;
      profile_image_url: string;
    }> & { id: string }) => {
      const payload: MerchantUserUpdate = { ...updates };
      if (password) {
        payload.password_hash = await hashPassword(password);
      }
      const { data, error } = await supabase
        .from("merchant_users")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteMerchantUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from("merchant_users")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
