import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { FaPlus } from "react-icons/fa";

export default function GroupAbout({ group }) {
  // Check if group._count exists before trying to access its properties
  const memberCount = group?._count?.members || 0;
  const postCount = group?._count?.posts || 0;

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3">About Group</h2>

      {group.description && (
        <p className="text-sm text-gray-700 mb-4">{group.description}</p>
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
          Created {formatDate(group.createdAt)}
        </p>
      </div>
    </div>
  );
}
