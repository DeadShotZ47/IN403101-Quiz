export interface AuthorInfo {
  _id: string;
  email: string;
  image?: string;
  name?: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdBy: AuthorInfo | string;
  like: AuthorInfo[] | string[];
  createdAt: string;
  updatedAt?: string;
}

export interface StatusPost {
  _id: string;
  content: string;
  createdBy: AuthorInfo | string;
  like: Array<AuthorInfo | string>;
  likeCount?: number;
  hasLiked?: boolean;
  comment: Comment[];
  createdAt: string;
  updatedAt?: string;
}
