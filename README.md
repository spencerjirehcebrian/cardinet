# Reddit Clone

A Reddit-like application built with Next.js, SQLite, and Docker.

## Features

- User authentication (signup, login, logout)
- Communities/subreddits
- Post creation and viewing
- Comments and nested replies
- Upvoting/downvoting system
- User profiles
- Simple search functionality

## Tech Stack

- **Frontend**: Next.js with React
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Containerization**: Docker
- **Styling**: Tailwind CSS
- **Authentication**: JWT with httpOnly cookies

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1. Clone the repository:

```bash
git clone https://github.com/yourusername/reddit-clone.git
cd reddit-clone
```

2. Start the application using Docker Compose:

```bash
docker-compose up
```

3. Access the application at [http://localhost:3000](http://localhost:3000)

### Seeding the Database

The application comes with a seed script to populate the database with initial data. To run it:

```bash
docker-compose exec reddit-clone npm run db:seed
```

### Test Users

After running the seed script, you can log in with these test accounts:

- Username: `admin`, Password: `admin123`
- Username: `user1`, Password: `user1pass`
- Username: `user2`, Password: `user2pass`
- Username: `user3`, Password: `user3pass`
- Username: `user4`, Password: `user4pass`
- Username: `user5`, Password: `user5pass`

## Development

### Project Structure

```
reddit-clone/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── next.config.js
├── .env.local
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── r/[community]/
│   │   ├── user/[username]/
│   │   ├── create/
│   │   ├── search/
│   │   ├── page.js
│   │   └── layout.js
│   ├── components/
│   │   ├── auth/
│   │   ├── community/
│   │   ├── post/
│   │   ├── comment/
│   │   ├── ui/
│   │   └── layout/
│   ├── lib/
│   │   ├── auth.js
│   │   ├── db.js
│   │   └── utils.js
│   └── styles/
└── .gitignore
```

### Making Changes

1. Modify the code as needed
2. The application will automatically update with your changes (hot reloading)
3. For database schema changes, run:

```bash
docker-compose exec reddit-clone npx prisma migrate dev --name your_migration_name
```

## Notes

- This application is designed for local use only
- The default JWT secret should be changed in production
- Data is stored in a SQLite database inside the Docker container at `/app/prisma/data/reddit-clone.db`
