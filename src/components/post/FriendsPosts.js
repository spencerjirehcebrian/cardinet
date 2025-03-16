// src/components/post/FriendsPosts.js - Updated version
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostItem from "@/components/post/PostItem";
import { useAuth } from "@/components/auth/AuthContext";
import { FaSpinner, FaUserFriends, FaPlus } from "react-icons/fa";
import Button from "../ui/Button";
import LoadMoreButton from "../ui/LoadMoreButton"; // Import the new component

export default function FriendsPosts() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const fetchFriends = async () => {
    if (!isAuthenticated) {
      setLoadingFriends(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setFriends(userData.friends || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchPosts = async (resetPage = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const page = resetPage ? 1 : pagination.page;

      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
      });

      const response = await fetch(`/api/posts/friends?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch friends' posts");
      }

      const data = await response.json();

      if (resetPage) {
        setPosts(data.posts);
      } else {
        // Filter out any duplicates using Set
        const seenIds = new Set(posts.map((post) => post.id));
        const uniquePosts = data.posts.filter((post) => !seenIds.has(post.id));

        setPosts((prev) => [...prev, ...uniquePosts]);

        // If we got no new unique posts, try to load the next page automatically
        if (
          uniquePosts.length === 0 &&
          pagination.page < data.pagination.totalPages
        ) {
          setTimeout(() => {
            setPagination((prev) => ({
              ...prev,
              page: prev.page + 1,
            }));
          }, 300); // Small delay to prevent immediate re-fetch
        }
      }

      setPagination((prev) => ({
        ...prev,
        page: page,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err) {
      console.error("Error fetching friends' posts:", err);
      setError(
        "Failed to load posts from your friends. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetchPosts when pagination.page changes
  useEffect(() => {
    if (pagination.page > 1) {
      fetchPosts(false);
    }
  }, [pagination.page]);

  // Initial load and when user authentication changes
  useEffect(() => {
    fetchFriends();
    fetchPosts(true);
  }, [isAuthenticated, user]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !loading) {
      // Set loading state first to prevent multiple clicks
      setLoading(true);

      // Update the page number
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));

      // Fetch posts will be triggered by the useEffect when page changes
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

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-md shadow-sm p-6 text-center">
        <FaUserFriends className="mx-auto text-4xl text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Friends Feed</h1>
        <p className="text-gray-600 mb-4">
          You need to be logged in to view posts from your friends.
        </p>
        <Button variant="primary" href="/auth/login">
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-md shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center">
              <FaUserFriends className="text-blue-500 mr-2" />
              Friends Feed
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              See the latest posts from your friends
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm text-blue-500 hover:underline flex items-center"
          >
            <FaPlus className="mr-1" /> Find more people
          </Link>
        </div>
      </div>

      {/* Posts Section */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="text-2xl text-gray-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">
            No posts from friends yet
          </h2>
          <p className="text-gray-600 mb-4">
            {friends.length === 0
              ? "Add some friends to see their posts here."
              : "Your friends haven't created any posts yet."}
          </p>
          <Link
            href="/explore"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Explore Groups
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
