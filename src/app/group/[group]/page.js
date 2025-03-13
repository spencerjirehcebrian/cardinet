import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import GroupHeader from "@/components/group/GroupHeader";
import PostList from "@/components/post/PostList";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const groupName = resolvedParams.group;

  const group = await prisma.group.findUnique({
    where: { name: groupName },
  });

  if (!group) {
    return {
      title: "Group Not Found",
    };
  }

  return {
    title: `${groupName} - CardiNet`,
    description:
      group.description || `Welcome to the ${groupName} group on CardiNet`,
  };
}

export default async function groupPage({ params }) {
  const resolvedParams = await params;
  const groupName = resolvedParams.group;

  const group = await prisma.group.findUnique({
    where: { name: groupName },
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

  if (!group) {
    notFound();
  }

  return (
    <div>
      <GroupHeader group={group} />

      <div className="mt-4">
        <PostList groupId={group.id} />
      </div>
    </div>
  );
}
