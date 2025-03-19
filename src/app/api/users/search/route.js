import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    // For SQLite, we'll simplify the search by using contains without mode
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
            },
          },
          {
            email: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            friendsAdded: true,
            friendsOf: true,
          },
        },
      },
      orderBy: {
        username: "asc",
      },
      skip,
      take: limit,
    });

    // Calculate total count for pagination
    const totalCount = await prisma.user.count({
      where: {
        OR: [
          {
            username: {
              contains: query,
            },
          },
          {
            email: {
              contains: query,
            },
          },
        ],
      },
    });

    // Process users to add total friends count
    const processedUsers = users.map((user) => ({
      ...user,
      _count: {
        ...user._count,
        friends: user._count.friendsAdded + user._count.friendsOf,
      },
    }));

    return NextResponse.json({
      users: processedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
