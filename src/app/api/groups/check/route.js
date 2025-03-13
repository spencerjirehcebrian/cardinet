import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 }
    );
  }

  try {
    const group = await prisma.group.findUnique({
      where: { name },
      select: { id: true },
    });

    return NextResponse.json({
      exists: !!group,
    });
  } catch (error) {
    console.error("Error checking group name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
