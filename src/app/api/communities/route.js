import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";
import { z } from "zod";

// Define validation schema
const communitySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(21)
    .regex(/^[a-zA-Z0-9_]+$/),
  description: z.string().max(500).optional(),
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  try {
    let whereClause = {};

    if (search) {
      whereClause = {
        name: {
          contains: search,
        },
      };
    }

    const communities = await prisma.community.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: {
        members: {
          _count: "desc",
        },
      },
      take: 50,
    });

    return NextResponse.json({ communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request data
    const result = communitySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description } = body;

    // Check if community name is already taken
    const existingCommunity = await prisma.community.findUnique({
      where: { name },
    });

    if (existingCommunity) {
      return NextResponse.json(
        { error: "Community name already exists" },
        { status: 409 }
      );
    }

    // Create community
    const community = await prisma.community.create({
      data: {
        name,
        description,
        ownerId: user.userId,
        members: {
          create: {
            userId: user.userId,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Community created successfully", community },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
