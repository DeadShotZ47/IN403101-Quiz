import type { StatusPost } from "@/types/feed";

export interface FeedState {
  posts: StatusPost[];
  isLoading: boolean;
  error: string | null;
}

export const sortPostsByDate = (posts: StatusPost[]) => {
  return [...posts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
