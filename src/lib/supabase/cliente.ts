"use client";
import { createBrowserClient } from "@supabase/ssr";
import { env, supabaseConfigurado } from "@/lib/env";

export function supabaseBrowser() {
  if (!supabaseConfigurado()) return null;
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
