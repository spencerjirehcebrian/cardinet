import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function GET(request) {
  try {
    // Verify user is authenticated
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get all friends (both directions of friendship)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId: user.userId }, { friendId: user.userId }],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    // Extract all friend IDs (from both directions)
    const friendIds = friendships
      .flatMap((friendship) => [
        friendship.userId === user.userId ? friendship.friendId : null,
        friendship.friendId === user.userId ? friendship.userId : null,
      ])
      .filter(Boolean);

    // If user has no friends, return empty array
    if (friendIds.length === 0) {
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
        },
      });
    }

    // Get posts from friends
    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: friendIds,
        },
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: {
        authorId: {
          in: friendIds,
        },
      },
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching friends' posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
