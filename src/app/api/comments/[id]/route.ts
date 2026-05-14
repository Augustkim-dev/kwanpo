import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPassword } from "@/lib/password";
import { containsBadWords } from "@/lib/badWords";
import { sanitize } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { password, content } = body as Record<string, string>;

  if (!content || content.length < 1 || content.length > 300)
    return NextResponse.json({ error: "댓글은 1~300자여야 합니다." }, { status: 422 });
  if (containsBadWords(content))
    return NextResponse.json({ error: "금칙어가 포함되어 있습니다." }, { status: 422 });

  const { data: comment } = await supabase
    .from("comments")
    .select("password_hash")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await verifyPassword(password, comment.password_hash)))
    return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 403 });

  const { data, error } = await supabase
    .from("comments")
    .update({ content: sanitize(content) })
    .eq("id", id)
    .select("id, nickname, content, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { password } = body as Record<string, string>;

  const { data: comment } = await supabase
    .from("comments")
    .select("password_hash")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await verifyPassword(password, comment.password_hash)))
    return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 403 });

  await supabase.from("comments").update({ is_deleted: true }).eq("id", id);
  return NextResponse.json({ ok: true });
}
