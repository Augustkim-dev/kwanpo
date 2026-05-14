"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Post, Comment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import PasswordModal from "./PasswordModal";

interface Props {
  post: Post;
  initialComments: Comment[];
  initialLiked: boolean;
}

export default function PostDetail({ post, initialComments, initialLiked }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [postContent, setPostContent] = useState(post.content);
  const [editContent, setEditContent] = useState(post.content);
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);
  const [editing, setEditing] = useState(false);

  async function handleDelete(password: string) {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "오류가 발생했습니다.");
    }
    setModal(null);
    router.push("/");
    router.refresh();
  }

  async function handleEditConfirm(password: string) {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, content: editContent }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "오류가 발생했습니다.");
    setPostContent(data.content);
    setModal(null);
    setEditing(false);
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-semibold text-gray-800 mr-2">{post.nickname}</span>
          <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
          {post.updated_at && (
            <span className="text-xs text-gray-400 ml-1">(수정됨)</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(true); setModal("edit"); }}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
          >
            수정
          </button>
          <button
            onClick={() => setModal("delete")}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 본문 */}
      {editing && modal === "edit" ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={1000}
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-line leading-7 mb-6">{postContent}</p>
      )}

      {/* 좋아요 + 조회수 */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <LikeButton
          postId={post.id}
          initialCount={post.like_count}
          initialLiked={initialLiked}
        />
        <span className="text-xs text-gray-400">👁 {post.view_count}</span>
      </div>

      {/* 댓글 */}
      <section aria-label="댓글">
        <h2 className="font-medium text-gray-700 mb-3">
          댓글 <span className="text-yellow-500">{comments.length}</span>
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            첫 댓글을 남겨보세요!
          </p>
        ) : (
          <div>
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onDeleted={(id) => setComments((prev) => prev.filter((x) => x.id !== id))}
                onEdited={(updated) =>
                  setComments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                }
              />
            ))}
          </div>
        )}
        <CommentForm
          postId={post.id}
          onCreated={(comment) => setComments((prev) => [...prev, comment])}
        />
      </section>

      {/* 모달 */}
      {modal === "delete" && (
        <PasswordModal
          title="글을 삭제하시겠습니까?"
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "edit" && editing && (
        <PasswordModal
          title="비밀번호를 확인합니다"
          onConfirm={handleEditConfirm}
          onClose={() => { setModal(null); setEditing(false); }}
        />
      )}
    </article>
  );
}
