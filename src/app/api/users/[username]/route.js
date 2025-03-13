import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromToken } from "@/lib/utils";

export async function GET(request, { params }) {
  // Await params before using its properties
  const resolvedParams = await params;
  const username = resolvedParams.username;

  try {
    // Get the user profile
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
            group: {
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
                group: {
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
        // Get friends that the user has added
        friendsAdded: {
          select: {
            friend: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        // Get users who have added this user as a friend
        friendsOf: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform friendsAdded and friendsOf into a single friends array
    const friends = [
      ...user.friendsAdded.map((relation) => relation.friend),
      ...user.friendsOf.map((relation) => relation.user),
    ];

    // Remove the original friendsAdded and friendsOf and add the combined friends
    const { friendsAdded, friendsOf, ...userWithoutFriendRelations } = user;
    const userWithFriends = {
      ...userWithoutFriendRelations,
      friends,
    };

    // Check if the requester is logged in
    const requestUser = await getUserFromToken(request);

    // Get upvoted and downvoted content
    // Important: We're now making this available regardless of who's viewing the profile
    // This is for demo purposes - in a production app, you'd likely want privacy controls
    const upvotedContent = await getVotedContent(user.id, 1);
    const downvotedContent = await getVotedContent(user.id, -1);

    // Add the upvoted and downvoted content to the user object
    userWithFriends.upvotedContent = upvotedContent;
    userWithFriends.downvotedContent = downvotedContent;

    return NextResponse.json(userWithFriends);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get voted content (posts and comments)
async function getVotedContent(userId, voteValue) {
  try {
    // Get votes with the specified value
    const votes = await prisma.vote.findMany({
      where: {
        userId: userId,
        value: voteValue,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            group: {
              select: {
                name: true,
              },
            },
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            post: {
              select: {
                id: true,
                title: true,
                group: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the votes data for easier consumption by the frontend
    return votes
      .map((vote) => {
        if (vote.post) {
          return {
            ...vote.post,
            type: "post",
          };
        } else if (vote.comment) {
          return {
            ...vote.comment,
            type: "comment",
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error getting voted content:", error);
    return [];
  }
}
