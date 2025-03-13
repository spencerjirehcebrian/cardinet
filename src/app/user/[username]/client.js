"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaComment,
  FaArrowUp,
  FaUserFriends,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ProfileImageUpload from "@/components/user/ProfileImageUpload";
import Image from "next/image";

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
            <ProfileImageUpload username={username} />
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

            {/* Comments tab */}
            {activeTab === "comments" && (
              <div className="p-4">
                {userComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No comments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          Commented on{" "}
                          <Link
                            href={`/group/${comment.post.group.name}/comments/${comment.post.id}`}
                            className="font-medium hover:underline"
                          >
                            {comment.post.title}
                          </Link>{" "}
                          in{" "}
                          <Link
                            href={`/group/${comment.post.group.name}`}
                            className="text-blue-500 hover:underline"
                          >
                            {comment.post.group.name}
                          </Link>{" "}
                          • {formatRelativeTime(comment.createdAt)}
                        </div>
                        <p className="text-gray-800">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upvoted content tab */}
            {activeTab === "upvoted" && (
              <div className="p-4">
                {upvotedContent.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No upvoted content yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upvotedContent.map((content) => (
                      <div
                        key={content.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        {content.type === "post" ? (
                          <>
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs mr-2">
                                Post
                              </span>
                              Posted in{" "}
                              <Link
                                href={`/group/${content.group.name}`}
                                className="text-blue-500 hover:underline"
                              >
                                {content.group.name}
                              </Link>{" "}
                              • {formatRelativeTime(content.createdAt)}
                            </div>
                            <h2 className="text-lg font-medium">
                              <Link
                                href={`/group/${content.group.name}/comments/${content.id}`}
                                className="hover:underline"
                              >
                                {content.title}
                              </Link>
                            </h2>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs mr-2">
                                Comment
                              </span>
                              On post{" "}
                              <Link
                                href={`/group/${content.post.group.name}/comments/${content.post.id}`}
                                className="font-medium hover:underline"
                              >
                                {content.post.title}
                              </Link>{" "}
                              • {formatRelativeTime(content.createdAt)}
                            </div>
                            <p className="text-gray-800">{content.content}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Downvoted content tab */}
            {activeTab === "downvoted" && (
              <div className="p-4">
                {downvotedContent.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No downvoted content yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {downvotedContent.map((content) => (
                      <div
                        key={content.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        {content.type === "post" ? (
                          <>
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs mr-2">
                                Post
                              </span>
                              Posted in{" "}
                              <Link
                                href={`/group/${content.group.name}`}
                                className="text-blue-500 hover:underline"
                              >
                                {content.group.name}
                              </Link>{" "}
                              • {formatRelativeTime(content.createdAt)}
                            </div>
                            <h2 className="text-lg font-medium">
                              <Link
                                href={`/group/${content.group.name}/comments/${content.id}`}
                                className="hover:underline"
                              >
                                {content.title}
                              </Link>
                            </h2>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs mr-2">
                                Comment
                              </span>
                              On post{" "}
                              <Link
                                href={`/group/${content.post.group.name}/comments/${content.post.id}`}
                                className="font-medium hover:underline"
                              >
                                {content.post.title}
                              </Link>{" "}
                              • {formatRelativeTime(content.createdAt)}
                            </div>
                            <p className="text-gray-800">{content.content}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md mr-2"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 mr-2 flex-shrink-0">
                      <Image
                        src={`/api/users/${friend.username}/image`}
                        alt={friend.username}
                        width={50}
                        height={50}
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to default logo
                          e.target.src = "/logo.png";
                          e.target.style.display = "block";
                          e.target.parentNode.className =
                            e.target.parentNode.className.replace(
                              /flex items-center justify-center text-white text-xs font-bold/g,
                              ""
                            );
                        }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 hover:underline pl-1">
                      {friend.username}
                    </span>
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
