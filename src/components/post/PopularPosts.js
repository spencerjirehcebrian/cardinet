"use client";

import { useState, useEffect } from "react";
import PostItem from "@/components/post/PostItem";
import { FaSpinner, FaFireAlt } from "react-icons/fa";

export default function PopularPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchPosts = async (resetPage = false) => {
    try {
      setLoading(true);
      const page = resetPage ? 1 : pagination.page;

      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        period: selectedPeriod,
      });

      const response = await fetch(`/api/posts/popular?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch popular posts");
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
      console.error("Error fetching popular posts:", err);
      setError("Failed to load popular posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [selectedPeriod]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
      fetchPosts(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
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
      {/* Filter Controls */}
      <div className="bg-white rounded-md shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaFireAlt className="text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold">Popular Posts</h2>
          </div>
          <div className="flex space-x-2 text-sm">
            <button
              onClick={() => handlePeriodChange("day")}
              className={`px-3 py-1 rounded-full ${
                selectedPeriod === "day"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePeriodChange("week")}
              className={`px-3 py-1 rounded-full ${
                selectedPeriod === "week"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handlePeriodChange("month")}
              className={`px-3 py-1 rounded-full ${
                selectedPeriod === "month"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handlePeriodChange("all")}
              className={`px-3 py-1 rounded-full ${
                selectedPeriod === "all"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">No popular posts</h2>
          <p className="text-gray-600">
            There are no popular posts for the selected time period.
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
