import type { DefaultSkin } from "./constants.ts";

export type CommentStatus = "published" | "pending" | "rejected" | "deleted";

export interface CommentRecord {
  id: string;
  postSlug: string;
  authorCode: string;
  avatar: DefaultSkin;
  nickname: string;
  body: string;
  status: CommentStatus;
  riskScore: number;
  createdAt: string;
  moderatedAt: string;
  moderationReason: string;
  reportCount: number;
}

export interface PublicComment {
  id: string;
  authorCode: string;
  avatar: DefaultSkin;
  nickname: string;
  body: string;
  createdAt: string;
  reportCount: number;
}

export interface ViewerIdentity {
  authorCode: string;
  avatar: DefaultSkin;
}

export type ModerationAction = "approve" | "reject" | "delete";

export interface ModerationTokenRecord {
  commentId: string;
  action: ModerationAction;
  expiresAt: string;
}
