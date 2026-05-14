"use client";

import { useState } from "react";
import { Post } from "@/lib/types";

interface Props {
  onCreated: (post: Post) => void;
}

export default function PostForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }
      onCreated({ ...data, comment_count: 0 });
      setNickname("");
      setPassword("");
      setContent("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-yellow-400 text-yellow-600 font-medium hover:bg-yellow-50 transition-colors"
        >
          ✏️ 인사 한 마디 남기기
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2~20자"
                maxLength={20}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="수정·삭제에 사용"
                minLength={4}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              인사말 <span className="text-gray-400">{content.length}/1000</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="반갑습니다! 한 마디 남겨보세요 😊"
              maxLength={1000}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(""); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-yellow-400 text-white rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "등록 중..." : "인사하기"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
