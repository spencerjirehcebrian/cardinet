"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaComment,
  FaArrowUp,
  FaUser,
  FaUserFriends,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function UserProfileClient({ params }) {
  const { username } = params;
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFriend, setIsFriend] = useState(false);
  const [isProcessingFriend, setIsProcessingFriend] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch profile user data
        const response = await fetch(`/api/users/${username}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);

        // Check if logged in user data exists in local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);

          // Check if viewed user is a friend
          if (userData.friends) {
            setIsFriend(
              userData.friends.some((friend) => friend.id === parsedUser.id)
            );
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFriendAction = async (action) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    setIsProcessingFriend(true);

    try {
      const response = await fetch(`/api/users/${username}/friend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} friend`);
      }

      // Update UI state
      setIsFriend(action === "add");
    } catch (err) {
      console.error(`Friend ${action} error:`, err);
      // Could add a toast notification here
    } finally {
      setIsProcessingFriend(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Button isLoading>Loading profile</Button>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  // Check if content arrays exist - if not, provide empty arrays as fallbacks
  const upvotedContent = user.upvotedContent || [];
  const downvotedContent = user.downvotedContent || [];
  const userPosts = user.posts || [];
  const userComments = user.comments || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-md shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">{username}</h1>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <FaCalendarAlt className="mr-1" />
                <span>Account created {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Friend Button (only shows if not viewing own profile) */}
          {currentUser && currentUser.username !== username && (
            <div>
              {isFriend ? (
                <Button
                  variant="secondary"
                  onClick={() => handleFriendAction("remove")}
                  isLoading={isProcessingFriend}
                  icon={<FaUserMinus />}
                >
                  Remove Friend
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleFriendAction("add")}
                  isLoading={isProcessingFriend}
                  icon={<FaUserPlus />}
                >
                  Add Friend
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          {/* Content tabs */}
          <div className="bg-white rounded-md shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "posts"
                      ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("posts")}
                >
                  Posts
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "comments"
                      ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("comments")}
                >
                  Comments
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "upvoted"
                      ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("upvoted")}
                >
                  Upvoted
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "downvoted"
                      ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("downvoted")}
                >
                  Downvoted
                </button>
              </nav>
            </div>

            {/* Display content based on active tab */}
            {activeTab === "posts" && (
              <div className="p-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <div
                        key={post.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          Posted in{" "}
                          <Link
                            href={`/group/${post.group.name}`}
                            className="text-blue-500 hover:underline"
                          >
                            {post.group.name}
                          </Link>{" "}
                          • {formatRelativeTime(post.createdAt)}
                        </div>
                        <h2 className="text-lg font-medium mb-2">
                          <Link
                            href={`/group/${post.group.name}/comments/${post.id}`}
                            className="hover:underline"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        <div className="flex items-center text-gray-500 text-sm mt-2">
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other tab contents would be rendered here similarly */}
          </div>
        </div>

        {/* Friends List Sidebar */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-md shadow-sm p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaUserFriends className="mr-2 text-blue-500" />
              Friends
            </h2>

            {user.friends && user.friends.length > 0 ? (
              <div className="space-y-3">
                {user.friends.map((friend) => (
                  <Link
                    key={friend.id}
                    href={`/user/${friend.username}`}
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
                      {friend.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-medium">{friend.username}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {username === currentUser?.username
                  ? "You haven't added any friends yet"
                  : "This user hasn't added any friends yet"}
              </p>
            )}

            {username === currentUser?.username && (
              <div className="mt-4">
                <Button
                  href="/explore"
                  variant="secondary"
                  fullWidth
                  icon={<FaUserPlus />}
                >
                  Find Friends
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
