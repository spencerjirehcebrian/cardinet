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

    // Check if user is already a member
    const existingMembership = await prisma.groupsOnUsers.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.userId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this group" },
        { status: 409 }
      );
    }

    // Add user to group
    await prisma.groupsOnUsers.create({
      data: {
        groupId: id,
        userId: user.userId,
      },
    });

    return NextResponse.json(
      { message: "Successfully joined group" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
