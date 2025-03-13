"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import Button from "@/components/ui/Button";
import { FaPlus } from "react-icons/fa";

export default function CreatePostPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    groupId: "",
  });
  const [groups, setGroups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/create/post");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await fetch("/api/groups");

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        setGroups(data.groups);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    };

    if (isAuthenticated) {
      fetchGroups();
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

    if (!formData.groupId) {
      newErrors.groupId = "Please select a group";
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
      const group = groups.find((g) => g.id === formData.groupId);
      router.push(`/group/${group.name}/comments/${data.post.id}`);
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
        <Button isLoading>Loading</Button>
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
              htmlFor="groupId"
              className="block text-gray-700 font-medium mb-1"
            >
              Choose a group
            </label>
            <select
              id="groupId"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.groupId ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isSubmitting || loadingGroups}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.groupId && (
              <p className="mt-1 text-red-500 text-sm">{errors.groupId}</p>
            )}
            {loadingGroups && (
              <p className="mt-1 text-gray-500 text-sm flex items-center">
                <Button size="sm" isLoading>
                  Loading groups...
                </Button>
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
            <Button
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<FaPlus />}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
