import { verify } from "jsonwebtoken";
import { format, formatDistanceToNow } from "date-fns";

// JWT authentication utilities
export function getUserFromToken(request) {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "cardinet-secret-key"
    );
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Date formatting utilities
export function formatDate(date) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelativeTime(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Vote calculation utility
export function calculateVoteScore(votes) {
  return votes.reduce((total, vote) => total + vote.value, 0);
}

// Generate random color for group avatar
export function generateGroupColor(name) {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  // Use the group name to deterministically select a color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Helper to get profile image URL for a user with fallback
export function getUserImageUrl(username, withTimestamp = true) {
  if (!username) return "/logo.png";

  const timestamp = withTimestamp ? `?t=${new Date().getTime()}` : "";
  return `/api/users/${username}/image${timestamp}`;
}

// Helper to get group image URL with fallback
export function getGroupImageUrl(groupId, withTimestamp = true) {
  if (!groupId) return "/logo.png";

  const timestamp = withTimestamp ? `?t=${new Date().getTime()}` : "";
  return `/api/groups/${groupId}/image${timestamp}`;
}
