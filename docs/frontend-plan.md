# Confetti Frontend Plan

## 1. Well-Structured Project Layout

We'll use a scalable, feature-based structure:

```
confetti_client/
├── src/
│   ├── app/                 # Next.js app directory (routing, pages)
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Shared UI (buttons, modals, etc.)
│   │   ├── features/        # Feature-specific components
│   │   └── layouts/         # Layout wrappers (dashboard, auth, etc.)
│   ├── features/            # Feature modules (see breakdown below)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, API clients, config
│   ├── services/            # API service functions
│   ├── store/               # Redux store and slices
│   ├── styles/              # Global and feature styles
│   └── types/               # TypeScript types/interfaces
├── public/                  # Static assets
└── tests/                   # Unit/integration tests
```

## 2. Frontend Implementation Plan

### Phase 1: Foundation
- Set up Next.js, Tailwind CSS, ESLint, Prettier, and TypeScript.
- Configure folder structure and aliases.
- Set up Redux Toolkit for state management.
- Integrate authentication (NextAuth.js).

### Phase 2: Core Features
- **User Management**: Auth pages, profile, settings.
- **Event Planning**: Event creation, dashboard, timeline, guest list.
- **Vendor Marketplace**: Vendor search, profiles, booking.
- **AI/ML Integration**: Connect to backend for recommendations, budget tools.

### Phase 3: Advanced Features
- **Analytics & Reporting**: User dashboards, event stats, vendor metrics.
- **Communication**: Real-time chat, notifications, calendar integration.
- **Admin Tools**: User/content management, moderation, support.

### Phase 4: Polish & Testing
- Responsive design, accessibility.
- Unit/integration tests.
- Documentation and deployment.

## 3. Detailed Documentation

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Project Structure**
   - `src/app/`: Routing and page entry points.
   - `src/components/`: UI building blocks.
   - `src/features/`: Each feature (user, event, vendor, etc.) gets its own folder.
   - `src/services/`: API calls, backend integration.
   - `src/store/`: Redux slices and store config.
   - `src/types/`: TypeScript types for data models.

4. **Styling**
   - Tailwind CSS for utility-first styling.
   - Custom styles in `src/styles/`.

5. **State Management**
   - Redux Toolkit for global state.
   - React Context for local state if needed.

6. **API Integration**
   - Use Axios or Fetch in `src/services/`.
   - All backend endpoints should be abstracted in service files.

7. **Authentication**
   - NextAuth.js for user sessions and role-based access.

8. **Testing**
   - Jest and React Testing Library for unit/integration tests.

## 4. Feature Breakdown into Modules

Each module will have its own folder under `src/features/` and may include pages, components, slices, and services.

### 1. Core User Management (`src/features/user`)
- Auth (login, register, forgot password)
- Profile (view/edit)
- Preferences/settings
- Role-based access

### 2. Event Simulation & Planning (`src/features/event`)
- Event CRUD
- Budget tools
- Venue selection
- Guest list
- Timeline & tasks
- Cost estimation

### 3. AI/ML Integration (`src/features/ai`)
- Budget optimization
- Price prediction
- Vendor matching
- Recommendations
- NLP for event details

### 4. Vendor Management (`src/features/vendor`)
- Vendor registration
- Profile/portfolio
- Service catalog
- Pricing/availability
- Reviews/ratings

### 5. Marketplace & Booking (`src/features/marketplace`)
- Vendor search/filter
- Booking management
- Payments
- Contracts
- Communication
- Reviews

### 6. Analytics & Reporting (`src/features/analytics`)
- User analytics
- Vendor metrics
- Event stats
- Financial reports
- Trends

### 7. Communication & Notifications (`src/features/communication`)
- Real-time chat
- Email/push notifications
- Calendar/reminders
- Announcements

### 8. Admin & Management (`src/features/admin`)
- User/content management
- System config
- Moderation
- Support tickets
- Audit logs 