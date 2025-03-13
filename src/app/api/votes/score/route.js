import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const resolvedParams = new URL(request.url).searchParams;
    const postId = resolvedParams.get("postId");
    const commentId = resolvedParams.get("commentId");

    // User must provide either postId or commentId
    if (!postId && !commentId) {
      return NextResponse.json(
        { error: "Either postId or commentId is required" },
        { status: 400 }
      );
    }

    // Build where clause based on provided parameters
    const whereClause = {};

    if (postId) {
      whereClause.postId = postId;
    } else if (commentId) {
      whereClause.commentId = commentId;
    }

    // Find all votes for the content
    const votes = await prisma.vote.findMany({
      where: whereClause,
      select: {
        value: true,
      },
    });

    // Calculate the score (sum of vote values)
    const score = votes.reduce((total, vote) => total + vote.value, 0);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error calculating vote score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
