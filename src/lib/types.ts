export interface Post {
  id: number;
  nickname: string;
  content: string;
  content_preview?: string;
  like_count: number;
  view_count: number;
  comment_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
}
