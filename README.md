# CardiNet - The Mapuan Social and Community Network

## Overview

CardiNet is a social and community platform tailored for Mapua University students, designed to foster connection, discovery, and collaboration. Built with Next.js, Prisma, and other modern technologies, CardiNet aims to provide a seamless and engaging experience for its users.

## Features

- **Authentication**: Secure user registration and login using bcryptjs and JWTs.
- **User Profiles**: Customizable profiles with posts, comments, friends, and up/downvoted content.
- **Groups**: Create and join groups to discuss shared interests and topics.
- **Posts**: Share thoughts, ideas, and updates within groups.
- **Comments**: Engage in discussions by commenting on posts.
- **Voting**: Upvote or downvote posts and comments to curate content.
- **Friendships**: Connect with other users by adding them as friends.
- **Search**: Find groups, posts, and users easily.
- **Image Uploads**: Upload and optimize profile and group images using sharp.
- **Pagination**: Efficiently load content with pagination.
- **Responsive Design**: Built with Tailwind CSS for a consistent experience across devices.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) - React framework with server-side rendering and API routes
- **Database**: [SQLite](https://sqlite.org/) with [Prisma ORM](https://prisma.io/) - Type-safe database client
- **Authentication**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing, [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) for JWT tokens
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) - High-performance image processing
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Containerization**: [Docker](https://docker.com/) - Application containerization

## Architecture Overview

CardiNet follows a modern full-stack architecture built on Next.js 13+ with the App Router pattern. The application is designed as a monolithic social platform with clear separation of concerns.

### Core Architecture Patterns

- **Next.js App Router**: Utilizes the latest App Router for file-based routing and server components
- **API Routes**: RESTful API endpoints in `/src/app/api/` handle all server-side logic
- **Component-Based UI**: Modular React components organized by feature domain
- **Database-First Design**: Prisma schema defines the data model with type safety
- **Context-Based State Management**: React Context for authentication and global state

### Database Schema & Relations

The database uses a relational model with the following core entities:

- **User**: Central entity with authentication, profile data, and relationships
- **Group**: Community spaces with membership management
- **Post**: Content entities within groups with voting and comments
- **Comment**: Nested discussion threads with parent-child relationships
- **Vote**: Upvote/downvote system for posts and comments
- **Friendship**: Bidirectional user relationships
- **GroupsOnUsers**: Many-to-many join table for group memberships

Key relationships:
- Users can join multiple groups and create posts within them
- Posts belong to groups and can receive comments and votes
- Comments support nested replies (parent-child relationships)
- Voting system allows users to upvote/downvote posts and comments
- Friendship system enables social connections between users

### Authentication System

CardiNet implements a custom JWT-based authentication system:

- **Password Security**: bcryptjs with salt rounds for secure password hashing
- **JWT Tokens**: HTTP-only cookies for secure session management
- **AuthContext**: React Context provides authentication state across the app
- **Protected Routes**: Server-side authentication checks in API routes
- **Session Persistence**: Local storage for client-side user state

### API Architecture

The API follows RESTful conventions with the following structure:

- **Authentication**: `/api/auth/` - login, register, logout endpoints
- **Users**: `/api/users/` - user profiles, search, friendship management
- **Groups**: `/api/groups/` - group CRUD, membership, image uploads
- **Posts**: `/api/posts/` - content creation, feeds (recent, popular, friends)
- **Comments**: `/api/comments/` - comment creation and management
- **Votes**: `/api/votes/` - voting system for posts and comments

### Frontend Architecture

The frontend is organized into feature-based components:

- **Layout Components**: Header, sidebars, navigation (`/components/layout/`)
- **Feature Components**: Auth, posts, comments, groups, users (`/components/`)
- **UI Components**: Reusable UI elements like buttons, avatars (`/components/ui/`)
- **Pages**: Next.js pages with server-side data fetching (`/app/`)
- **Client Components**: Interactive components with React hooks

### Key Features Implementation

**Social Features**:
- Group-based content organization
- Friendship system with mutual connections
- Voting system for content curation
- Nested comment threads
- User profiles with activity history

**Content Management**:
- Image uploads with Sharp processing
- Search functionality across posts, groups, and users
- Pagination for efficient content loading
- Real-time content filtering and sorting

**User Experience**:
- Responsive design with Tailwind CSS
- Onboarding tour with [Shepherd.js](https://shepherdjs.dev/)
- Mobile device blocking for desktop-first experience
- Optimized image handling and caching

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/cardinet.git
    cd cardinet
    ```

2.  **Install dependencies:**

    ```bash
    npm instal
    ```

3.  **Set up environment variables:**

    - Create a `.env` file based on `.env.example`.
    - Configure the database URL (`DATABASE_URL`), JWT secret (`JWT_SECRET`), and other environment variables.

    ```
    DATABASE_URL="file:/app/prisma/data/cardinet.db"
    JWT_SECRET="your-secure-jwt-secret-change-this"
    SEED_DATABASE=true
    NODE_ENV=development
    NEXT_PUBLIC_SITE_URL="http://localhost:3000"
    ```

4.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database (optional):**

    ```bash
    node prisma/seed.js
    ```

6.  **Start the development server:**

    ```bash
    npm run dev
    ```

    CardiNet will be running at `http://localhost:3000`.

### Docker Deployment (Optional)

1.  **Build the Docker image:**

    ```bash
    docker build -t cardinet .
    ```

2.  **Run the Docker container:**

    ```bash
    docker-compose up -d
    ```

    This will start the application in a Docker container, accessible at `http://localhost:3000`.

## Development

- **Directory Structure**

  ```
  cardinet/
  ├── prisma/                  # Prisma schema and migrations
  ├── src/
  │   ├── app/               # Next.js application directory
  │   │   ├── api/           # API routes
  │   │   ├── auth/          # Authentication pages
  │   │   ├── components/    # Reusable React components
  │   │   ├── lib/           # Utility functions and database connection
  │   │   └── globals.css    # Global CSS styles
  ├── .env.example           # Example environment variables
  ├── .eslintrc.json         # ESLint configuration
  ├── .gitignore             # Git ignore file
  ├── docker-compose.yml     # Docker Compose configuration
  ├── Dockerfile             # Docker image definition
  ├── jsconfig.json          # JavaScript configuration
  ├── next-env.d.ts          # Next.js environment types
  ├── next.config.js         # Next.js configuration
  ├── package.json           # Project dependencies
  ├── postcss.config.mjs     # PostCSS configuration
  ├── tailwind.config.js     # Tailwind CSS configuration
  └── tsconfig.json          # TypeScript configuration
  ```

- **Coding Style**

  - Follow the Airbnb JavaScript Style Guide
  - Use ESLint and Prettier for consistent formatting

- **Commit Conventions**
  - Use conventional commits

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. See `CONTRIBUTING.md` (example) for more details.

## License

This project is licensed under the [MIT License](LICENSE).
