import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import CommunityHeader from "@/components/community/CommunityHeader";
import PostList from "@/components/post/PostList";

export async function generateMetadata({ params }) {
  // Await params before using its properties
  const resolvedParams = await params;
  const communityName = resolvedParams.community;

  const community = await prisma.community.findUnique({
    where: { name: communityName },
  });

  if (!community) {
    return {
      title: "Community Not Found",
    };
  }

  return {
    title: `r/${communityName} - CardiNet`,
    description:
      community.description ||
      `Welcome to the ${communityName} community on CardiNet`,
  };
}

export default async function CommunityPage({ params }) {
  // Await params before using its properties
  const resolvedParams = await params;
  const communityName = resolvedParams.community;

  const community = await prisma.community.findUnique({
    where: { name: communityName },
    include: {
      owner: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
  });

  if (!community) {
    notFound();
  }

  return (
    <div>
      <CommunityHeader community={community} />

      <div className="mt-4">
        <PostList communityId={community.id} />
      </div>
    </div>
  );
}
