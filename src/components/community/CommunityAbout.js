import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function CommunityAbout({ community }) {
  // Check if community._count exists before trying to access its properties
  const memberCount = community?._count?.members || 0;
  const postCount = community?._count?.posts || 0;

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3">About Community</h2>

      {community.description && (
        <p className="text-sm text-gray-700 mb-4">{community.description}</p>
      )}

      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-sm font-semibold">{memberCount}</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{postCount}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div>
            <p className="text-sm font-semibold">1</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 mt-3">
        <p className="text-xs text-gray-500">
          Created {formatDate(community.createdAt)}
        </p>
      </div>

      <div className="mt-4">
        <Link
          href={`/r/${community.name}/submit`}
          className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Create Post
        </Link>
      </div>
    </div>
  );
}
