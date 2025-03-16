"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function UserAvatar({
  username,
  size = 32,
  linkToProfile = false,
  className = "",
}) {
  const [imageExists, setImageExists] = useState(false);

  // Check if the user image exists
  useEffect(() => {
    const checkImageExists = async () => {
      try {
        if (!username) return;
        const response = await fetch(`/api/users/${username}/image`);
        setImageExists(response.ok && response.status !== 404);
      } catch (err) {
        setImageExists(false);
      }
    };

    if (username) {
      checkImageExists();
    }
  }, [username]);

  // Generate image URL with cache-busting parameter
  const getImageUrl = () => {
    if (!username) return "/logo.png"; // Default logo

    // If we've checked and the image exists, return the API endpoint
    if (imageExists) {
      return `/api/users/${username}/image?t=${new Date().getTime()}`;
    }

    // Otherwise use the logo as fallback
    return "/logo.png";
  };

  const avatarContent = (
    <div
      className={`relative rounded-full overflow-hidden bg-blue-500 flex-shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={getImageUrl()}
        alt={`${username || "User"}'s profile`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );

  // Wrap with a link if linkToProfile is true and we have a username
  if (linkToProfile && username) {
    return <Link href={`/user/${username}`}>{avatarContent}</Link>;
  }

  return avatarContent;
}
