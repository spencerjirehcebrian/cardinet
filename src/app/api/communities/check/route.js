import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Community name is required" },
      { status: 400 }
    );
  }

  try {
    const community = await prisma.community.findUnique({
      where: { name },
      select: { id: true },
    });

    return NextResponse.json({
      exists: !!community,
    });
  } catch (error) {
    console.error("Error checking community name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
