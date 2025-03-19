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

- **Framework**: Next.js
- **Database**: SQLite (Prisma ORM)
- **Authentication**: bcryptjs, jsonwebtoken
- **Styling**: Tailwind CSS
- **Image Processing**: Sharp
- **Validation**: Zod
- **Containerization**: Docker

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
    npm install # or yarn install
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
    npm run dev # or yarn dev
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
