"use client";

import { useState, useEffect } from "react";
import PostItem from "@/components/post/PostItem";
import { FaSpinner, FaCompass } from "react-icons/fa";

export default function RecentPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchRecentPosts = async (resetPage = false) => {
    try {
      setLoading(true);
      const page = resetPage ? 1 : pagination.page;

      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
      });

      const response = await fetch(`/api/posts/recent?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recent posts");
      }

      const data = await response.json();

      if (resetPage) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setPagination((prev) => ({
        ...prev,
        page: page,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err) {
      console.error("Error fetching recent posts:", err);
      setError("Failed to load recent posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentPosts(true);
  }, []);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
      fetchRecentPosts(false);
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

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-md shadow-sm p-4 mb-4">
        <div className="flex items-center">
          <FaCompass className="text-blue-500 text-xl mr-2" />
          <h2 className="text-lg font-semibold">Explore Recent Posts</h2>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          Discover the latest posts from all groups
        </p>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">No posts yet</h2>
          <p className="text-gray-600">
            Be the first to start a discussion in the group.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}

          {pagination.page < pagination.totalPages && (
            <div className="flex justify-center py-4">
              <button
                onClick={handleLoadMore}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" /> Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
