"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { FaComment } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function CommentSection({ postId, groupName }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    if (!postId) return;

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

  // Handle a new top-level comment
  const handleNewComment = (newComment) => {
    // Add new comment to the top of the list
    setComments((prev) => [
      {
        ...newComment,
        replies: [],
        _count: { replies: 0 },
      },
      ...prev,
    ]);
  };

  // This function recursively updates the comment tree to add a reply
  // to the correct parent comment
  const updateRepliesRecursively = (comments, targetParentId, newReply) => {
    return comments.map((comment) => {
      // If this is the target parent comment, add the reply to it
      if (comment.id === targetParentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            { ...newReply, replies: [], _count: { replies: 0 } },
          ],
          _count: {
            ...comment._count,
            replies: (comment._count?.replies || 0) + 1,
          },
        };
      }

      // If this comment has replies, recursively check them
      if (comment.replies && comment.replies.length > 0) {
        const updatedReplies = updateRepliesRecursively(
          comment.replies,
          targetParentId,
          newReply
        );

        // Only update this comment if one of its replies changed
        if (
          JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)
        ) {
          return {
            ...comment,
            replies: updatedReplies,
          };
        }
      }

      // Return unchanged if not the target and no child replies were changed
      return comment;
    });
  };

  // Handle a reply to any comment (top-level or nested)
  const handleReply = (parentId, newReply) => {
    setComments((prevComments) =>
      updateRepliesRecursively(prevComments, parentId, newReply)
    );
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <FaComment className="mr-2 text-gray-600" />
        Comments
      </h2>

      {user && (
        <div className="mb-6">
          <CommentForm postId={postId} onCommentSubmitted={handleNewComment} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Button isLoading>Loading comments</Button>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
          {!user && (
            <p className="mt-2 text-sm">
              <Button href="/auth/login" variant="link">
                Log in
              </Button>{" "}
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
              groupName={groupName}
              onReplySubmitted={handleReply}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
