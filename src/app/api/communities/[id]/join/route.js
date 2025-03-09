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

    // Check if user is already a member
    const existingMembership = await prisma.communitiesOnUsers.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId: user.userId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this community" },
        { status: 409 }
      );
    }

    // Add user to community
    await prisma.communitiesOnUsers.create({
      data: {
        communityId: id,
        userId: user.userId,
      },
    });

    return NextResponse.json(
      { message: "Successfully joined community" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
