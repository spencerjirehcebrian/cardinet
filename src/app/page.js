import { FaHome, FaPlus } from "react-icons/fa";
import PostList from "@/components/post/PostList";
import Button from "@/components/ui/Button";

export default async function Home() {
  return (
    <div>
      {/* Home welcome card */}
      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">
          <FaHome className="inline-block mr-2 text-yellow-500" />
          News Feed
        </h2>

        <Button
          href="/create/post"
          variant="primary"
          icon={<FaPlus />}
          className="w-fit"
        >
          Create Post
        </Button>
      </div>

      {/* Posts feed */}
      <PostList />
    </div>
  );
}
