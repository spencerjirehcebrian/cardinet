import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function GET(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");

    // User must provide either postId or commentId
    if (!postId && !commentId) {
      return NextResponse.json(
        { error: "Either postId or commentId is required" },
        { status: 400 }
      );
    }

    // Build where clause based on provided parameters
    const whereClause = {
      userId: user.userId,
    };

    if (postId) {
      whereClause.postId = postId;
    } else if (commentId) {
      whereClause.commentId = commentId;
    }

    // Get the vote
    const vote = await prisma.vote.findFirst({
      where: whereClause,
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error("Error fetching vote status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
