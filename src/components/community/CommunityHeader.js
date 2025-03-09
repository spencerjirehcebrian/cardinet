"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { generateCommunityColor } from "@/lib/utils";

export default function CommunityHeader({ community }) {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(community._count.members);

  const handleJoinCommunity = async () => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const action = isJoined ? "leave" : "join";
      const response = await fetch(
        `/api/communities/${community.id}/${action}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} community`);
      }

      setIsJoined(!isJoined);
      setMemberCount((prevCount) => (isJoined ? prevCount - 1 : prevCount + 1));
    } catch (error) {
      console.error("Join/leave error:", error);
    }
  };

  return (
    <div>
      {/* Banner */}
      <div
        className={`h-20 ${generateCommunityColor(
          community.name
        )} rounded-t-md`}
      ></div>

      {/* Community info */}
      <div className="bg-white shadow-sm px-4 pb-3">
        <div className="flex items-start">
          {/* Community icon */}
          <div
            className={`-mt-4 w-16 h-16 rounded-full border-4 border-white ${generateCommunityColor(
              community.name
            )} flex items-center justify-center`}
          >
            {/* Replace FaReddit with your custom logo icon */}
            <Image
              src="/logo-icon.png"
              alt="Community"
              width={32}
              height={32}
              className="text-white text-3xl"
            />
          </div>

          <div className="ml-4 pt-2 flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">r/{community.name}</h1>
                <p className="text-sm text-gray-500">
                  {memberCount} {memberCount === 1 ? "member" : "members"} •
                  Created by{" "}
                  <Link
                    href={`/user/${community.owner.username}`}
                    className="hover:underline"
                  >
                    u/{community.owner.username}
                  </Link>
                </p>
              </div>

              <button
                onClick={handleJoinCommunity}
                className={`px-6 py-1 rounded-full font-medium ${
                  isJoined
                    ? "border border-blue-500 text-blue-500 hover:bg-blue-50"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isJoined ? "Joined" : "Join"}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex space-x-4 mt-4 border-b border-gray-200">
          <Link
            href={`/r/${community.name}`}
            className="px-3 py-2 text-gray-800 border-b-2 border-blue-500 font-medium"
          >
            Posts
          </Link>
          <button className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-t-md">
            About
          </button>
        </div>
      </div>
    </div>
  );
}
