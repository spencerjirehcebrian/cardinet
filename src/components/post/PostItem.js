"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import { FaArrowUp, FaArrowDown, FaComments, FaShare } from "react-icons/fa";

export default function PostItem({ post, isDetailView = false }) {
  const { user } = useAuth();
  const [voteStatus, setVoteStatus] = useState(0); // -1 for downvote, 0 for no vote, 1 for upvote
  const [voteCount, setVoteCount] = useState(
    post._count ? post._count.votes : 0
  );

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
          postId: post.id,
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
      // You could show a toast notification here
    }
  };

  const communityLink = `/r/${post.community.name}`;
  const postLink = `${communityLink}/comments/${post.id}`;

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
            {voteCount}
          </span>

          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded-sm hover:bg-gray-200 ${
              voteStatus === -1 ? "text-blue-500" : "text-gray-500"
            }`}
            aria-label="Downvote"
          >
            <FaArrowDown />
          </button>
        </div>

        {/* Post content */}
        <div className="p-3 flex-grow">
          {/* Post header */}
          <div className="text-xs text-gray-500 mb-2">
            <Link
              href={communityLink}
              className="flex items-center text-xs hover:underline mr-1"
            >
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1">
                {/* Replace FaReddit with your custom logo icon */}
                <Image
                  src="/logo-icon.png"
                  alt="Community"
                  width={10}
                  height={10}
                  className="text-white text-xs"
                />
              </div>
              <span className="font-medium hover:underline">
                r/{post.community.name}
              </span>
            </Link>
            <span className="text-gray-500">
              • Posted by{" "}
              <Link
                href={`/user/${post.author.username}`}
                className="hover:underline"
              >
                u/{post.author.username}
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

            <button className="flex items-center mr-4 hover:bg-gray-100 p-1 rounded">
              <FaShare className="mr-1" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
