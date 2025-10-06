"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import CommentList from "@/components/CommentList";
import NewCommentForm from "@/components/NewCommentForm";
import NewStatusForm from "@/components/NewStatusForm";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { sortPostsByDate } from "@/lib/feed";
import type { StatusPost } from "@/types/feed";

interface StatusListResponse {
  data?: StatusPost[];
}

interface SingleStatusResponse {
  data?: StatusPost;
  message?: string;
}

const FeedPage = () => {
  const { token, profile } = useAuth();
  const [posts, setPosts] = useState<StatusPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [processingCommentId, setProcessingCommentId] = useState<string | null>(
    null,
  );
  const [creatingCommentFor, setCreatingCommentFor] = useState<string | null>(
    null,
  );

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
      const response = await apiFetch<StatusListResponse>("/status", {
        token,
      });
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

    if (response.data && response.data._id) {
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
          prev.map((post) =>
            post._id === response.data?._id ? (response.data as StatusPost) : post,
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
      if (response.data && response.data._id) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === response.data?._id ? (response.data as StatusPost) : post,
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
      if (response.data && response.data._id) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === response.data?._id ? (response.data as StatusPost) : post,
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

  const feedContent = useMemo(() => {
    if (!token) {
      return (
        <div className="info-banner">
          <p>
            กรุณา <Link href="/login">เข้าสู่ระบบ</Link> เพื่อดูและโพสต์สถานะ
          </p>
        </div>
      );
    }

    if (isLoading) {
      return <p className="loading-text">กำลังโหลดฟีด...</p>;
    }

    if (error) {
      return <p className="form-error">{error}</p>;
    }

    if (!posts.length) {
      return <div className="feed-empty">ยังไม่มีโพสต์ในขณะนี้</div>;
    }

    return (
      <div className="feed-list" aria-live="polite">
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
                    <span>{post.likeCount ?? post.like?.length ?? 0}</span>
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
  }, [
    token,
    isLoading,
    error,
    posts,
    processingPostId,
    currentUserId,
    creatingCommentFor,
    processingCommentId,
    computeHasLiked,
  ]);

  return (
    <main className="page-container feed-page">
      <header className="feed-header">
        <h1>ฟีดสถานะ</h1>
        <p>ดูโพสต์ล่าสุดจากเพื่อน ๆ และร่วมพูดคุยได้ที่นี่</p>
      </header>

      {token ? (
        <section className="feed-actions">
          <NewStatusForm onSubmit={handleCreateStatus} />
        </section>
      ) : (
        <div className="info-banner">
          <p>
            กรุณา <Link href="/login">เข้าสู่ระบบ</Link> ก่อนเพื่อมีส่วนร่วมกับฟีดนี้
          </p>
        </div>
      )}

      {feedContent}
    </main>
  );
};

export default FeedPage;
