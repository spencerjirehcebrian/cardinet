import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

// Define validation schema
const loginSchema = z.object({
  usernameOrEmail: z.string().min(3),
  password: z.string().min(1),
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request data
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { usernameOrEmail, password } = body;

    // Verify credentials
    const user = await verifyCredentials(usernameOrEmail, password);

    // Create JWT token
    const token = sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "reddit-clone-secret-key",
      { expiresIn: "7d" }
    );

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: { id: user.id, username: user.username },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    if (
      error.message === "User not found" ||
      error.message === "Invalid password"
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
