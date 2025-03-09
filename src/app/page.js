import Link from "next/link";
import { FaReddit } from "react-icons/fa";
import PostList from "@/components/post/PostList";

export default async function Home() {
  return (
    <div>
      {/* Home welcome card */}
      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Home</h2>
        <p className="text-gray-600 mb-4">
          Your personal CardiNet frontpage. Come here to check in with your
          favorite communities.
        </p>
        <Link
          href="/create/post"
          className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600 mb-2"
        >
          Create Post
        </Link>
      </div>

      {/* Posts feed */}
      <PostList />
    </div>
  );
}
