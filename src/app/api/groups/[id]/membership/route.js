// src/app/api/groups/[id]/membership/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function GET(request, { params }) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ isMember: false });
    }

    // Await params before accessing its properties
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is the owner
    if (group.ownerId === user.userId) {
      return NextResponse.json({ isMember: true, isOwner: true });
    }

    // Check if user is a member
    const membership = await prisma.groupsOnUsers.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.userId,
        },
      },
    });

    return NextResponse.json({
      isMember: !!membership,
      isOwner: false,
    });
  } catch (error) {
    console.error("Error checking group membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
