import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function POST(request, { params }) {
  try {
    const { username } = params;
    const currentUser = await getUserFromToken(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!["add", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'add' or 'remove'" },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if trying to add self as friend
    if (targetUser.id === currentUser.userId) {
      return NextResponse.json(
        { error: "Cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    // Check if the friendship already exists using the composite unique constraint
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        AND: [{ userId: currentUser.userId }, { friendId: targetUser.id }],
      },
    });

    if (action === "add") {
      // Add friend
      if (existingFriendship) {
        return NextResponse.json(
          { error: "Already friends with this user" },
          { status: 409 }
        );
      }

      await prisma.friendship.create({
        data: {
          userId: currentUser.userId,
          friendId: targetUser.id,
        },
      });

      return NextResponse.json(
        { message: "Friend added successfully" },
        { status: 200 }
      );
    } else {
      // Remove friend
      if (!existingFriendship) {
        return NextResponse.json(
          { error: "Not friends with this user" },
          { status: 404 }
        );
      }

      await prisma.friendship.delete({
        where: {
          id: existingFriendship.id,
        },
      });

      return NextResponse.json(
        { message: "Friend removed successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Friend action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
