"use client";
import { createBrowserClient } from "@supabase/ssr";
import { env, supabaseConfigurado } from "@/lib/env";
import { SCHEMA } from "./config";

export function supabaseBrowser() {
  if (!supabaseConfigurado()) return null;
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey, { db: { schema: SCHEMA } });
}
