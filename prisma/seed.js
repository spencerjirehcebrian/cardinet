const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const prisma = new PrismaClient();

// Number of entities to create
const NUM_USERS = 30;
const NUM_GROUPS = 10;
const POSTS_PER_GROUP_MIN = 5;
const POSTS_PER_GROUP_MAX = 15;
const COMMENTS_PER_POST_MIN = 3;
const COMMENTS_PER_POST_MAX = 10;
const VOTES_PER_ENTITY_MIN = 5;
const VOTES_PER_ENTITY_MAX = 20;
const MAX_FRIENDSHIPS_PER_USER = 10;
const USERS_PER_GROUP_MIN = 5;
const USERS_PER_GROUP_MAX = 20;
const SALT_ROUNDS = 10;

// Helper function to get random sample image buffer
async function getRandomImageBuffer() {
  // Create an array of image paths
  const imagePaths = [
    path.join(__dirname, "../public/sample-images/profile1.png"),
    path.join(__dirname, "../public/sample-images/profile2.png"),
    path.join(__dirname, "../public/sample-images/profile3.png"),
    path.join(__dirname, "../public/sample-images/profile4.png"),
    path.join(__dirname, "../public/sample-images/profile5.png"),
  ];

  // Select a random image path
  const randomImagePath =
    imagePaths[Math.floor(Math.random() * imagePaths.length)];

  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(randomImagePath);

    // Process and optimize the image using sharp
    const processedImageBuffer = await sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    return processedImageBuffer;
  } catch (error) {
    console.error("Error processing sample image:", error);
    return null;
  }
}

// Helper function to generate a random number between min and max
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random items from an array
const getRandomItems = (array, min, max) => {
  const numItems = getRandomInt(min, Math.min(max, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numItems);
};

// Helper function to hash password
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// University-specific data
const departments = [
  "Computer-Science",
  "Engineering",
  "Business",
  "Arts",
  "Medicine",
  "Law",
  "Architecture",
  "Education",
  "Science",
  "Social-Sciences",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Psychology",
];

const campusLocations = [
  "Main Campus",
  "North Campus",
  "South Campus",
  "Downtown Campus",
  "Medical Campus",
];

const universityActivities = [
  "Sports",
  "Clubs",
  "Events",
  "Study Groups",
  "Research",
  "Volunteering",
  "Internships",
  "Campus Jobs",
  "Housing",
  "Dining",
];

const courseRelatedTopics = [
  "Homework Help",
  "Exam Preparation",
  "Course Selection",
  "Professor Reviews",
  "Textbooks",
  "Study Materials",
  "Class Notes",
  "Project Collaboration",
  "Tutoring",
  "Academic Advising",
];

async function main() {
  console.log("🌱 Starting seed process...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.vote.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.groupsOnUsers.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.friendship.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  console.log(`Creating ${NUM_USERS} users...`);
  const users = [];

  // Create an admin user with a known password
  const adminPasswordHash = await hashPassword("adminpassword");
  // Get random profile image for admin
  const adminProfileImage = await getRandomImageBuffer();

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@university.edu",
      passwordHash: adminPasswordHash,
      birthday: faker.date.past({ years: 25 }),
      phoneNumber: faker.phone.number(),
      profileImage: adminProfileImage,
    },
  });
  users.push(admin);

  // Create regular users
  for (let i = 0; i < NUM_USERS - 1; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();

    // Add profile image with 70% probability
    const profileImage =
      Math.random() > 0.3 ? await getRandomImageBuffer() : null;

    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@university.edu`,
        passwordHash: await hashPassword("password123"),
        birthday: faker.date.past({ years: 25 }),
        phoneNumber: faker.helpers.maybe(() => faker.phone.number(), {
          probability: 0.7,
        }),
        profileImage,
      },
    });
    users.push(user);
  }

  // Create friendships
  console.log("Creating friendships...");
  for (const user of users) {
    const otherUsers = users.filter((u) => u.id !== user.id);
    const numFriends = getRandomInt(
      0,
      Math.min(MAX_FRIENDSHIPS_PER_USER, otherUsers.length)
    );
    const friends = getRandomItems(otherUsers, 0, numFriends);

    for (const friend of friends) {
      // Check if friendship already exists in either direction
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: user.id, friendId: friend.id },
            { userId: friend.id, friendId: user.id },
          ],
        },
      });

      if (!existingFriendship) {
        await prisma.friendship.create({
          data: {
            userId: user.id,
            friendId: friend.id,
          },
        });
      }
    }
  }

  // Create groups
  console.log(`Creating ${NUM_GROUPS} groups...`);
  const groups = [];

  // University department groups
  for (let i = 0; i < departments.length && i < NUM_GROUPS; i++) {
    const owner = users[getRandomInt(0, users.length - 1)];
    // Add group image with 70% probability
    const groupImage =
      Math.random() > 0.3 ? await getRandomImageBuffer() : null;

    const group = await prisma.group.create({
      data: {
        name: departments[i],
        description: `Discussion forum for the ${departments[i]} department`,
        ownerId: owner.id,
        groupImage,
      },
    });
    groups.push(group);
  }

  // If we need more groups, create additional ones with campus themes
  const remainingGroups = NUM_GROUPS - groups.length;
  if (remainingGroups > 0) {
    const groupThemes = [
      ...campusLocations,
      ...universityActivities,
      ...courseRelatedTopics,
    ];

    for (let i = 0; i < remainingGroups && i < groupThemes.length; i++) {
      const owner = users[getRandomInt(0, users.length - 1)];
      const theme = groupThemes[i];
      // Add group image with 70% probability
      const groupImage =
        Math.random() > 0.3 ? await getRandomImageBuffer() : null;

      const group = await prisma.group.create({
        data: {
          name: theme,
          description: `Discussions related to ${theme} at the university`,
          ownerId: owner.id,
          groupImage,
        },
      });
      groups.push(group);
    }
  }

  // Add members to groups
  console.log("Adding members to groups...");
  for (const group of groups) {
    // Group owner is already a member, so exclude them
    const potentialMembers = users.filter((user) => user.id !== group.ownerId);
    const numMembers = getRandomInt(
      USERS_PER_GROUP_MIN,
      Math.min(USERS_PER_GROUP_MAX, potentialMembers.length)
    );
    const members = getRandomItems(potentialMembers, numMembers, numMembers);

    for (const member of members) {
      await prisma.groupsOnUsers.create({
        data: {
          groupId: group.id,
          userId: member.id,
        },
      });
    }

    // Also add the owner as a member
    await prisma.groupsOnUsers.create({
      data: {
        groupId: group.id,
        userId: group.ownerId,
      },
    });
  }

  // Create posts for each group
  console.log("Creating posts...");
  const posts = [];
  for (const group of groups) {
    // Get all members of the group to be post authors
    const groupMembers = await prisma.groupsOnUsers.findMany({
      where: { groupId: group.id },
      select: { userId: true },
    });

    const memberIds = groupMembers.map((m) => m.userId);
    const numPosts = getRandomInt(POSTS_PER_GROUP_MIN, POSTS_PER_GROUP_MAX);

    for (let i = 0; i < numPosts; i++) {
      const authorId = memberIds[getRandomInt(0, memberIds.length - 1)];

      let title, content;
      if (departments.includes(group.name)) {
        // Academic department posts
        title = faker.helpers.arrayElement([
          `Question about ${faker.helpers.arrayElement([
            "midterm",
            "final",
            "project",
            "assignment",
          ])}`,
          `Looking for study partners for ${group.name} ${
            100 + getRandomInt(1, 4)
          }${getRandomInt(0, 9)}${getRandomInt(0, 9)}`,
          `Professor ${faker.person.lastName()} ${faker.helpers.arrayElement([
            "recommendations",
            "reviews",
            "advice",
          ])}`,
          `${faker.helpers.arrayElement([
            "Internship",
            "Research",
            "Job",
          ])} opportunity in ${group.name}`,
          `${group.name} major requirements question`,
        ]);

        content = faker.lorem.paragraphs({ min: 1, max: 3 });
      } else if (campusLocations.includes(group.name)) {
        // Campus location posts
        title = faker.helpers.arrayElement([
          `Best study spots at ${group.name}?`,
          `${group.name} ${faker.helpers.arrayElement([
            "parking",
            "dining",
            "facilities",
          ])} issues`,
          `Events happening at ${group.name} this week`,
          `Lost ${faker.helpers.arrayElement([
            "backpack",
            "laptop",
            "phone",
            "ID card",
          ])} at ${group.name}`,
          `${group.name} construction updates`,
        ]);

        content = faker.lorem.paragraphs({ min: 1, max: 3 });
      } else {
        // General university posts
        title = faker.helpers.arrayElement([
          `Thoughts on ${faker.company.name()} career fair?`,
          `How to balance ${faker.helpers.arrayElement([
            "work",
            "social life",
            "extracurriculars",
          ])} and academics?`,
          `${faker.helpers.arrayElement([
            "Housing",
            "Roommate",
            "Apartment",
          ])} advice needed`,
          `Best ${faker.helpers.arrayElement([
            "classes",
            "professors",
            "electives",
          ])} for ${faker.helpers.arrayElement(departments)}?`,
          `${group.name} ${faker.helpers.arrayElement([
            "tips",
            "advice",
            "question",
          ])}`,
        ]);

        content = faker.lorem.paragraphs({ min: 1, max: 4 });
      }

      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId,
          groupId: group.id,
        },
      });
      posts.push(post);
    }
  }

  // Create comments for posts
  console.log("Creating comments...");
  const comments = [];
  for (const post of posts) {
    // Get group members to be comment authors
    const groupMembers = await prisma.groupsOnUsers.findMany({
      where: { groupId: post.groupId },
      select: { userId: true },
    });

    const memberIds = groupMembers.map((m) => m.userId);
    const numComments = getRandomInt(
      COMMENTS_PER_POST_MIN,
      COMMENTS_PER_POST_MAX
    );

    const postComments = [];
    for (let i = 0; i < numComments; i++) {
      const authorId = memberIds[getRandomInt(0, memberIds.length - 1)];

      const comment = await prisma.comment.create({
        data: {
          content: faker.lorem.paragraph(),
          authorId,
          postId: post.id,
        },
      });

      postComments.push(comment);
      comments.push(comment);
    }

    // Add some nested comments (replies)
    if (postComments.length > 1) {
      const numReplies = getRandomInt(0, Math.min(3, postComments.length));

      for (let i = 0; i < numReplies; i++) {
        const parentComment =
          postComments[getRandomInt(0, postComments.length - 1)];
        const authorId = memberIds[getRandomInt(0, memberIds.length - 1)];

        const reply = await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            authorId,
            postId: post.id,
            parentId: parentComment.id,
          },
        });

        comments.push(reply);
      }
    }
  }

  // Create votes for posts and comments
  console.log("Creating votes...");

  // Vote on posts
  for (const post of posts) {
    // Get users who can vote (all users except the author)
    const potentialVoters = users.filter((user) => user.id !== post.authorId);
    const numVoters = getRandomInt(
      VOTES_PER_ENTITY_MIN,
      Math.min(VOTES_PER_ENTITY_MAX, potentialVoters.length)
    );
    const voters = getRandomItems(potentialVoters, numVoters, numVoters);

    for (const voter of voters) {
      // 70% chance of upvote, 30% chance of downvote
      const voteValue = Math.random() < 0.7 ? 1 : -1;

      await prisma.vote.create({
        data: {
          value: voteValue,
          userId: voter.id,
          postId: post.id,
        },
      });
    }
  }

  // Vote on comments
  for (const comment of comments) {
    // Get users who can vote (all users except the author)
    const potentialVoters = users.filter(
      (user) => user.id !== comment.authorId
    );
    const numVoters = getRandomInt(
      Math.min(VOTES_PER_ENTITY_MIN, potentialVoters.length),
      Math.min(VOTES_PER_ENTITY_MAX, potentialVoters.length)
    );
    const voters = getRandomItems(potentialVoters, numVoters, numVoters);

    for (const voter of voters) {
      // 80% chance of upvote, 20% chance of downvote for comments
      const voteValue = Math.random() < 0.8 ? 1 : -1;

      await prisma.vote.create({
        data: {
          value: voteValue,
          userId: voter.id,
          commentId: comment.id,
        },
      });
    }
  }

  // Print summary
  console.log("🌱 Seed completed successfully!");
  console.log(`Created: ${users.length} users`);
  console.log(`Created: ${groups.length} groups`);
  console.log(`Created: ${posts.length} posts`);
  console.log(`Created: ${comments.length} comments`);

  const voteCount = await prisma.vote.count();
  console.log(`Created: ${voteCount} votes`);

  const friendshipCount = await prisma.friendship.count();
  console.log(`Created: ${friendshipCount} friendships`);

  const groupMembershipCount = await prisma.groupsOnUsers.count();
  console.log(`Created: ${groupMembershipCount} group memberships`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
