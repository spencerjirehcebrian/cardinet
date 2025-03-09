import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function POST(request, { params }) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is a member
    const membership = await prisma.communitiesOnUsers.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId: user.userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this community" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (community.ownerId === user.userId) {
      return NextResponse.json(
        { error: "Community owner cannot leave the community" },
        { status: 400 }
      );
    }

    // Remove user from community
    await prisma.communitiesOnUsers.delete({
      where: {
        communityId_userId: {
          communityId: id,
          userId: user.userId,
        },
      },
    });

    return NextResponse.json(
      { message: "Successfully left community" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}