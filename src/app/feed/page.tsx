"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import CommentList from "@/components/CommentList";
import NewCommentForm from "@/components/NewCommentForm";
import NewStatusForm from "@/components/NewStatusForm";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { sortPostsByDate } from "@/lib/feed";
import type { Comment, StatusPost } from "@/types/feed";
import "./feed.css";

interface StatusListResponse {
  data?: StatusPost[];
}

interface SingleStatusResponse {
  data?: StatusPost;
  message?: string;
}

const mergeComment = (prevComment: Comment | undefined, incoming: Comment): Comment => ({
  ...prevComment,
  ...incoming,
  createdBy:
    typeof incoming.createdBy === "string" && prevComment?.createdBy
      ? prevComment.createdBy
      : incoming.createdBy,
});

const mergePost = (prevPost: StatusPost | undefined, incoming: StatusPost): StatusPost => ({
  ...prevPost,
  ...incoming,
  createdBy:
    typeof incoming.createdBy === "string" && prevPost?.createdBy
      ? prevPost.createdBy
      : incoming.createdBy,
  comment: incoming.comment?.map((incomingComment) =>
    mergeComment(prevPost?.comment?.find((c) => c._id === incomingComment._id), incomingComment),
  ) ?? prevPost?.comment ?? [],
});

const FeedPage = () => {
  const { token, profile } = useAuth();
  const [posts, setPosts] = useState<StatusPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [processingCommentId, setProcessingCommentId] = useState<string | null>(null);
  const [creatingCommentFor, setCreatingCommentFor] = useState<string | null>(null);

  const currentUserId = profile?._id ?? null;

  const fetchPosts = useCallback(async () => {
    if (!token) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<StatusListResponse>("/status", { token });
      const nextPosts = sortPostsByDate(response.data ?? []);
      setPosts(nextPosts);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดฟีดได้ กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const computeHasLiked = useCallback(
    (post: StatusPost) => {
      if (post.hasLiked !== undefined) {
        return Boolean(post.hasLiked);
      }
      if (!currentUserId) {
        return false;
      }
      return (post.like ?? []).some((item) => {
        if (!item) {
          return false;
        }
        if (typeof item === "string") {
          return item === currentUserId;
        }
        return item._id === currentUserId;
      });
    },
    [currentUserId],
  );

  const handleOptimisticLike = useCallback(
    (statusId: string, nextLiked: boolean) => {
      if (!currentUserId) {
        return;
      }

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== statusId) {
            return post;
          }

          const likeSet = new Set<string>();
          (post.like ?? []).forEach((item) => {
            if (!item) {
              return;
            }
            if (typeof item === "string") {
              likeSet.add(item);
            } else if (item._id) {
              likeSet.add(item._id);
            }
          });

          if (nextLiked) {
            likeSet.add(currentUserId);
          } else {
            likeSet.delete(currentUserId);
          }

          const likeIds = Array.from(likeSet);

          return {
            ...post,
            hasLiked: nextLiked,
            like: likeIds,
            likeCount: likeIds.length,
          };
        }),
      );
    },
    [currentUserId],
  );

  const handleCreateStatus = async (content: string) => {
    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนโพสต์");
    }

    const response = await apiFetch<SingleStatusResponse>("/status", {
      method: "POST",
      token,
      body: JSON.stringify({ content }),
    });

    if (response.data) {
      setPosts((prev) => sortPostsByDate([response.data as StatusPost, ...prev]));
    } else {
      await fetchPosts();
    }
  };

  const handleDeleteStatus = async (postId: string) => {
    if (!token) {
      return;
    }

    setProcessingPostId(postId);
    try {
      await apiFetch(`/status/${postId}`, {
        method: "DELETE",
        token,
      });
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (deleteError) {
      console.error(deleteError);
      alert("ลบโพสต์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setProcessingPostId(null);
    }
  };

  const handleLike = async (statusId: string) => {
    if (!token) {
      return;
    }

    const targetPost = posts.find((item) => item._id === statusId);
    const isCurrentlyLiked = targetPost ? computeHasLiked(targetPost) : false;

    if (currentUserId) {
      handleOptimisticLike(statusId, !isCurrentlyLiked);
    }

    setProcessingPostId(statusId);
    try {
      const response = await apiFetch<SingleStatusResponse>("/like", {
        method: isCurrentlyLiked ? "DELETE" : "POST",
        token,
        body: JSON.stringify({ statusId }),
      });

      if (response.data && response.data._id) {
        setPosts((prev) =>
          sortPostsByDate(
            prev.map((post) =>
              post._id === response.data?._id
                ? mergePost(
                    post,
                    response.data as StatusPost,
                  )
                : post,
            ),
          ),
        );
      } else {
        await fetchPosts();
      }
    } catch (likeError) {
      console.error(likeError);
      alert("ไม่สามารถอัปเดตสถานะการถูกใจได้ กรุณาลองใหม่");
      if (currentUserId) {
        handleOptimisticLike(statusId, isCurrentlyLiked);
      }
    } finally {
      setProcessingPostId(null);
    }
  };

  const handleCreateComment = async (statusId: string, content: string) => {
    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนคอมเมนต์");
    }

    setCreatingCommentFor(statusId);
    try {
      const response = await apiFetch<SingleStatusResponse>("/comment", {
        method: "POST",
        token,
        body: JSON.stringify({ statusId, content }),
      });
      if (response.data) {
        setPosts((prev) =>
          sortPostsByDate(
            prev.map((post) =>
              post._id === response.data?._id
                ? mergePost(post, response.data as StatusPost)
                : post,
            ),
          ),
        );
      } else {
        await fetchPosts();
      }
    } finally {
      setCreatingCommentFor(null);
    }
  };

  const handleDeleteComment = async (commentId: string, statusId: string) => {
    if (!token) {
      return;
    }

    setProcessingCommentId(commentId);
    try {
      const response = await apiFetch<SingleStatusResponse>(
        `/comment/${commentId}`,
        {
          method: "DELETE",
          token,
          body: JSON.stringify({ statusId }),
        },
      );
      if (response.data) {
        setPosts((prev) =>
          sortPostsByDate(
            prev.map((post) =>
              post._id === response.data?._id
                ? mergePost(post, response.data as StatusPost)
                : post,
            ),
          ),
        );
      } else {
        await fetchPosts();
      }
    } catch (deleteError) {
      console.error(deleteError);
      alert("ลบคอมเมนต์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setProcessingCommentId(null);
    }
  };

  let bodyContent: JSX.Element;

  if (!token) {
    bodyContent = (
      <div className="feed-empty-card">
        กรุณา <Link href="/login">เข้าสู่ระบบ</Link> ก่อนเพื่อใช้งานฟีดสถานะ
      </div>
    );
  } else if (isLoading) {
    bodyContent = <div className="feed-empty-card">กำลังโหลดฟีด...</div>;
  } else if (error) {
    bodyContent = <div className="feed-error-card">{error}</div>;
  } else if (!posts.length) {
    bodyContent = <div className="feed-empty-card">ยังไม่มีโพสต์ในขณะนี้</div>;
  } else {
    bodyContent = (
      <div className="feed-posts" aria-live="polite">
        {posts.map((post) => {
          const creator =
            typeof post.createdBy === "string"
              ? { _id: post.createdBy, email: "ไม่ระบุ" }
              : post.createdBy;
          const liked = computeHasLiked(post);
          const isProcessing = processingPostId === post._id;

          return (
            <article key={post._id} className="feed-card">
              <header>
                <strong>{creator?.email ?? "ไม่ระบุชื่อ"}</strong>
                <time className="feed-meta" dateTime={post.createdAt}>
                  {new Intl.DateTimeFormat("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(post.createdAt))}
                </time>
              </header>
              <p className="feed-content">{post.content}</p>

              <footer className="feed-footer">
  <div className="feed-actions-row">
    <button
      type="button"
      data-active={liked}
      onClick={() => handleLike(post._id)}
      disabled={isProcessing}
    >
      {liked ? "เลิกถูกใจ" : "ถูกใจ"}
      <span className="feed-like-count">{post.likeCount ?? post.like?.length ?? 0}</span>
    </button>

    {creator?._id === currentUserId ? (
      <button
        type="button"
        onClick={() => handleDeleteStatus(post._id)}
        disabled={isProcessing}
      >
        ลบโพสต์
      </button>
    ) : null}

  {/* ✅ ปิด feed-actions-row ตรงนี้ */}
  </div>

                <CommentList
                  comments={post.comment ?? []}
                  currentUserId={currentUserId}
                  statusId={post._id}
                  onDelete={currentUserId ? handleDeleteComment : undefined}
                  disabledCommentId={processingCommentId}
                />

                <NewCommentForm
                  onSubmit={(value) => handleCreateComment(post._id, value)}
                  isSubmitting={creatingCommentFor === post._id}
                />
              </footer>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <main className="feed-shell">
      <section className="feed-hero">
        <h1>ฟีดสถานะ</h1>
        <p>แบ่งปันสิ่งที่อยู่ในใจ พูดคุยกับเพื่อนร่วมรุ่น และติดตามความเคลื่อนไหวได้ในที่เดียว</p>
        <div className="feed-hero-actions">
          <Link href="/">กลับหน้าหลัก</Link>
        </div>
      </section>

      {token ? (
        <section className="feed-composer">
          <header>
            <h2>โพสต์ข้อความถึงเพื่อน ๆ</h2>
            <span>ส่งกำลังใจหรือแจ้งข่าวคราวให้ทุกคนรับรู้</span>
          </header>
          <NewStatusForm onSubmit={handleCreateStatus} />
        </section>
      ) : null}

      <section className="feed-body">{bodyContent}</section>
    </main>
  );
};

export default FeedPage;
