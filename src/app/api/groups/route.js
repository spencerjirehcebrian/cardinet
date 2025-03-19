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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    let whereClause = {};

    if (search) {
      // Since SQLite doesn't support case-insensitive search with mode parameter,
      // we use the `contains` operator without the mode parameter
      whereClause = {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ],
      };
    }

    // First, get the total count for pagination
    const totalCount = await prisma.group.count({
      where: whereClause,
    });

    // Then fetch the groups with pagination
    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: [
        // Then order by member count
        {
          members: {
            _count: "desc",
          },
        },
      ],
      skip,
      take: limit,
    });

    return NextResponse.json({
      groups,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
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
