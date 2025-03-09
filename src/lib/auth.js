import { hash, compare } from "bcryptjs";
import prisma from "./db";

export async function createUser({ username, email, password }) {
  // Check if username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new Error("Username already exists");
    }
    if (existingUser.email === email) {
      throw new Error("Email already exists");
    }
  }

  // Hash the password
  const passwordHash = await hash(password, 12);

  // Create the user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  });

  return { id: user.id, username: user.username };
}

export async function verifyCredentials(usernameOrEmail, password) {
  // Find the user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify the password
  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error("Invalid password");
  }

  return { id: user.id, username: user.username };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      posts: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  return user;
}

export async function getUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      posts: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          community: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
              community: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  return user;
}
