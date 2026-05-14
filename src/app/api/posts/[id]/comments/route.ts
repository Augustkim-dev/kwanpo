import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/password";
import { getIpHash } from "@/lib/ip";
import { containsBadWords } from "@/lib/badWords";
import { sanitize } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("comments")
    .select("id, nickname, content, created_at")
    .eq("post_id", id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { nickname, password, content } = body as Record<string, string>;

  if (!nickname || nickname.length < 2 || nickname.length > 20)
    return NextResponse.json({ error: "닉네임은 2~20자여야 합니다." }, { status: 422 });
  if (!password || password.length < 4)
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 422 });
  if (!content || content.length < 1 || content.length > 300)
    return NextResponse.json({ error: "댓글은 1~300자여야 합니다." }, { status: 422 });

  if (containsBadWords(nickname) || containsBadWords(content))
    return NextResponse.json({ error: "금칙어가 포함되어 있습니다." }, { status: 422 });

  // 게시글 존재 확인
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const passwordHash = await hashPassword(password);
  const ipHash = getIpHash(req);

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: parseInt(id),
      nickname: sanitize(nickname),
      password_hash: passwordHash,
      content: sanitize(content),
      ip_hash: ipHash,
    })
    .select("id, nickname, content, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
