import PostList from "@/components/PostList";
import { supabase } from "@/lib/supabase";

async function getPosts() {
  const PAGE_SIZE = 20;

  const { data, error, count } = await supabase
    .from("posts")
    .select("id, nickname, content, like_count, view_count, created_at", {
      count: "exact",
    })
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (error || !data) return { posts: [], total: 0 };

  const ids = data.map((p) => p.id);
  const { data: commentCounts } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", ids)
    .eq("is_deleted", false);

  const countMap: Record<number, number> = {};
  (commentCounts ?? []).forEach((c) => {
    countMap[c.post_id] = (countMap[c.post_id] ?? 0) + 1;
  });

  const posts = data.map((p) => ({
    ...p,
    content_preview: p.content.slice(0, 100),
    comment_count: countMap[p.id] ?? 0,
  }));

  return { posts, total: count ?? 0 };
}

export default async function Home() {
  const { posts, total } = await getPosts();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 w-full">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👋 인사 게시판</h1>
        <p className="text-gray-500 text-sm">
          회원가입 없이 누구나 인사를 남길 수 있어요.
        </p>
      </header>

      <PostList initialPosts={posts} initialTotal={total} />
    </main>
  );
}
