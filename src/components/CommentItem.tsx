"use client";

import { useState } from "react";
import { Comment } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import PasswordModal from "./PasswordModal";

interface Props {
  comment: Comment;
  onDeleted: (id: number) => void;
  onEdited: (updated: Comment) => void;
}

export default function CommentItem({ comment, onDeleted, onEdited }: Props) {
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);
  const [editContent, setEditContent] = useState(comment.content);
  const [editing, setEditing] = useState(false);

  async function handleDelete(password: string) {
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "오류가 발생했습니다.");
    }
    setModal(null);
    onDeleted(comment.id);
  }

  async function handleEditConfirm(password: string) {
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, content: editContent }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "오류가 발생했습니다.");
    setModal(null);
    setEditing(false);
    onEdited(data);
  }

  return (
    <>
      <div className="py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-800">{comment.nickname}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(true); setModal("edit"); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              수정
            </button>
            <button
              onClick={() => setModal("delete")}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              삭제
            </button>
          </div>
        </div>
        {editing && modal === "edit" ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={300}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
        )}
      </div>

      {modal === "delete" && (
        <PasswordModal
          title="댓글을 삭제하시겠습니까?"
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
    </>
  );
}
