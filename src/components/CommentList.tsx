"use client";

import { useMemo } from "react";

import type { Comment } from "@/types/feed";

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  onDelete?: (commentId: string, statusId: string) => void;
  statusId: string;
  disabledCommentId?: string | null;
}

const formatDate = (value: string) => {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (error) {
    return value;
  }
};

const CommentList = ({
  comments,
  currentUserId,
  onDelete,
  statusId,
  disabledCommentId,
}: CommentListProps) => {
  const items = useMemo(() => comments ?? [], [comments]);

  if (items.length === 0) {
    return <p className="empty-text">ยังไม่มีคอมเมนต์</p>;
  }

  return (
    <ul className="comment-list">
      {items.map((comment) => {
        const creator =
          typeof comment.createdBy === "string"
            ? { _id: comment.createdBy, email: "" }
            : comment.createdBy;

        const isOwner =
          currentUserId && creator?._id && creator._id === currentUserId;
        const isDisabled = disabledCommentId === comment._id;

        return (
          <li key={comment._id} className="comment-item">
            <div className="comment-bubble">
              <header className="comment-header">
                <strong>{creator?.email || "ไม่ระบุชื่อ"}</strong>
                <time dateTime={comment.createdAt}>
                  {formatDate(comment.createdAt)}
                </time>
              </header>
              <p>{comment.content}</p>
            </div>
            {isOwner && onDelete ? (
              <button
                type="button"
                className="btn btn-text"
                onClick={() => onDelete(comment._id, statusId)}
                disabled={isDisabled}
              >
                {isDisabled ? "กำลังลบ..." : "ลบ"}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default CommentList;
