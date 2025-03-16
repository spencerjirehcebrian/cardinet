// src/components/post/PostList.js - Updated version
"use client";

import { useState, useEffect } from "react";
import PostItem from "./PostItem";
import { FaSpinner } from "react-icons/fa";
import LoadMoreButton from "../ui/LoadMoreButton"; // Import the new component

export default function PostList({ groupId = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (groupId) {
        queryParams.append("groupId", groupId);
      }

      const response = await fetch(`/api/posts?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, groupId]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !loading) {
      // Set loading state first to prevent multiple clicks
      setLoading(true);

      // Update the page number
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));

      // The fetch will be triggered by the useEffect watching for page changes

      // After new posts are loaded, scroll to where they start
      setTimeout(() => {
        const loadMoreContainer = document.getElementById(
          "load-more-container"
        );
        if (loadMoreContainer) {
          const scrollPosition =
            loadMoreContainer.offsetTop - window.innerHeight + 200;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }, 1000); // Give time for posts to render
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="text-2xl text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">No posts yet</h2>
        <p className="text-gray-600 mb-4">
          Be the first to start a discussion in this group.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      {/* Replace the old button with the new LoadMoreButton component */}
      <LoadMoreButton
        onClick={handleLoadMore}
        isLoading={loading}
        hasMore={pagination.page < pagination.totalPages}
      />
    </div>
  );
}
