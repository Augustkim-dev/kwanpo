import { supabase } from "./supabase";

const LIMIT_SECONDS = 30;

/** Returns true if the ip_hash has posted within the last 30 seconds. */
export async function isRateLimited(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - LIMIT_SECONDS * 1000).toISOString();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("is_deleted", false)
    .gte("created_at", since);
  return (count ?? 0) > 0;
}
