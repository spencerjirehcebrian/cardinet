import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "25");
  const period = searchParams.get("period") || "week"; // day, week, month, all
  const skip = (page - 1) * limit;

  try {
    // Calculate the date range based on the period
    let dateFilter = {};
    const now = new Date();

    if (period === "day") {
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      dateFilter = {
        createdAt: {
          gte: oneDayAgo,
        },
      };
    } else if (period === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      dateFilter = {
        createdAt: {
          gte: oneWeekAgo,
        },
      };
    } else if (period === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      dateFilter = {
        createdAt: {
          gte: oneMonthAgo,
        },
      };
    }

    // First, get posts with their votes to calculate the score
    const posts = await prisma.post.findMany({
      where: dateFilter,
      include: {
        author: {
          select: {
            username: true,
          },
        },
        community: {
          select: {
            name: true,
          },
        },
        votes: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate vote score for each post
    const postsWithScores = posts.map((post) => {
      const score = post.votes.reduce((acc, vote) => acc + vote.value, 0);
      const { votes, ...postWithoutVotes } = post;
      return {
        ...postWithoutVotes,
        score,
        _count: {
          ...post._count,
          votes: votes.length,
        },
      };
    });

    // Sort by score
    const sortedPosts = postsWithScores.sort((a, b) => b.score - a.score);

    // Apply pagination
    const paginatedPosts = sortedPosts.slice(skip, skip + limit);

    // Calculate total for pagination
    const totalCount = sortedPosts.length;

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
