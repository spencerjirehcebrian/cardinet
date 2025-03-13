import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";
import { z } from "zod";

// Define validation schema
const groupSchema = z.object({
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

    const groups = await prisma.group.findMany({
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

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
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
    const result = groupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description } = body;

    // Check if group name is already taken
    const existingGroup = await prisma.group.findUnique({
      where: { name },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "group name already exists" },
        { status: 409 }
      );
    }

    // Create group
    const group = await prisma.group.create({
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
      { message: "Group created successfully", group },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
