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
    const { username } = resolvedParams;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current user is updating their own profile
    if (user.id !== currentUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    // Update user with new profile image
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: processedImageBuffer,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Profile image updated successfully" });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to retrieve the profile image
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { username } = resolvedParams;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { profileImage: true },
    });

    // Return 404 if the user doesn't exist or has no image
    if (!user || !user.profileImage) {
      return new NextResponse(null, {
        status: 404,
        headers: {
          "Content-Type": "image/webp",
        },
      });
    }

    return new NextResponse(user.profileImage, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return new NextResponse(null, { status: 500 });
  }
}
