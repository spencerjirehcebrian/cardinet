import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import PostItem from "@/components/post/PostItem";
import CommentSection from "@/components/comment/CommentSection";

export async function generateMetadata({ params }) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const postId = resolvedParams.postId;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      community: true,
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
      post.content?.substring(0, 160) || `A post in r/${post.community.name}`,
  };
}

export default async function PostDetailPage({ params }) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const postId = resolvedParams.postId;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          username: true,
        },
      },
      community: true,
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

  return (
    <div>
      <PostItem post={post} isDetailView={true} />

      <div className="mt-4">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
