import Link from "next/link";
import { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  return (
    <Link href={`/posts/${post.id}`}>
      <article className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-yellow-200 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-800">{post.nickname}</span>
          <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
        </div>
        <p className="text-gray-700 text-sm line-clamp-2 whitespace-pre-line mb-3">
          {post.content_preview ?? post.content}
        </p>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>💬 {post.comment_count ?? 0}</span>
          <span>❤️ {post.like_count}</span>
          <span>👁 {post.view_count}</span>
        </div>
      </article>
    </Link>
  );
}
