"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import CommentForm from "./CommentForm";
import { FaArrowUp, FaArrowDown, FaReply } from "react-icons/fa";

export default function CommentItem({
  comment,
  postId,
  onReplySubmitted,
  depth = 0,
}) {
  const { user } = useAuth();
  const [voteStatus, setVoteStatus] = useState(0);
  const [voteCount, setVoteCount] = useState(
    comment._count ? comment._count.votes || 0 : 0
  );
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleVote = async (value) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login";
      return;
    }

    // If clicking the same vote button, remove the vote
    const newValue = voteStatus === value ? 0 : value;

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: newValue,
          commentId: comment.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register vote");
      }

      // Update UI state
      const voteChange = newValue - voteStatus;
      setVoteStatus(newValue);
      setVoteCount((prevCount) => prevCount + voteChange);
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReplySubmitted = (newReply) => {
    onReplySubmitted(newReply);
    setShowReplyForm(false);
  };

  // Max nesting level
  const maxDepth = 5;

  return (
    <div
      className={`border-l-2 ${
        depth % 2 === 0 ? "border-gray-300" : "border-blue-100"
      } pl-3`}
    >
      <div className="flex items-start space-x-2">
        {/* Vote buttons */}
        <div className="flex flex-col items-center pt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded-sm hover:bg-gray-200 ${
              voteStatus === 1 ? "text-orange-500" : "text-gray-500"
            }`}
            aria-label="Upvote"
          >
            <FaArrowUp className="text-xs" />
          </button>

          <span
            className={`text-xs font-medium my-0.5 ${
              voteStatus === 1
                ? "text-orange-500"
                : voteStatus === -1
                ? "text-blue-500"
                : "text-gray-800"
            }`}
          >
            {voteCount}
          </span>

          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded-sm hover:bg-gray-200 ${
              voteStatus === -1 ? "text-blue-500" : "text-gray-500"
            }`}
            aria-label="Downvote"
          >
            <FaArrowDown className="text-xs" />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-grow">
          {/* Comment header */}
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Link
              href={`/user/${comment.author.username}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {comment.author.username}
            </Link>
            <span className="mx-1">•</span>
            <span>{formatRelativeTime(comment.createdAt)}</span>

            <button
              onClick={toggleExpanded}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              [{isExpanded ? "−" : "+"}]
            </button>
          </div>

          {/* Comment body */}
          {isExpanded && (
            <>
              <div className="text-sm text-gray-800 mb-2">
                {comment.content}
              </div>

              {/* Comment actions */}
              <div className="flex items-center text-xs text-gray-500 mb-2">
                {user && (
                  <button
                    onClick={toggleReplyForm}
                    className="flex items-center hover:bg-gray-100 p-1 rounded"
                  >
                    <FaReply className="mr-1" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {/* Reply form */}
              {showReplyForm && (
                <div className="my-2">
                  <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    onCommentSubmitted={handleReplySubmitted}
                    isReply
                  />
                </div>
              )}

              {/* Nested replies */}
              {comment.replies &&
                comment.replies.length > 0 &&
                depth < maxDepth && (
                  <div className="mt-2 space-y-3">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        onReplySubmitted={(newReply) => {
                          // We need to update the parent's replies
                          const updatedReplies = [...comment.replies];
                          const replyIndex = updatedReplies.findIndex(
                            (r) => r.id === reply.id
                          );
                          if (replyIndex >= 0) {
                            updatedReplies[replyIndex] = {
                              ...updatedReplies[replyIndex],
                              replies: [
                                ...(updatedReplies[replyIndex].replies || []),
                                newReply,
                              ],
                              _count: {
                                ...updatedReplies[replyIndex]._count,
                                replies:
                                  (updatedReplies[replyIndex]._count?.replies ||
                                    0) + 1,
                              },
                            };
                            onReplySubmitted({
                              ...comment,
                              replies: updatedReplies,
                            });
                          }
                        }}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                )}

              {/* Show "Continue thread" link for deeply nested comments */}
              {comment.replies &&
                comment.replies.length > 0 &&
                depth >= maxDepth && (
                  <Link
                    href={`/r/${post.community.name}/comments/${postId}/${comment.id}`}
                    className="inline-block mt-2 text-sm text-blue-500 hover:underline"
                  >
                    Continue this thread →
                  </Link>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
