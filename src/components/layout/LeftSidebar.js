"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaFire,
  FaCompass,
  FaUserFriends,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { generateCommunityColor } from "@/lib/utils";

export default function LeftSidebar() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommunitiesExpanded, setIsCommunitiesExpanded] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/communities");

        if (!response.ok) {
          throw new Error("Failed to fetch communities");
        }

        const data = await response.json();
        setCommunities(data.communities);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load communities");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const toggleCommunitiesExpanded = () => {
    setIsCommunitiesExpanded(!isCommunitiesExpanded);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <div className="hidden md:block w-64 p-4 h-fit sticky top-4 text-white">
      <div className="space-y-4">
        {/* Main navigation */}
        <div className="space-y-1">
          <Link
            href="/"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/")
                ? "bg-gray-800 bg-opacity-30 font-medium"
                : "hover:bg-gray-800 hover:bg-opacity-20"
            }`}
          >
            <FaHome className="mr-3 text-white" />
            <span>Home</span>
          </Link>
          <Link
            href="/popular"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/popular")
                ? "bg-gray-800 bg-opacity-30 font-medium"
                : "hover:bg-gray-800 hover:bg-opacity-20"
            }`}
          >
            <FaFire className="mr-3 text-white" />
            <span>Popular</span>
          </Link>
          <Link
            href="/explore"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/explore")
                ? "bg-gray-800 bg-opacity-30 font-medium"
                : "hover:bg-gray-800 hover:bg-opacity-20"
            }`}
          >
            <FaCompass className="mr-3 text-white" />
            <span>Explore</span>
          </Link>
          <Link
            href="/friends"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/friends")
                ? "bg-gray-800 bg-opacity-30 font-medium"
                : "hover:bg-gray-800 hover:bg-opacity-20"
            }`}
          >
            <FaUserFriends className="mr-3 text-white" />
            <span>Friends</span>
          </Link>
        </div>

        {/* Communities dropdown */}
        <div>
          <button
            onClick={toggleCommunitiesExpanded}
            className="flex items-center justify-between w-full px-4 py-2 text-left font-medium border-t border-b border-white"
          >
            <span>Communities</span>
            {isCommunitiesExpanded ? (
              <FaChevronUp className="text-white" />
            ) : (
              <FaChevronDown className="text-white" />
            )}
          </button>

          {isCommunitiesExpanded && (
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-2 text-gray-300 text-sm">
                  Loading...
                </div>
              ) : error ? (
                <div className="px-4 py-2 text-red-300 text-sm">{error}</div>
              ) : communities.length === 0 ? (
                <div className="px-4 py-2 text-gray-300 text-sm">
                  No communities found
                </div>
              ) : (
                communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/r/${community.name}`}
                    className="flex items-center px-4 py-2 hover:bg-gray-800 hover:bg-opacity-20 rounded-md"
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${generateCommunityColor(
                        community.name
                      )} flex items-center justify-center mr-2`}
                    >
                      <Image
                        src="/logo-icon.png"
                        alt="Community"
                        width={12}
                        height={12}
                        className="text-white text-xs"
                      />
                    </div>
                    <span className="truncate">r/{community.name}</span>
                  </Link>
                ))
              )}
              <Link
                href="/create/community"
                className="flex items-center px-4 py-2 text-yellow-400 hover:bg-gray-800 hover:bg-opacity-20 rounded-md"
              >
                <span>+ Create Community</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
