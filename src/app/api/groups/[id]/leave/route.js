import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function POST(request, { params }) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Check if user is a member
    const membership = await prisma.groupsOnUsers.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (group.ownerId === user.userId) {
      return NextResponse.json(
        { error: "Group owner cannot leave the group" },
        { status: 400 }
      );
    }

    // Remove user from group
    await prisma.groupsOnUsers.delete({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.userId,
        },
      },
    });

    return NextResponse.json(
      { message: "Successfully left group" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error leaving group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
