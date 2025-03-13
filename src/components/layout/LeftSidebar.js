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
import { generateGroupColor } from "@/lib/utils";

export default function LeftSidebar() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/groups");

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        setGroups(data.groups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [pathname]);

  const toggleGroupsExpanded = () => {
    setIsGroupsExpanded(!isGroupsExpanded);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  const getGroupImageUrl = (groupId) => {
    return `/api/groups/${groupId}/image?t=${new Date().getTime()}`;
  };

  return (
    <div className="hidden md:block w-64 p-4 h-fit sticky top-4 text-white">
      <div className="space-y-4">
        {/* Main navigation */}
        <div className="space-y-1">
          <Link
            href="/"
            className={`group flex items-center px-4 py-2 rounded-md transition ${
              isActive("/")
                ? "bg-yellow-500 text-black font-medium"
                : "hover:bg-yellow-500 hover:text-black"
            }`}
          >
            <FaHome
              className={`mr-3 transition ${
                isActive("/")
                  ? "text-black"
                  : "text-white group-hover:text-black"
              }`}
            />
            <span>Home</span>
          </Link>

          <Link
            href="/popular"
            className={`group flex items-center px-4 py-2 rounded-md transition ${
              isActive("/popular")
                ? "bg-yellow-500 text-black font-medium"
                : "hover:bg-yellow-500 hover:text-black"
            }`}
          >
            <FaFire
              className={`mr-3 transition ${
                isActive("/popular")
                  ? "text-black"
                  : "text-white group-hover:text-black"
              }`}
            />
            <span>Popular</span>
          </Link>

          <Link
            href="/explore"
            className={`group flex items-center px-4 py-2 rounded-md transition ${
              isActive("/explore")
                ? "bg-yellow-500 text-black font-medium"
                : "hover:bg-yellow-500 hover:text-black"
            }`}
          >
            <FaCompass
              className={`mr-3 transition ${
                isActive("/explore")
                  ? "text-black"
                  : "text-white group-hover:text-black"
              }`}
            />
            <span>Explore</span>
          </Link>

          <Link
            href="/friends"
            className={`group flex items-center px-4 py-2 rounded-md transition ${
              isActive("/friends")
                ? "bg-yellow-500 text-black font-medium"
                : "hover:bg-yellow-500 hover:text-black"
            }`}
          >
            <FaUserFriends
              className={`mr-3 transition ${
                isActive("/friends")
                  ? "text-black"
                  : "text-white group-hover:text-black"
              }`}
            />
            <span>Friends</span>
          </Link>
        </div>

        {/* Groups dropdown */}
        <div>
          <button
            onClick={toggleGroupsExpanded}
            className="flex items-center justify-between w-full px-4 py-2 text-left font-medium border-t border-b border-white"
          >
            <span>Groups</span>
            {isGroupsExpanded ? (
              <FaChevronUp className="text-white" />
            ) : (
              <FaChevronDown className="text-white" />
            )}
          </button>

          {isGroupsExpanded && (
            <div className="mt-2 space-y-1">
              {loading ? (
                <div className="px-4 py-2 text-gray-300 text-sm">
                  Loading...
                </div>
              ) : error ? (
                <div className="px-4 py-2 text-red-300 text-sm">{error}</div>
              ) : groups.length === 0 ? (
                <div className="px-4 py-2 text-gray-300 text-sm">
                  No groups found
                </div>
              ) : (
                groups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/group/${group.name}`}
                    className={`group flex items-center px-4 py-2 rounded-md transition ${
                      isActive(`/group/${group.name}`)
                        ? "bg-yellow-500 text-black font-medium"
                        : "hover:bg-yellow-500 hover:text-black"
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <div
                        className={`absolute inset-0 ${generateGroupColor(
                          group.name
                        )}`}
                      />
                      <Image
                        src={getGroupImageUrl(group.id)}
                        alt={group.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = "/logo.png";
                        }}
                      />
                    </div>
                    <span className="truncate">{group.name}</span>
                  </Link>
                ))
              )}
              <Link
                href="/create/group"
                className="group flex items-center px-4 py-2 text-yellow-400 hover:bg-gray-800 hover:bg-opacity-20 rounded-md"
              >
                <span>+ Create Group</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
