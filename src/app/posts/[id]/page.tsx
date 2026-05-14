import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import PostDetail from "@/components/PostDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { data } = await supabase
    .from("posts")
    .select("nickname, content")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();
  if (!data) return { title: "인사 게시판" };
  return {
    title: `${data.nickname}의 인사 | 인사 게시판`,
    description: data.content.slice(0, 80),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, nickname, content, like_count, view_count, created_at, updated_at")
      .eq("id", id)
      .eq("is_deleted", false)
      .single(),
    supabase
      .from("comments")
      .select("id, nickname, content, created_at")
      .eq("post_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true }),
  ]);

  if (!post) notFound();

  // 조회수 증가
  supabase
    .from("posts")
    .update({ view_count: post.view_count + 1 })
    .eq("id", id);

  // 쿠키로 좋아요 상태 확인
  const cookieStore = await cookies();
  const likedRaw = cookieStore.get("liked_posts")?.value;
  const likedIds: number[] = likedRaw ? JSON.parse(decodeURIComponent(likedRaw)) : [];
  const initialLiked = likedIds.includes(post.id);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        ← 목록으로
      </Link>
      <PostDetail
        post={post}
        initialComments={comments ?? []}
        initialLiked={initialLiked}
      />
    </main>
  );
}
