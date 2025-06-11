This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Confetti - AI-Powered Event Planning Platform

## Project Overview
Confetti is a comprehensive event planning platform that leverages AI to help users plan events, connect with vendors, and optimize budgets. The platform serves three main user types: individual users, professional event planners, and vendors.

## Tech Stack
- **Frontend Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **API Integration**: Axios
- **Authentication**: NextAuth.js
- **Real-time Features**: Socket.io
- **Testing**: Jest + React Testing Library

## Project Structure
```
confetti_client/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/         # Reusable components
│   │   ├── common/        # Shared components
│   │   ├── features/      # Feature-specific components
│   │   └── layouts/       # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   ├── services/          # API services
│   ├── store/             # Redux store configuration
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── tests/                 # Test files
```

## Features Breakdown

### 1. Core User Management
- User registration and authentication
- Profile management
- Role-based access control
- User preferences and settings
- Account management

### 2. Event Simulation & Planning
- Event creation and management
- Budget simulation tools
- Venue selection and management
- Guest list management
- Timeline creation
- Task management
- Basic cost estimation

### 3. AI/ML Integration
- Budget optimization algorithms
- Price prediction models
- Vendor matching system
- Recommendation engine
- Event simulation models
- Natural language processing

### 4. Vendor Management
- Vendor registration and profiles
- Portfolio management
- Service catalog
- Pricing management
- Availability calendar
- Rating and review system

### 5. Marketplace & Booking
- Vendor search and filtering
- Booking management
- Payment processing
- Contract management
- Communication system
- Review and feedback system

### 6. Analytics & Reporting
- User analytics
- Vendor performance metrics
- Event statistics
- Financial reporting
- Market trends analysis
- Custom reports generation

### 7. Communication & Notifications
- Real-time messaging
- Email notifications
- Push notifications
- Calendar integration
- Reminder system
- Announcement system

### 8. Admin & Management
- User management
- Content management
- System configuration
- Moderation tools
- Support ticket system
- Audit logging

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd confetti_client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Guidelines

### Code Style
- Follow the ESLint and Prettier configurations
- Use TypeScript for type safety
- Follow the component structure guidelines
- Write meaningful commit messages

### Testing
- Write unit tests for components
- Write integration tests for features
- Maintain good test coverage

### Git Workflow
- Use feature branches
- Create pull requests for new features
- Follow the conventional commits specification

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
[License Type] - See LICENSE file for details 
