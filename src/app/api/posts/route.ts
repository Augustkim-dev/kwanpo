import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/password";
import { getIpHash } from "@/lib/ip";
import { isRateLimited } from "@/lib/rateLimit";
import { containsBadWords } from "@/lib/badWords";
import { sanitize } from "@/lib/sanitize";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const offset = (page - 1) * PAGE_SIZE;

  const { data, error, count } = await supabase
    .from("posts")
    .select("id, nickname, content, like_count, view_count, created_at, updated_at", {
      count: "exact",
    })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 댓글 수 조회
  const ids = (data ?? []).map((p) => p.id);
  const { data: commentCounts } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", ids)
    .eq("is_deleted", false);

  const countMap: Record<number, number> = {};
  (commentCounts ?? []).forEach((c) => {
    countMap[c.post_id] = (countMap[c.post_id] ?? 0) + 1;
  });

  const posts = (data ?? []).map((p) => ({
    ...p,
    content_preview: p.content.slice(0, 100),
    comment_count: countMap[p.id] ?? 0,
  }));

  return NextResponse.json({ posts, total: count ?? 0, page, page_size: PAGE_SIZE });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { nickname, password, content } = body as Record<string, string>;

  if (!nickname || nickname.length < 2 || nickname.length > 20)
    return NextResponse.json({ error: "닉네임은 2~20자여야 합니다." }, { status: 422 });
  if (!password || password.length < 4)
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 422 });
  if (!content || content.length < 1 || content.length > 1000)
    return NextResponse.json({ error: "본문은 1~1000자여야 합니다." }, { status: 422 });

  if (containsBadWords(nickname) || containsBadWords(content))
    return NextResponse.json({ error: "금칙어가 포함되어 있습니다." }, { status: 422 });

  const ipHash = getIpHash(req);

  if (await isRateLimited(ipHash))
    return NextResponse.json(
      { error: "30초 내에 다시 작성할 수 없습니다." },
      { status: 429 }
    );

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      nickname: sanitize(nickname),
      password_hash: passwordHash,
      content: sanitize(content),
      ip_hash: ipHash,
    })
    .select("id, nickname, content, like_count, view_count, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
