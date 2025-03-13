"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { FaSpinner } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function CreateGroupPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/create/group");
    }
  }, [isAuthenticated, loading, router]);

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

    // Reset name availability check when name changes
    if (name === "name") {
      setNameAvailable(null);
    }
  };

  const checkNameAvailability = async () => {
    const name = formData.name.trim();
    if (!name || !/^[a-zA-Z0-9_]+$/.test(name)) {
      return;
    }

    setIsCheckingName(true);
    try {
      const response = await fetch(`/api/groups/check?name=${name}`);
      const data = await response.json();
      setNameAvailable(!data.exists);
    } catch (error) {
      console.error("Error checking name availability:", error);
    } finally {
      setIsCheckingName(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.length < 3 || formData.name.length > 21) {
      newErrors.name = "Group name must be between 3 and 21 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name =
        "Group name can only contain letters, numbers, and underscores";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
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
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create group");
      }

      const data = await response.json();

      // Redirect to the new group
      router.push(`/group/${data.group.name}`);
    } catch (error) {
      console.error("Group creation error:", error);
      setErrors((prev) => ({
        ...prev,
        form: error.message || "Failed to create group. Please try again.",
      }));
      setIsSubmitting(false);
    }
  };

  // Handle name availability check when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name.trim() && formData.name.length >= 3) {
        checkNameAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-20">
        <FaSpinner className="text-4xl text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Create a Group</h1>
        </div>

        {errors.form && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-1"
            >
              Group Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Group Name"
                className={`w-full pl-4 pr-10 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isSubmitting}
              />
              {isCheckingName && (
                <FaSpinner className="absolute right-3 top-3 text-gray-400 animate-spin" />
              )}
              {nameAvailable !== null && !isCheckingName && (
                <span
                  className={`absolute right-3 top-2 ${
                    nameAvailable ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {nameAvailable ? "Available" : "Unavailable"}
                </span>
              )}
            </div>
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Group names must be between 3-21 characters, only contain letters,
              numbers, or underscores, and cannot be changed later.
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is your group about?"
              rows={4}
              className={`w-full px-3 py-2 border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-red-500 text-sm">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max 500 characters</p>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || nameAvailable === false}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> Creating...
                </span>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
