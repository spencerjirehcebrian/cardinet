import Link from "next/link";
import { FaReddit, FaPlus } from "react-icons/fa";
import PostList from "@/components/post/PostList";
import Button from "@/components/ui/Button";

export default async function Home() {
  return (
    <div>
      {/* Home welcome card */}
      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Home</h2>
        <p className="text-gray-600 mb-4">
          Your personal CardiNet frontpage. Come here to check in with your
          favorite groups.
        </p>
        <Button
          href="/create/post"
          fullWidth
          variant="primary"
          icon={<FaPlus />}
        >
          Create Post
        </Button>
      </div>

      {/* Posts feed */}
      <PostList />
    </div>
  );
}
