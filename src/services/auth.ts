import type { Provider, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  getAuthRedirectUrl,
  signInWithEmailPassword,
  signInWithOAuth,
  signOut,
  signUpWithEmailPassword,
  type Occupation,
} from "@/lib/supabase/auth";

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  occupation?: Occupation;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
};

export async function registerWithEmail(input: RegisterInput) {
  const { data, error } = await signUpWithEmailPassword({
    email: input.email,
    password: input.password,
    fullName: input.fullName,
    phone: input.phone,
    occupation: input.occupation,
    metadata: {
      state: input.state,
      district: input.district,
      mandal: input.mandal,
      village: input.village,
    },
  });

  if (error) throw error;
  return data;
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await signInWithEmailPassword(email, password);
  if (error) throw error;
  return data;
}

export async function loginWithGoogle() {
  const { data, error } = await signInWithOAuth("google" satisfies Provider);
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function sendPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl("/"),
  });
  if (error) throw error;
  return data;
}
