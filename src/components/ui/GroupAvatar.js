"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { generateGroupColor } from "@/lib/utils";

export default function GroupAvatar({
  groupId,
  groupName,
  size = 32,
  linkToGroup = false,
  className = "",
}) {
  const [imageExists, setImageExists] = useState(false);

  // Check if the group image exists
  useEffect(() => {
    const checkImageExists = async () => {
      try {
        if (!groupId) return;
        const response = await fetch(`/api/groups/${groupId}/image`);
        setImageExists(response.ok && response.status !== 404);
      } catch (err) {
        setImageExists(false);
      }
    };

    if (groupId) {
      checkImageExists();
    }
  }, [groupId]);

  // Generate image URL with cache-busting parameter
  const getImageUrl = () => {
    if (!groupId) return "/logo.png";

    // If we've checked and the image exists, return the API endpoint
    if (imageExists) {
      return `/api/groups/${groupId}/image?t=${new Date().getTime()}`;
    }

    // Otherwise use the logo as fallback
    return "/logo.png";
  };

  const colorClass = groupName ? generateGroupColor(groupName) : "bg-gray-500";

  const avatarContent = (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 ${colorClass} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Background color is visible if no image is loaded */}
      <div className="absolute inset-0"></div>

      {/* Logo image */}
      <Image
        src={getImageUrl()}
        alt={`${groupName || "Group"}`}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={(e) => {
          // On error loading image, show the logo instead
          e.target.src = "/logo.png";
          e.target.style.display = "block";
        }}
      />
    </div>
  );

  // Wrap with a link if linkToGroup is true and we have a group name
  if (linkToGroup && groupName) {
    return <Link href={`/group/${groupName}`}>{avatarContent}</Link>;
  }

  return avatarContent;
}
