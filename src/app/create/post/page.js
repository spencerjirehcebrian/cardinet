"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { FaSpinner } from "react-icons/fa";

export default function CreatePostPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    communityId: "",
  });
  const [communities, setCommunities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/create/post");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoadingCommunities(true);
        const response = await fetch("/api/communities");

        if (!response.ok) {
          throw new Error("Failed to fetch communities");
        }

        const data = await response.json();
        setCommunities(data.communities);
      } catch (err) {
        console.error("Error fetching communities:", err);
      } finally {
        setLoadingCommunities(false);
      }
    };

    if (isAuthenticated) {
      fetchCommunities();
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 300) {
      newErrors.title = "Title must be less than 300 characters";
    }

    if (!formData.communityId) {
      newErrors.communityId = "Please select a community";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create post");
      }

      const data = await response.json();

      // Redirect to the new post
      const community = communities.find((c) => c.id === formData.communityId);
      router.push(`/r/${community.name}/comments/${data.post.id}`);
    } catch (err) {
      console.error("Post creation error:", err);
      setErrors((prev) => ({
        ...prev,
        form: err.message || "Failed to create post. Please try again.",
      }));
      setIsSubmitting(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="text-4xl text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-md shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Create a Post</h1>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="communityId"
              className="block text-gray-700 font-medium mb-1"
            >
              Choose a community
            </label>
            <select
              id="communityId"
              name="communityId"
              value={formData.communityId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.communityId ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isSubmitting || loadingCommunities}
            >
              <option value="">Select a community</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  r/{community.name}
                </option>
              ))}
            </select>
            {errors.communityId && (
              <p className="mt-1 text-red-500 text-sm">{errors.communityId}</p>
            )}
            {loadingCommunities && (
              <p className="mt-1 text-gray-500 text-sm flex items-center">
                <FaSpinner className="animate-spin mr-1" /> Loading
                communities...
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className={`w-full px-3 py-2 border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-1"
            >
              Text (optional)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Text (optional)"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> Posting...
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
