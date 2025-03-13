"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";
import { generateGroupColor } from "@/lib/utils";

export default function GroupSidebar() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/groups");

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        setGroups(data.groups.slice(0, 5)); // Show top 5 groups
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Top Groups</h2>
        <div className="flex justify-center py-8">
          <FaSpinner className="text-gray-400 animate-spin text-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Top Groups</h2>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Top Groups</h2>
        <p className="text-gray-500 text-sm mb-4">No groups found.</p>
        <Link
          href="/create/group"
          className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Create Group
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3">Top Groups</h2>
      <ul className="space-y-3">
        {groups.map((group) => (
          <li key={group.id}>
            <Link
              href={`/group/${group.name}`}
              className="flex items-center p-2 hover:bg-gray-100 rounded-md"
            >
              <div
                className={`w-8 h-8 rounded-full ${generateGroupColor(
                  group.name
                )} flex items-center justify-center mr-2`}
              >
                <Image
                  src="/logo-icon.png"
                  alt="Group"
                  width={16}
                  height={16}
                  className="text-white"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-gray-500">
                  {group._count.members}{" "}
                  {group._count.members === 1 ? "member" : "members"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link href="/groups" className="text-blue-500 text-sm hover:underline">
          View All Groups
        </Link>
      </div>
    </div>
  );
}
