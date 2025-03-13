import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth";
import { z } from "zod";

// Define validation schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z
    .string()
    .email()
    .refine((email) => email.endsWith("@mymail.mapua.edu.ph"), {
      message:
        "Email must be a valid Mapua school email (@mymail.mapua.edu.ph)",
    }),
  password: z.string().min(8),
  birthday: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  phoneNumber: z.string().optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request data
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, email, password } = body;

    // Create user
    const user = await createUser({ username, email, password });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (
      error.message === "Username already exists" ||
      error.message === "Email already exists"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
