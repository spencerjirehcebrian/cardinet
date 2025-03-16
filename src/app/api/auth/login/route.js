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
    const credResult = await verifyCredentials(usernameOrEmail, password);

    if (!credResult.success) {
      // Use a generic error message for both user not found and invalid password
      // This is a security best practice to prevent username enumeration
      if (
        credResult.error === "auth/user-not-found" ||
        credResult.error === "auth/invalid-password"
      ) {
        return NextResponse.json(
          { error: "Invalid username/email or password" },
          { status: 401 }
        );
      }

      // Handle other potential errors
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // User authenticated successfully
    const user = credResult.user;

    // Within your POST function:
    // Create JWT token
    const token = sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "cardinet-secret-key",
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: { id: user.id, username: user.username },
      },
      { status: 200 }
    );

    // Set cookie on the response
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    });

    return response;
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
