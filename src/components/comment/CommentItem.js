"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import CommentForm from "./CommentForm";
import { FaArrowUp, FaArrowDown, FaReply } from "react-icons/fa";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";

export default function CommentItem({
  comment,
  postId,
  groupName,
  onReplySubmitted,
  depth = 0,
}) {
  const { user } = useAuth();
  const [voteStatus, setVoteStatus] = useState(0);
  const [voteScore, setVoteScore] = useState(0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with comment's vote count if available
    if (comment.score !== undefined) {
      setVoteScore(comment.score);
    } else {
      // Fetch the score
      fetchCommentScore();
    }

    // Only fetch vote status if user is logged in
    if (user) {
      fetchVoteStatus();
    }
  }, [comment.id, user]);

  // Function to fetch the comment's actual vote score
  const fetchCommentScore = async () => {
    try {
      const response = await fetch(`/api/votes/score?commentId=${comment.id}`);
      if (response.ok) {
        const data = await response.json();
        setVoteScore(data.score || 0);
      }
    } catch (error) {
      console.error("Error fetching comment score:", error);
    }
  };

  // Fetch the user's vote status
  const fetchVoteStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/votes/status?commentId=${comment.id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.vote) {
          setVoteStatus(data.vote.value);
        }
      }
    } catch (error) {
      console.error("Error fetching vote status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login";
      return;
    }

    // If clicking the same vote button, remove the vote
    const newValue = voteStatus === value ? 0 : value;

    try {
      setLoading(true);

      // Optimistically update UI for better user experience
      const voteChange = newValue - voteStatus;
      setVoteStatus(newValue);
      setVoteScore((prevScore) => prevScore + voteChange);

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
        // Revert the optimistic update if the API call fails
        setVoteStatus(voteStatus);
        setVoteScore((prevScore) => prevScore - voteChange);
        throw new Error("Failed to register vote");
      }

      // API call succeeded - no need to revert optimistic update
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReplySubmitted = (newReply) => {
    // Pass the comment's ID as the parentId
    if (onReplySubmitted) {
      onReplySubmitted(comment.id, newReply);
      setShowReplyForm(false);
    }
  };

  // Updated visual indicator for deeper nesting
  const getIndentColor = () => {
    const colors = [
      "border-gray-300",
      "border-blue-100",
      "border-green-100",
      "border-yellow-100",
      "border-purple-100",
      "border-pink-100",
      "border-indigo-100",
      "border-red-100",
    ];

    return colors[depth % colors.length];
  };

  return (
    <div className={`border-l-2 ${getIndentColor()} pl-3`}>
      <div className="flex items-start space-x-2">
        {/* Vote buttons */}
        <div className="flex flex-col items-center pt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded-sm hover:bg-gray-200 ${
              voteStatus === 1 ? "text-orange-500" : "text-gray-500"
            }`}
            aria-label="Upvote"
            disabled={loading}
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
            {voteScore}
          </span>

          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded-sm hover:bg-gray-200 ${
              voteStatus === -1 ? "text-blue-500" : "text-gray-500"
            }`}
            aria-label="Downvote"
            disabled={loading}
          >
            <FaArrowDown className="text-xs" />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-grow">
          {/* Comment header with user image and username first */}
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Link
              href={`/user/${comment.author.username}`}
              className="flex items-center mr-2"
            >
              <UserAvatar username={comment.author.username} size={28} />
              <span className="font-medium text-gray-900 hover:underline pl-1">
                {comment.author.username}
              </span>
            </Link>
            <span className="mx-1">•</span>
            <span>{formatRelativeTime(comment.createdAt)}</span>
            {depth > 0 && (
              <span className="mx-1 text-xs text-gray-400">
                • Depth: {depth}
              </span>
            )}
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
                  <Button
                    onClick={toggleReplyForm}
                    variant="ghost"
                    size="sm"
                    icon={<FaReply />}
                  >
                    Reply
                  </Button>
                )}
              </div>

              {/* Reply form - note that the parentId is this comment's ID */}
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

              {/* Nested replies - now with unlimited nesting */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      groupName={groupName}
                      onReplySubmitted={onReplySubmitted}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
