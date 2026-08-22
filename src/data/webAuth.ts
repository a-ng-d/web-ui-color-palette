import { getSupabase } from "ui-ui-color-palette/external/auth";

export type OAuthProvider = "google" | "github" | "figma";

export const signInWithOAuth = async (
  provider: OAuthProvider = "google",
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client is not initialized");

  const { error } = await supabase.auth.signInWithOAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: provider as any,
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });

  if (error) throw error;
};

export const signOutWeb = async (): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client is not initialized");

  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
};

export const restoreSession = async () => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[webAuth] Failed to restore session:", error);
    return null;
  }
  return data.session;
};
