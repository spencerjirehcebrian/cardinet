// src/components/group/GroupImageUpload.js
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaCamera, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/components/auth/AuthContext";
import { generateGroupColor } from "@/lib/utils";

export default function GroupImageUpload({ group, onImageUpdated }) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imageExists, setImageExists] = useState(false);
  const fileInputRef = useRef(null);

  const isGroupOwner = user && group.ownerId === user.id;

  // Check if the group image exists
  useEffect(() => {
    const checkImageExists = async () => {
      try {
        if (!group || !group.id) return;

        const response = await fetch(`/api/groups/${group.id}/image`);
        setImageExists(response.ok && response.status !== 404);
      } catch (err) {
        setImageExists(false);
      }
    };

    if (group && group.id) {
      checkImageExists();
    }
  }, [group]);

  // Generate image URL with cache-busting parameter
  const getImageUrl = () => {
    if (!group || !group.id) return "/logo.png";

    // If we've checked and the image exists, return the API endpoint
    if (imageExists) {
      return `/api/groups/${group.id}/image?t=${new Date().getTime()}`;
    }

    // Otherwise use the logo as fallback
    return "/logo.png";
  };

  const handleImageClick = () => {
    if (isGroupOwner && !isUploading) {
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

      const response = await fetch(`/api/groups/${group.id}/image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      // Mark as existing after successful upload
      setImageExists(true);

      // Notify parent component if needed
      if (onImageUpdated) {
        onImageUpdated();
      }
    } catch (err) {
      console.error("Group image upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`relative rounded-full overflow-hidden border-4 border-white ${
          isGroupOwner ? "cursor-pointer hover:opacity-90" : ""
        }`}
        onClick={handleImageClick}
        style={{ width: "96px", height: "96px" }}
      >
        {/* Only add the color background if no image exists */}
        {!imageExists && (
          <div
            className={`absolute inset-0 ${generateGroupColor(group.name)}`}
          />
        )}

        <Image
          src={getImageUrl()}
          alt={`${group.name} image`}
          fill
          sizes="96px"
          className="object-cover"
        />

        {isGroupOwner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
            {isUploading ? (
              <FaSpinner className="text-white text-xl animate-spin" />
            ) : (
              <FaCamera className="text-white text-xl" />
            )}
          </div>
        )}
      </div>

      {isGroupOwner && (
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

      {isGroupOwner && (
        <p className="text-xs text-gray-500 mt-1">
          Click to {imageExists ? "change" : "upload"} group image
        </p>
      )}
    </div>
  );
}
