"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { generateGroupColor } from "@/lib/utils";
import Button from "@/components/ui/Button";
import GroupImageUpload from "@/components/group/GroupImageUpload";
export default function GroupHeader({
  group,
  activeTab = "posts",
  onTabChange,
}) {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(group._count.members);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    // Check if the current user is the owner of the group
    if (group.owner.username === user.username) {
      return;
    }

    setIsLoading(true);

    try {
      const action = isJoined ? "leave" : "join";
      const response = await fetch(`/api/groups/${group.id}/${action}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} group`);
      }

      setIsJoined(!isJoined);
      setMemberCount((prevCount) => (isJoined ? prevCount - 1 : prevCount + 1));
    } catch (error) {
      console.error("Join/leave error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div>
      {/* Banner */}
      <div
        className={`h-20 ${generateGroupColor(group.name)} rounded-t-md`}
      ></div>

      {/* Group info */}
      <div className="bg-white shadow-sm px-4 pb-3">
        <div className="flex items-start">
          {/* Group icon */}
          <div className="-mt-4">
            <GroupImageUpload
              group={group}
              onImageUpdated={() => {
                // Optional: handle refresh or notification
              }}
            />
          </div>

          <div className="ml-4 pt-2 flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-sm text-gray-500">
                  {memberCount} {memberCount === 1 ? "member" : "members"} •
                  Created by{" "}
                  <Link
                    href={`/user/${group.owner.username}`}
                    className="hover:underline"
                  >
                    {group.owner.username}
                  </Link>
                </p>
              </div>

              <Button
                onClick={handleJoinGroup}
                variant={isJoined ? "outlined" : "primary"}
                isLoading={isLoading}
              >
                {isJoined ? "Joined" : "Join"}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex space-x-4 mt-4 border-b border-gray-200">
          <button
            onClick={() => handleTabClick("posts")}
            className={`px-3 py-2 ${
              activeTab === "posts"
                ? "text-gray-800 border-b-2 border-blue-500 font-medium"
                : "text-gray-500 hover:bg-gray-100 rounded-t-md"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => handleTabClick("about")}
            className={`px-3 py-2 ${
              activeTab === "about"
                ? "text-gray-800 border-b-2 border-blue-500 font-medium"
                : "text-gray-500 hover:bg-gray-100 rounded-t-md"
            }`}
          >
            About
          </button>
        </div>
      </div>
    </div>
  );
}
