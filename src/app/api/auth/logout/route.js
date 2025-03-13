import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get the cookie store
    const cookieStore = cookies();

    // Create a response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Delete the cookie by setting it with an expired date
    response.cookies.set({
      name: "auth-token",
      value: "",
      httpOnly: true,
      path: "/",
      expires: new Date(0), // Set to epoch time to expire immediately
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
