# Event Dashboard - Design Document

## Overview

The Event Dashboard is a comprehensive interface that serves as the central hub for event management. It provides users with a visual, interactive way to view, filter, sort, search, and manage all their events. The design emphasizes usability, performance, and scalability while maintaining consistency with the existing Confetti platform design system.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Event Dashboard Page                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Dashboard Header Component                 │ │
│  │  - Statistics Panel                                     │ │
│  │  - Create Event Button                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Filters & Search Component                 │ │
│  │  - Search Bar                                           │ │
│  │  - Status Filter                                        │ │
│  │  - Date Range Filter                                    │ │
│  │  - Event Type Filter                                    │ │
│  │  - Sort Options                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Event Grid Component                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Event   │  │  Event   │  │  Event   │            │ │
│  │  │  Card 1  │  │  Card 2  │  │  Card 3  │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Event   │  │  Event   │  │  Event   │            │ │
│  │  │  Card 4  │  │  Card 5  │  │  Card 6  │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Pagination Component                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DashboardPage
├── DashboardLayout
│   ├── DashboardHeader
│   │   ├── StatisticsPanel
│   │   │   ├── StatCard (Total Events)
│   │   │   ├── StatCard (Upcoming Events)
│   │   │   ├── StatCard (Completed Events)
│   │   │   └── StatCard (Total Budget)
│   │   └── CreateEventButton
│   ├── FiltersBar
│   │   ├── SearchInput
│   │   ├── StatusFilter
│   │   ├── DateRangeFilter
│   │   ├── EventTypeFilter
│   │   ├── SortDropdown
│   │   └── ClearFiltersButton
│   ├── BulkActionsToolbar (conditional)
│   ├── EventGrid
│   │   ├── EventCard (multiple)
│   │   │   ├── EventImage
│   │   │   ├── EventInfo
│   │   │   │   ├── EventTitle
│   │   │   │   ├── EventDate
│   │   │   │   ├── EventLocation
│   │   │   │   ├── StatusBadge
│   │   │   │   ├── ProgressBar (conditional)
│   │   │   │   └── TaskCounter
│   │   │   └── QuickActionsMenu
│   │   │       ├── ViewAction
│   │   │       ├── EditAction
│   │   │       ├── DeleteAction
│   │   │       ├── ShareAction
│   │   │       └── DuplicateAction
│   │   └── EmptyState (conditional)
│   └── Pagination
└── Modals
    ├── DeleteConfirmationModal
    ├── ShareEventModal
    └── UpgradePromptModal
```

### Data Flow

```
User Action → Component → Context/State → API Call → Backend
                ↓                                        ↓
            UI Update ← State Update ← Response ← Database
```

**State Management Flow:**

1. User interacts with dashboard (filter, search, sort)
2. Component updates local state
3. Effect triggers API call with new parameters
4. Loading state displayed
5. API response updates global state (Context)
6. Components re-render with new data
7. Cache updated for performance

## Components and Interfaces

### 1. DashboardPage Component

**Purpose:** Main page component that orchestrates the dashboard

**Props:**

```typescript
interface DashboardPageProps {
  initialFilters?: EventFilters;
  initialSort?: SortOptions;
}
```

**State:**

```typescript
interface DashboardState {
  events: Event[];
  filteredEvents: Event[];
  selectedEvents: string[];
  filters: EventFilters;
  sort: SortOptions;
  searchQuery: string;
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationState;
  statistics: EventStatistics;
}
```

### 2. EventCard Component

**Purpose:** Display individual event information with quick actions

**Props:**

```typescript
interface EventCardProps {
  event: Event;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
  onView: (eventId: string) => void;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onShare: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
}
```

**Visual Design:**

- Card with shadow and hover effect
- Event image/thumbnail at top (16:9 aspect ratio)
- Event title (truncated to 2 lines)
- Date with calendar icon
- Location with map pin icon
- Status badge (color-coded)
- Progress bar (if in planning)
- Task counter badge
- Three-dot menu for quick actions
- Checkbox for bulk selection (top-left corner)

### 3. FiltersBar Component

**Purpose:** Provide filtering, searching, and sorting controls

**Props:**

```typescript
interface FiltersBarProps {
  filters: EventFilters;
  sort: SortOptions;
  searchQuery: string;
  onFilterChange: (filters: EventFilters) => void;
  onSortChange: (sort: SortOptions) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}
```

**Layout:**

- Horizontal bar with responsive stacking on mobile
- Search input (left side, expandable on mobile)
- Filter dropdowns (center)
- Sort dropdown (right side)
- Active filter chips below bar
- Clear all button (appears when filters active)

### 4. StatisticsPanel Component

**Purpose:** Display event statistics overview

**Props:**

```typescript
interface StatisticsPanelProps {
  statistics: EventStatistics;
  isLoading: boolean;
}
```

**Metrics Displayed:**

- Total Events (with icon)
- Upcoming Events (with countdown to next)
- Completed Events (with percentage)
- Total Budget (with currency formatting)

### 5. BulkActionsToolbar Component

**Purpose:** Provide bulk operations on selected events

**Props:**

```typescript
interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: EventStatus) => void;
  onDeselectAll: () => void;
}
```

## Data Models

### Event Model

```typescript
interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  eventType: EventType;
  date: Date;
  endDate?: Date;
  location: string;
  venue?: string;
  guestCount: number;
  budget: number;
  status: EventStatus;
  progress: number; // 0-100
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
  vendors: Vendor[];
  teamMembers: TeamMember[];
}

enum EventStatus {
  DRAFT = "draft",
  PLANNING = "planning",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

enum EventType {
  WEDDING = "wedding",
  CORPORATE = "corporate",
  BIRTHDAY = "birthday",
  GRADUATION = "graduation",
  CONFERENCE = "conference",
  OTHER = "other",
}
```

### Filter Model

```typescript
interface EventFilters {
  status?: EventStatus[];
  eventType?: EventType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
}

interface SortOptions {
  field: "date" | "name" | "status" | "createdAt" | "budget";
  order: "asc" | "desc";
}
```

### Statistics Model

```typescript
interface EventStatistics {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalBudget: number;
  eventsByStatus: Record<EventStatus, number>;
  nextEvent?: {
    id: string;
    title: string;
    date: Date;
    daysUntil: number;
  };
}
```

### Pagination Model

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
```

## API Endpoints

### GET /api/v1/events

**Purpose:** Fetch events with filtering, sorting, and pagination

**Query Parameters:**

```typescript
{
  page?: number;
  limit?: number;
  status?: string; // comma-separated
  eventType?: string; // comma-separated
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**

```typescript
{
  status: 'success';
  data: {
    events: Event[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
    };
  };
}
```

### GET /api/v1/events/statistics

**Purpose:** Fetch event statistics for the dashboard

**Response:**

```typescript
{
  status: "success";
  data: EventStatistics;
}
```

### DELETE /api/v1/events/:id

**Purpose:** Delete a single event

**Response:**

```typescript
{
  status: "success";
  message: "Event deleted successfully";
}
```

### POST /api/v1/events/:id/duplicate

**Purpose:** Create a duplicate of an event

**Response:**

```typescript
{
  status: "success";
  data: {
    event: Event;
  }
  message: "Event duplicated successfully";
}
```

### DELETE /api/v1/events/bulk

**Purpose:** Delete multiple events

**Request Body:**

```typescript
{
  eventIds: string[];
}
```

**Response:**

```typescript
{
  status: "success";
  message: "Events deleted successfully";
  data: {
    deletedCount: number;
  }
}
```

### PATCH /api/v1/events/bulk/status

**Purpose:** Update status for multiple events

**Request Body:**

```typescript
{
  eventIds: string[];
  status: EventStatus;
}
```

**Response:**

```typescript
{
  status: "success";
  message: "Events updated successfully";
  data: {
    updatedCount: number;
  }
}
```

## Error Handling

### Error Types

1. **Network Errors**

   - Display toast notification
   - Show retry button
   - Maintain last known state

2. **Authorization Errors**

   - Redirect to login
   - Clear cached data
   - Show session expired message

3. **Validation Errors**

   - Display inline error messages
   - Highlight problematic fields
   - Prevent form submission

4. **Server Errors**
   - Display user-friendly error message
   - Log error details for debugging
   - Provide contact support option

### Error States

```typescript
interface ErrorState {
  type: "network" | "auth" | "validation" | "server";
  message: string;
  details?: any;
  retryable: boolean;
}
```

### Error Handling Strategy

```typescript
try {
  const response = await fetchEvents(filters);
  setEvents(response.data.events);
} catch (error) {
  if (error.status === 401) {
    // Handle auth error
    redirectToLogin();
  } else if (error.status >= 500) {
    // Handle server error
    showErrorToast("Server error. Please try again later.");
  } else {
    // Handle other errors
    showErrorToast(error.message);
  }
  setError(error);
}
```

## Testing Strategy

### Unit Tests

**Components to Test:**

- EventCard rendering with different event states
- FiltersBar filter application logic
- StatisticsPanel calculations
- Pagination component navigation
- BulkActionsToolbar selection logic

**Test Cases:**

```typescript
describe("EventCard", () => {
  it("should render event information correctly", () => {});
  it("should display status badge with correct color", () => {});
  it("should show progress bar for planning status", () => {});
  it("should call onDelete when delete is clicked", () => {});
  it("should show checkbox when in selection mode", () => {});
});

describe("FiltersBar", () => {
  it("should apply status filter correctly", () => {});
  it("should combine multiple filters with AND logic", () => {});
  it("should debounce search input", () => {});
  it("should clear all filters when clear button clicked", () => {});
});
```

### Integration Tests

**Scenarios to Test:**

- Fetch and display events on page load
- Apply filters and verify API call parameters
- Search events and verify results
- Sort events and verify order
- Delete event and verify removal from list
- Duplicate event and verify new event appears
- Bulk delete multiple events
- Pagination navigation

### E2E Tests

**User Flows:**

1. User logs in → Dashboard loads → Events displayed
2. User searches for event → Results filtered → Event found
3. User applies filters → Events filtered → Correct events shown
4. User deletes event → Confirmation shown → Event removed
5. User creates event → Redirected to form → Returns to dashboard with new event

## Performance Considerations

### Optimization Strategies

1. **Data Fetching**

   - Implement pagination (12 events per page)
   - Cache API responses for 5 minutes
   - Use SWR or React Query for data fetching
   - Implement optimistic updates for better UX

2. **Rendering**

   - Use React.memo for EventCard components
   - Implement virtual scrolling for large lists
   - Lazy load event images
   - Debounce search input (300ms)

3. **State Management**

   - Use Context API for global state
   - Implement local state for UI-only changes
   - Avoid unnecessary re-renders with useMemo/useCallback

4. **Bundle Size**
   - Code split dashboard components
   - Lazy load modals
   - Use dynamic imports for heavy libraries

### Performance Metrics

- **Initial Load:** < 2 seconds
- **Filter Application:** < 500ms
- **Search Results:** < 300ms (after debounce)
- **Page Navigation:** < 200ms
- **Action Feedback:** Immediate (optimistic updates)

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**

   - All interactive elements accessible via keyboard
   - Logical tab order
   - Visible focus indicators
   - Keyboard shortcuts for common actions

2. **Screen Reader Support**

   - Semantic HTML elements
   - ARIA labels for icons and actions
   - ARIA live regions for dynamic updates
   - Descriptive alt text for images

3. **Visual Design**

   - Color contrast ratio ≥ 4.5:1
   - Text resizable up to 200%
   - No information conveyed by color alone
   - Clear visual hierarchy

4. **Interactive Elements**
   - Minimum touch target size: 44x44px
   - Clear hover/focus states
   - Descriptive button labels
   - Error messages associated with fields

### ARIA Implementation

```typescript
// Event Card
<article
  role="article"
  aria-labelledby={`event-title-${event.id}`}
  aria-describedby={`event-details-${event.id}`}
>
  <h3 id={`event-title-${event.id}`}>{event.title}</h3>
  <div id={`event-details-${event.id}`}>
    {/* Event details */}
  </div>
</article>

// Search Input
<input
  type="search"
  role="searchbox"
  aria-label="Search events"
  aria-describedby="search-help"
/>

// Filter Dropdown
<select
  aria-label="Filter by status"
  aria-describedby="status-filter-help"
>
  {/* Options */}
</select>
```

## Responsive Design

### Breakpoints

- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### Layout Adaptations

**Mobile (320px - 767px):**

- Single column event grid
- Stacked filters (collapsible)
- Hamburger menu for actions
- Bottom sheet for modals
- Simplified statistics (2 columns)

**Tablet (768px - 1023px):**

- Two column event grid
- Horizontal filters bar
- Side drawer for actions
- Modal dialogs
- Statistics in 4 columns

**Desktop (1024px+):**

- Three column event grid
- Full filters bar with all options visible
- Dropdown menus for actions
- Modal dialogs
- Statistics in 4 columns with more details

### Touch Interactions

- Swipe to reveal quick actions on mobile
- Pull to refresh on mobile
- Long press for bulk selection
- Tap outside to close modals

## Security Considerations

### Authentication & Authorization

1. **Access Control**

   - Verify user authentication on page load
   - Check event ownership before displaying
   - Validate permissions for all actions
   - Implement role-based access control

2. **Data Protection**

   - Never expose sensitive data in URLs
   - Sanitize all user inputs
   - Implement CSRF protection
   - Use HTTPS for all API calls

3. **API Security**
   - Include authentication token in headers
   - Validate all request parameters
   - Implement rate limiting
   - Log all access attempts

### Input Validation

```typescript
// Client-side validation
const validateSearchQuery = (query: string): boolean => {
  // Prevent XSS attacks
  const sanitized = DOMPurify.sanitize(query);
  return sanitized.length <= 100;
};

// Server-side validation (backend)
const validateEventFilters = (filters: EventFilters): boolean => {
  // Validate filter values
  // Prevent SQL injection
  // Check data types
  return true;
};
```

## Design System Integration

### Colors

```typescript
const colors = {
  status: {
    draft: "#6B7280", // gray-500
    planning: "#3B82F6", // blue-500
    confirmed: "#10B981", // green-500
    inProgress: "#F59E0B", // yellow-500
    completed: "#8B5CF6", // purple-500
    cancelled: "#EF4444", // red-500
  },
  primary: "#9333EA", // purple-600
  background: "#F9FAFB", // gray-50
  card: "#FFFFFF",
  text: {
    primary: "#111827", // gray-900
    secondary: "#6B7280", // gray-500
  },
};
```

### Typography

```typescript
const typography = {
  eventTitle: "text-xl font-semibold text-gray-900",
  eventDate: "text-sm text-gray-600",
  statValue: "text-3xl font-bold text-gray-900",
  statLabel: "text-sm text-gray-500",
  badge: "text-xs font-medium",
};
```

### Spacing

```typescript
const spacing = {
  cardPadding: "p-6",
  cardGap: "gap-6",
  sectionMargin: "mb-8",
  elementGap: "gap-4",
};
```

### Animations

```typescript
const animations = {
  cardHover: "transition-shadow duration-200 hover:shadow-xl",
  fadeIn: "animate-fadeIn",
  slideIn: "animate-slideIn",
  loading: "animate-pulse",
};
```

## Future Enhancements

### Phase 2 Features

1. **Drag and Drop**

   - Reorder events by dragging
   - Drag events to change status
   - Drag to bulk select

2. **Advanced Filters**

   - Save filter presets
   - Share filter configurations
   - Complex filter combinations (OR logic)

3. **Customization**

   - Custom event card layouts
   - Configurable dashboard widgets
   - Theme customization

4. **Collaboration**

   - Real-time updates when team members make changes
   - Activity feed showing recent changes
   - Comments on events

5. **Analytics**
   - Event performance metrics
   - Budget vs. actual spending charts
   - Timeline visualization

## Implementation Notes

### Technology Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Context + SWR
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Forms:** React Hook Form
- **Validation:** Zod

### File Structure

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx
│       └── layout.tsx
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx
│       ├── StatisticsPanel.tsx
│       ├── FiltersBar.tsx
│       ├── EventGrid.tsx
│       ├── EventCard.tsx
│       ├── BulkActionsToolbar.tsx
│       ├── Pagination.tsx
│       ├── EmptyState.tsx
│       └── modals/
│           ├── DeleteConfirmationModal.tsx
│           ├── ShareEventModal.tsx
│           └── UpgradePromptModal.tsx
├── hooks/
│   ├── useEvents.ts
│   ├── useEventFilters.ts
│   ├── useEventStatistics.ts
│   └── useBulkActions.ts
├── lib/
│   ├── api/
│   │   └── events.ts
│   └── utils/
│       ├── eventHelpers.ts
│       └── dateHelpers.ts
└── types/
    └── event.ts
```

### Development Workflow

1. Create data models and types
2. Implement API endpoints (backend)
3. Create API client functions
4. Build reusable components (bottom-up)
5. Implement custom hooks for data fetching
6. Assemble page components
7. Add error handling and loading states
8. Implement responsive design
9. Add animations and transitions
10. Write tests
11. Optimize performance
12. Accessibility audit
13. User testing and feedback
