// src/components/user/ProfileImageUpload.js
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaCamera, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/components/auth/AuthContext";

export default function ProfileImageUpload({
  username,
  initialImageUrl = null,
  size = 120, // Default size increased
}) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState(null);
  const [imageExists, setImageExists] = useState(false);
  const fileInputRef = useRef(null);

  const isOwnProfile = user && user.username === username;

  // Check if the user image exists
  useEffect(() => {
    const checkImageExists = async () => {
      try {
        const response = await fetch(`/api/users/${username}/image`);
        setImageExists(response.ok && response.status !== 404);
      } catch (err) {
        setImageExists(false);
      }
    };

    if (username) {
      checkImageExists();
    }
  }, [username, imageUrl]);

  // Generate image URL with cache-busting parameter
  const getImageUrl = () => {
    if (!username) return "/logo.png"; // Default logo

    if (imageUrl) return imageUrl;

    // If we've checked and the image exists, return the API endpoint
    if (imageExists) {
      return `/api/users/${username}/image?t=${new Date().getTime()}`;
    }

    // Otherwise use the logo as fallback
    return "/logo.png";
  };

  const handleImageClick = () => {
    if (isOwnProfile && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`/api/users/${username}/image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      // Update the image URL with cache-busting and mark as existing
      setImageUrl(`/api/users/${username}/image?t=${new Date().getTime()}`);
      setImageExists(true);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`relative rounded-full overflow-hidden ${
          isOwnProfile ? "cursor-pointer hover:opacity-90" : ""
        }`}
        onClick={handleImageClick}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Image
          src={getImageUrl()}
          alt={`${username}'s profile image`}
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority
        />

        {isOwnProfile && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
            {isUploading ? (
              <FaSpinner className="text-white text-2xl animate-spin" />
            ) : (
              <FaCamera className="text-white text-2xl" />
            )}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {isOwnProfile && (
        <p className="text-xs text-gray-500 mt-1">
          Click to {imageExists ? "change" : "upload"} profile image
        </p>
      )}
    </div>
  );
}
