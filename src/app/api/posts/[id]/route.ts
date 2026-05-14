import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPassword, hashPassword } from "@/lib/password";
import { containsBadWords } from "@/lib/badWords";
import { sanitize } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, nickname, content, like_count, view_count, created_at, updated_at")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error || !post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // view_count 증가 (fire-and-forget)
  supabase
    .from("posts")
    .update({ view_count: post.view_count + 1 })
    .eq("id", id);

  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { password, content } = body as Record<string, string>;

  if (!content || content.length < 1 || content.length > 1000)
    return NextResponse.json({ error: "본문은 1~1000자여야 합니다." }, { status: 422 });
  if (containsBadWords(content))
    return NextResponse.json({ error: "금칙어가 포함되어 있습니다." }, { status: 422 });

  const { data: post } = await supabase
    .from("posts")
    .select("password_hash")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await verifyPassword(password, post.password_hash)))
    return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 403 });

  const { data, error } = await supabase
    .from("posts")
    .update({ content: sanitize(content), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, nickname, content, like_count, view_count, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { password } = body as Record<string, string>;

  const { data: post } = await supabase
    .from("posts")
    .select("password_hash")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await verifyPassword(password, post.password_hash)))
    return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 403 });

  await supabase.from("posts").update({ is_deleted: true }).eq("id", id);

  return NextResponse.json({ ok: true });
}
