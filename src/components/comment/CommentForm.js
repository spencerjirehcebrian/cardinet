"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import Button from "@/components/ui/Button";
import { FaReply } from "react-icons/fa";

export default function CommentForm({
  postId,
  parentId = null,
  onCommentSubmitted,
  isReply = false,
}) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (!postId) {
      setError("Post ID is missing");
      console.error("CommentForm error: postId is required but not provided");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare the request body
      const requestBody = {
        content: content.trim(),
        postId,
      };

      // Only include parentId if it has a value
      if (parentId) {
        requestBody.parentId = parentId;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit comment");
      }

      setContent("");

      if (onCommentSubmitted && data.comment) {
        onCommentSubmitted(data.comment);
      }
    } catch (err) {
      console.error("Comment submission error:", err);
      setError(err.message || "Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isReply
              ? "What are your thoughts on this comment?"
              : "What are your thoughts?"
          }
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={isReply ? 3 : 4}
          disabled={isSubmitting}
        />
        {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant={isReply ? "secondary" : "primary"}
          disabled={isSubmitting || !content.trim()}
          isLoading={isSubmitting}
          icon={isReply ? <FaReply /> : null}
        >
          {isReply ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
