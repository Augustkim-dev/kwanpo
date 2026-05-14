"use client";

import { useState } from "react";
import { Post } from "@/lib/types";
import PostCard from "./PostCard";
import PostForm from "./PostForm";

interface Props {
  initialPosts: Post[];
  initialTotal: number;
}

const PAGE_SIZE = 20;

export default function PostList({ initialPosts, initialTotal }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadPage(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${p}`);
      const data = await res.json();
      setPosts(data.posts);
      setTotal(data.total);
      setPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  function handleCreated(post: Post) {
    setPosts((prev) => [post, ...prev.slice(0, PAGE_SIZE - 1)]);
    setTotal((t) => t + 1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <PostForm onCreated={handleCreated} />

      {loading ? (
        <div className="text-center py-12 text-gray-400">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👋</p>
          <p>아직 인사가 없어요. 첫 인사를 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} num={total - (page - 1) * PAGE_SIZE - i} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => loadPage(p)}
              disabled={p === page || loading}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
