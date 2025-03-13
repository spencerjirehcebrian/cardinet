"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import { FaArrowUp, FaArrowDown, FaComments, FaShare } from "react-icons/fa";

export default function PostItem({ post, isDetailView = false }) {
  const { user } = useAuth();
  const [voteStatus, setVoteStatus] = useState(0); // -1 for downvote, 0 for no vote, 1 for upvote
  const [voteScore, setVoteScore] = useState(0); // Actual score (upvotes - downvotes)
  const [loading, setLoading] = useState(false);

  // Calculate initial vote score and fetch user's vote status
  useEffect(() => {
    // Initialize with post's vote count if available
    if (post.score !== undefined) {
      // If the API returns a pre-calculated score
      setVoteScore(post.score);
    } else if (post._count && post._count.votes !== undefined) {
      // We'll still need to get the actual vote score from the API
      fetchPostScore();
    }

    // Only fetch vote status if user is logged in
    if (user) {
      fetchVoteStatus();
    }
  }, [post.id, user]);

  // Function to fetch the post's actual vote score
  const fetchPostScore = async () => {
    try {
      const response = await fetch(`/api/votes/score?postId=${post.id}`);
      if (response.ok) {
        const data = await response.json();
        setVoteScore(data.score || 0);
      }
    } catch (error) {
      console.error("Error fetching post score:", error);
    }
  };

  // Fetch the user's vote status
  const fetchVoteStatus = async () => {
    if (!user) return; // Only fetch if user is logged in

    try {
      setLoading(true);
      const response = await fetch(`/api/votes/status?postId=${post.id}`);

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
          postId: post.id,
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
      // You could show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const groupLink = `/group/${post.group.name}`;
  const postLink = `${groupLink}/comments/${post.id}`;

  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow">
      {/* Vote buttons (sidebar) */}
      <div className="flex">
        <div className="bg-gray-50 p-2 rounded-l-md flex flex-col items-center w-12">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded-sm hover:bg-gray-200 ${
              voteStatus === 1 ? "text-orange-500" : "text-gray-500"
            }`}
            aria-label="Upvote"
            disabled={loading}
          >
            <FaArrowUp />
          </button>

          <span
            className={`text-xs font-bold my-1 ${
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
            <FaArrowDown />
          </button>
        </div>

        {/* Post content */}
        <div className="p-3 flex-grow">
          {/* Post header */}
          <div className="text-xs text-gray-500 mb-2">
            <Link
              href={groupLink}
              className="flex items-center text-xs hover:underline mr-1"
            >
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1">
                {/* Replace FaReddit with your custom logo icon */}
                <Image
                  src="/logo-icon.png"
                  alt="Group"
                  width={10}
                  height={10}
                  className="text-white text-xs"
                />
              </div>
              <span className="font-medium hover:underline">
                {post.group.name}
              </span>
            </Link>
            <span className="text-gray-500">
              • Posted by{" "}
              <Link
                href={`/user/${post.author.username}`}
                className="hover:underline"
              >
                {post.author.username}
              </Link>{" "}
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* Post title */}
          <h2 className="text-lg font-medium mb-2">
            {isDetailView ? (
              post.title
            ) : (
              <Link href={postLink} className="hover:underline">
                {post.title}
              </Link>
            )}
          </h2>

          {/* Post content (optional - shown in detail view or if expanded) */}
          {(isDetailView || post.content) && (
            <div className="text-gray-800 mb-3 whitespace-pre-line">
              {post.content && post.content.length > 300 && !isDetailView ? (
                <>
                  {post.content.substring(0, 300)}...{" "}
                  <Link
                    href={postLink}
                    className="text-blue-500 hover:underline"
                  >
                    See More
                  </Link>
                </>
              ) : (
                post.content
              )}
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center text-gray-500 text-sm mt-2">
            <Link
              href={postLink}
              className="flex items-center mr-4 hover:bg-gray-100 p-1 rounded"
            >
              <FaComments className="mr-1" />
              <span>{post._count?.comments || 0} Comments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>  );
}
