import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";
import { z } from "zod";

// Define validation schema
const voteSchema = z
  .object({
    value: z.number().min(-1).max(1).int(),
    postId: z.string().optional(),
    commentId: z.string().optional(),
  })
  .refine((data) => data.postId || data.commentId, {
    message: "Either postId or commentId must be provided",
    path: ["postId", "commentId"],
  });

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request data
    const result = voteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { value, postId, commentId } = body;

    // Check if the content (post or comment) exists
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }
    }

    // Check if user has already voted on this content
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.userId,
        postId,
        commentId,
      },
    });

    if (existingVote) {
      // Update existing vote
      if (value === 0) {
        // Remove vote if value is 0
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });

        return NextResponse.json(
          { message: "Vote removed successfully" },
          { status: 200 }
        );
      } else {
        // Update vote value
        const updatedVote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });

        return NextResponse.json(
          { message: "Vote updated successfully", vote: updatedVote },
          { status: 200 }
        );
      }
    } else if (value !== 0) {
      // Create new vote
      const vote = await prisma.vote.create({
        data: {
          value,
          userId: user.userId,
          postId,
          commentId,
        },
      });

      return NextResponse.json(
        { message: "Vote created successfully", vote },
        { status: 201 }
      );
    } else {
      // No existing vote and value is 0, nothing to do
      return NextResponse.json(
        { message: "No action required" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
