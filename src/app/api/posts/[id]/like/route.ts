import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getIpHash } from "@/lib/ip";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = parseInt(id);
  const ipHash = getIpHash(req);

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  const { data: post } = await supabase
    .from("posts")
    .select("like_count")
    .eq("id", postId)
    .single();

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    await supabase
      .from("posts")
      .update({ like_count: Math.max(0, post.like_count - 1) })
      .eq("id", postId);
    return NextResponse.json({ liked: false });
  } else {
    await supabase.from("likes").insert({ post_id: postId, ip_hash: ipHash });
    await supabase
      .from("posts")
      .update({ like_count: post.like_count + 1 })
      .eq("id", postId);
    return NextResponse.json({ liked: true });
  }
}
