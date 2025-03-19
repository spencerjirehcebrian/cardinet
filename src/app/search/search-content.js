"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaSpinner, FaArrowUp, FaComment, FaUserPlus } from "react-icons/fa";
import { formatRelativeTime } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import GroupAvatar from "@/components/ui/GroupAvatar";
import Button from "@/components/ui/Button";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("groups");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check which tab should be active initially
  const determineInitialActiveTab = (groupCount, postCount, userCount) => {
    if (groupCount > 0) return "groups";
    if (postCount > 0) return "posts";
    if (userCount > 0) return "users";
    return "groups"; // Default
  };

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // For simplicity, we'll fetch each type of result separately
        // Groups
        let groupsData = { groups: [] };
        try {
          const groupsResponse = await fetch(
            `/api/groups?search=${encodeURIComponent(query)}`
          );
          if (groupsResponse.ok) {
            groupsData = await groupsResponse.json();
          }
        } catch (err) {
          console.error("Error fetching groups:", err);
        }

        // Posts
        let postsData = { posts: [] };
        try {
          const postsResponse = await fetch(
            `/api/posts/search?q=${encodeURIComponent(query)}`
          );
          if (postsResponse.ok) {
            postsData = await postsResponse.json();
          }
        } catch (err) {
          console.error("Error fetching posts:", err);
        }

        // Users
        let usersData = { users: [] };
        try {
          const usersResponse = await fetch(
            `/api/users/search?q=${encodeURIComponent(query)}`
          );
          if (usersResponse.ok) {
            usersData = await usersResponse.json();
          }
        } catch (err) {
          console.error("Error fetching users:", err);
        }

        setGroups(groupsData.groups || []);
        setPosts(postsData.posts || []);
        setUsers(usersData.users || []);

        // Set default active tab based on results
        setActiveTab(
          determineInitialActiveTab(
            groupsData.groups?.length || 0,
            postsData.posts?.length || 0,
            usersData.users?.length || 0
          )
        );
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to perform search. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!query.trim()) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Search CardiNet</h1>
          <p className="text-gray-600">
            Use the search box in the header to find groups, posts, and users.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-16">
        <FaSpinner className="text-3xl text-white animate-spin" />
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
      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <h1 className="text-xl font-bold mb-4">
          Search results for: "{query}"
        </h1>

        {noResults ? (
          <div className="text-center p-8">
            <h2 className="text-lg font-semibold mb-2">No results found</h2>
            <p className="text-gray-600">
              We couldn't find any groups, posts, or users matching your search.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex">
                <button
                  onClick={() => handleTabChange("groups")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "groups"
                      ? "text-yellow-500 border-b-2 border-yellow-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Groups ({groups.length})
                </button>
                <button
                  onClick={() => handleTabChange("posts")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "posts"
                      ? "text-yellow-500 border-b-2 border-yellow-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Posts ({posts.length})
                </button>
                <button
                  onClick={() => handleTabChange("users")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "users"
                      ? "text-yellow-500 border-b-2 border-yellow-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Users ({users.length})
                </button>
              </div>
            </div>

            {/* Results */}
            <div>
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
                        className="flex items-center p-4 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <GroupAvatar
                          groupId={group.id}
                          groupName={group.name}
                          size={48}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{group.name}</h3>
                          <p className="text-sm text-gray-500">
                            {group._count?.members || 0}{" "}
                            {(group._count?.members || 0) === 1
                              ? "member"
                              : "members"}{" "}
                            • {group._count?.posts || 0}{" "}
                            {(group._count?.posts || 0) === 1
                              ? "post"
                              : "posts"}
                          </p>
                          {group.description && (
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
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
                        className="p-4 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div className="text-xs text-gray-500 mb-1 flex items-center">
                          <UserAvatar
                            username={post.author.username}
                            size={20}
                            className="mr-1"
                          />
                          <Link
                            href={`/user/${post.author.username}`}
                            className="hover:underline mr-1"
                          >
                            {post.author.username}
                          </Link>
                          posted in{" "}
                          <Link
                            href={`/group/${post.group.name}`}
                            className="text-blue-500 hover:underline mx-1 flex items-center"
                          >
                            <GroupAvatar
                              groupId={post.group.id}
                              groupName={post.group.name}
                              size={16}
                              className="mr-1"
                            />
                            {post.group.name}
                          </Link>
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
                            <span>
                              {post.score || post._count?.votes || 0} votes
                            </span>
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
                        href={`/user/${user.username}`}
                        className="flex items-center p-4 hover:bg-gray-50 rounded-md border border-gray-200"
                      >
                        <UserAvatar
                          username={user.username}
                          size={48}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{user.username}</h3>
                          <p className="text-sm text-gray-500">
                            {user.createdAt &&
                              `Member since ${new Date(
                                user.createdAt
                              ).toLocaleDateString()}`}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="mr-3">
                              {user._count?.posts || 0} posts
                            </span>
                            <span className="mr-3">
                              {user._count?.comments || 0} comments
                            </span>
                            <span>{user._count?.friends || 0} friends</span>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<FaUserPlus />}
                        >
                          Follow
                        </Button>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
