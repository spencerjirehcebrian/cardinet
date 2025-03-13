import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import PostItem from "@/components/post/PostItem";
import CommentSection from "@/components/comment/CommentSection";

export async function generateMetadata({ params }) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const { postId } = resolvedParams;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      group: true,
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description:
      post.content?.substring(0, 160) || `A post in ${post.group.name}`,
  };
}

export default async function PostDetailPage({ params }) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const { postId, group: groupParam } = resolvedParams;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          username: true,
        },
      },
      group: true,
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Extract group name from either the post data or the URL param
  const groupName = post.group.name || groupParam;

  return (
    <div>
      <PostItem post={post} isDetailView={true} />

      <div className="mt-4">
        <CommentSection postId={post.id} groupName={groupName} />
      </div>
    </div>
  );
}
