import type { DefaultSkin } from "./constants.ts";

export type CommentStatus = "published" | "pending" | "rejected" | "deleted";

export interface CommentRecord {
  id: string;
  postSlug: string;
  authorIdentityHash: string;
  authorCode: string;
  avatar: DefaultSkin;
  nickname: string;
  body: string;
  status: CommentStatus;
  riskScore: number;
  createdAt: string;
  editedAt: string;
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
  editedAt: string;
  reportCount: number;
  canDelete: boolean;
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
