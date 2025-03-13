"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FaSpinner, FaArrowUp, FaComment } from "react-icons/fa";
import { formatRelativeTime, generateGroupColor } from "@/lib/utils";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("groups");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);

        // Fetch groups matching the query
        const groupsResponse = await fetch(`/api/groups?search=${query}`);

        if (!groupsResponse.ok) {
          throw new Error("Failed to fetch groups");
        }

        const groupsData = await groupsResponse.json();
        setGroups(groupsData.groups);

        // Fetch posts matching the query
        const postsResponse = await fetch(`/api/posts/search?q=${query}`);

        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts");
        }

        const postsData = await postsResponse.json();
        setPosts(postsData.posts);

        // Fetch users matching the query
        const usersResponse = await fetch(`/api/users/search?q=${query}`);

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await usersResponse.json();
        setUsers(usersData.users);

        // Set default active tab based on results
        if (groupsData.groups.length === 0) {
          if (postsData.posts.length > 0) {
            setActiveTab("posts");
          } else if (usersData.users.length > 0) {
            setActiveTab("users");
          }
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to perform search. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Search CardiNet</h1>
        <p className="text-gray-600">
          Enter a search term in the search box above to find groups and posts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-16">
        <FaSpinner className="text-3xl text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  const noResults =
    groups.length === 0 && posts.length === 0 && users.length === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search results for: "{query}"</h1>

      {noResults ? (
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">No results found</h2>
          <p className="text-gray-600">
            We couldn't find any groups or posts matching your search.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-md shadow-sm mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("groups")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "groups"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Groups ({groups.length})
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "posts"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "users"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Users ({users.length})
              </button>
            </div>

            {/* Results */}
            <div className="p-4">
              {activeTab === "groups" && (
                <div className="space-y-4">
                  {groups.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      No groups found.
                    </p>
                  ) : (
                    groups.map((group) => (
                      <Link
                        key={group.id}
                        href={`/group/${group.name}`}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${generateGroupColor(
                            group.name
                          )} flex items-center justify-center mr-3`}
                        >
                          {/* Replace FaReddit with your custom logo icon */}
                          <Image
                            src="/logo-icon.png"
                            alt="Group"
                            width={20}
                            height={20}
                            className="text-white text-xl"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-gray-500">
                            {group._count.members}{" "}
                            {group._count.members === 1 ? "member" : "members"}{" "}
                            • {group._count.posts}{" "}
                            {group._count.posts === 1 ? "post" : "posts"}
                          </p>
                          {group.description && (
                            <p className="text-sm text-gray-700 mt-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      No posts found.
                    </p>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          Posted in{" "}
                          <Link
                            href={`/group/${post.group.name}`}
                            className="text-blue-500 hover:underline"
                          >
                            {post.group.name}
                          </Link>{" "}
                          by{" "}
                          <Link
                            href={`/${post.author.username}`}
                            className="hover:underline"
                          >
                            {post.author.username}
                          </Link>{" "}
                          {formatRelativeTime(post.createdAt)}
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          <Link
                            href={`/group/${post.group.name}/comments/${post.id}`}
                            className="hover:underline"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        {post.content && (
                          <p className="text-gray-800 mb-2 line-clamp-2">
                            {post.content}
                          </p>
                        )}
                        <div className="flex items-center text-gray-500 text-sm">
                          <div className="flex items-center mr-4">
                            <FaArrowUp className="mr-1" />
                            <span>{post._count?.votes || 0} votes</span>
                          </div>
                          <div className="flex items-center mr-4">
                            <FaComment className="mr-1" />
                            <span>{post._count?.comments || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      No users found.
                    </p>
                  ) : (
                    users.map((user) => (
                      <Link
                        key={user.id}
                        href={`/${user.username}`}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {user.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium">{user.username}</h3>
                          <p className="text-sm text-gray-500">
                            {user.createdAt &&
                              `Member since ${new Date(
                                user.createdAt
                              ).toLocaleDateString()}`}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="mr-3">
                              {user._count.posts} posts
                            </span>
                            <span>{user._count.comments} comments</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
