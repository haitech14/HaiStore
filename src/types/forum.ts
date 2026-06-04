export interface ForumAuthor {
  id: string;
  name: string;
  email: string;
  forumPoints: number;
  forumLevel: number;
  forumTitle: string | null;
}

export interface ForumCategorySummary {
  slug: string;
  name: string;
  iconKey: string;
  accentClass: string;
}

export interface ForumCategory extends ForumCategorySummary {
  id: string;
  description: string;
  sortOrder: number;
  threadCount: number;
}

export interface ForumThread {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  viewCount: number;
  replyCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastReplyAt: string | null;
  category: ForumCategorySummary | null;
  author: ForumAuthor | null;
  lastReplyAuthor: ForumAuthor | null;
}

export interface ForumReply {
  id: string;
  body: string;
  createdAt: string;
  author: ForumAuthor | null;
}

export interface ForumStats {
  members: number;
  topics: number;
  replies: number;
}

export interface ForumPopularTopic {
  rank: number;
  slug: string;
  title: string;
  replyCount: number;
}

export interface ForumEvent {
  id: string;
  title: string;
  startsAt: string;
  location: string;
}

export interface ForumLatestPost {
  id: string;
  createdAt: string;
  excerpt: string;
  authorName: string;
  threadSlug: string;
  threadTitle: string;
}

export type ForumSortValue = 'recent' | 'popular';

export interface ForumMember extends ForumAuthor {
  joinedAt?: string;
  rank?: number;
}
