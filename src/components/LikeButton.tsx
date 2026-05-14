"use client";

import { useState } from "react";

interface Props {
  postId: number;
  initialCount: number;
  initialLiked: boolean;
}

export default function LikeButton({ postId, initialCount, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setCount((c) => (data.liked ? c + 1 : c - 1));
        // 쿠키로 UI 상태 보존
        updateLikedCookie(postId, data.liked);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition-colors ${
        liked
          ? "bg-red-50 border-red-300 text-red-500"
          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400"
      }`}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}

function updateLikedCookie(postId: number, liked: boolean) {
  const raw = document.cookie
    .split("; ")
    .find((r) => r.startsWith("liked_posts="))
    ?.split("=")[1];
  const likedIds: number[] = raw ? JSON.parse(decodeURIComponent(raw)) : [];
  const next = liked
    ? [...new Set([...likedIds, postId])]
    : likedIds.filter((id) => id !== postId);
  document.cookie = `liked_posts=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
}
