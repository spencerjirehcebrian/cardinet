"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";
import { generateCommunityColor } from "@/lib/utils";

export default function CommunitySidebar() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/communities");

        if (!response.ok) {
          throw new Error("Failed to fetch communities");
        }

        const data = await response.json();
        setCommunities(data.communities.slice(0, 5)); // Show top 5 communities
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load communities");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Top Communities</h2>
        <div className="flex justify-center py-8">
          <FaSpinner className="text-gray-400 animate-spin text-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Top Communities</h2>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Top Communities</h2>
        <p className="text-gray-500 text-sm mb-4">No communities found.</p>
        <Link
          href="/create/community"
          className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Create Community
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3">Top Communities</h2>
      <ul className="space-y-3">
        {communities.map((community) => (
          <li key={community.id}>
            <Link
              href={`/r/${community.name}`}
              className="flex items-center p-2 hover:bg-gray-100 rounded-md"
            >
              <div
                className={`w-8 h-8 rounded-full ${generateCommunityColor(
                  community.name
                )} flex items-center justify-center mr-2`}
              >
                {/* Replace FaReddit with your custom logo icon */}
                <Image
                  src="/logo-icon.png"
                  alt="Community"
                  width={16}
                  height={16}
                  className="text-white"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">r/{community.name}</p>
                <p className="text-xs text-gray-500">
                  {community._count.members}{" "}
                  {community._count.members === 1 ? "member" : "members"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link
          href="/communities"
          className="text-blue-500 text-sm hover:underline"
        >
          View All Communities
        </Link>
      </div>
    </div>
  );
}
