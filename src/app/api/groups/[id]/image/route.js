import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";
import sharp from "sharp";

export async function POST(request, { params }) {
  try {
    const currentUser = await getUserFromToken(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if the group exists and the current user is the owner
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify the current user is the group owner
    if (group.ownerId !== currentUser.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Only group owner can update image" },
        { status: 403 }
      );
    }

    // Get the image from the request
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert the image to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Process and optimize the image (resize and convert to WebP for efficiency)
    const processedImageBuffer = await sharp(buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    // Update group with new image
    await prisma.group.update({
      where: { id: group.id },
      data: {
        groupImage: processedImageBuffer,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Group image updated successfully" });
  } catch (error) {
    console.error("Group image upload error:", error);
    return NextResponse.json(
      { error: "Failed to update group image" },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to retrieve the group image
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const group = await prisma.group.findUnique({
      where: { id },
      select: { groupImage: true },
    });

    // Return 404 if the group doesn't exist or has no image
    if (!group || !group.groupImage) {
      return new NextResponse(null, {
        status: 404,
        headers: {
          "Content-Type": "image/webp",
        },
      });
    }

    return new NextResponse(group.groupImage, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching group image:", error);
    return new NextResponse(null, { status: 500 });
  }
}
