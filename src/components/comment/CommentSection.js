"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { FaSpinner } from "react-icons/fa";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?postId=${postId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleNewComment = (newComment) => {
    // Add new comment to the top of the list
    setComments((prev) => [newComment, ...prev]);
  };

  const handleNewReply = (parentId, newReply) => {
    // Find the parent comment and add the reply
    setComments((prev) => {
      return prev.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
            _count: {
              ...comment._count,
              replies: (comment._count.replies || 0) + 1,
            },
          };
        }
        return comment;
      });
    });
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      {user && (
        <div className="mb-6">
          <CommentForm postId={postId} onCommentSubmitted={handleNewComment} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="text-gray-400 animate-spin text-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
          {!user && (
            <p className="mt-2 text-sm">
              <a href="/auth/login" className="text-blue-500 hover:underline">
                Log in
              </a>{" "}
              to leave a comment.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplySubmitted={(newReply) =>
                handleNewReply(comment.id, newReply)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
