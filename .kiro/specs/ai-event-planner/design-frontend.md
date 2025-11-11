# AI Event Planner - Frontend Design Document

## Overview

The frontend for the AI Event Planner provides an intuitive, engaging user interface for collecting event details and displaying AI-generated event plans. The design emphasizes ease of use, visual appeal, and conversion optimization while maintaining consistency with the Confetti platform design system.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   AI Event Planner Page                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Hero Section                           │ │
│  │  - Headline: "Plan Your Perfect Event with AI"         │ │
│  │  - Subheadline                                          │ │
│  │  - CTA: "Get Started Free"                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Event Planning Form                        │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Step 1: Event Basics                            │  │ │
│  │  │  - Event Type                                     │  │ │
│  │  │  - Event Date                                     │  │ │
│  │  │  - Guest Count                                    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Step 2: Location                                │  │ │
│  │  │  - Map Picker / Manual Entry                     │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Step 3: Event Details                           │  │ │
│  │  │  - Event Description                             │  │ │
│  │  │  - Guest Class Description                       │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Step 4: Budget                                  │  │ │
│  │  │  - Budget Amount                                 │  │ │
│  │  │  - Currency Selection                            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Submit Button                                   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Loading/Processing Screen                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AI Animation (Brain/Sparkles)                         │ │
│  │  Progress Bar                                           │ │
│  │  Dynamic Status Messages                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Teaser Result Page                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Event Plan Overview                                    │ │
│  │  - Event Summary Card                                   │ │
│  │  - Key Highlights                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Budget Breakdown                                       │ │
│  │  - Pie Chart / Bar Chart                               │ │
│  │  - Category List with Percentages                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Vendor Categories (Blurred/Locked)                    │ │
│  │  - Category Cards with Lock Icons                      │ │
│  │  - "Sign up to see vendors" overlay                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Timeline Preview (Partial)                            │ │
│  │  - High-level milestones                               │ │
│  │  - Locked detailed timeline                            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Call-to-Action Section                                │ │
│  │  - "Sign Up to See Full Plan" Button                   │ │
│  │  - "Save & Continue" Button                            │ │
│  │  - Benefits List                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AIEventPlannerPage
├── HeroSection
│   ├── Headline
│   ├── Subheadline
│   └── CTAButton
├── EventPlanningForm
│   ├── FormProgress (Step Indicator)
│   ├── Step1: EventBasics
│   │   ├── EventTypeSelect
│   │   ├── EventDatePicker
│   │   └── GuestCountInput
│   ├── Step2: LocationInput
│   │   ├── MapPicker
│   │   │   ├── InteractiveMap
│   │   │   ├── SearchBox
│   │   │   └── ManualEntryToggle
│   │   └── ManualLocationForm
│   │       ├── StateSelect
│   │       ├── CitySelect
│   │       └── AddressInput
│   ├── Step3: EventDetails
│   │   ├── EventDescriptionTextarea
│   │   └── GuestClassForm
│   │       ├── AgeGroupCheckboxes
│   │       ├── FormalityRadioButtons
│   │       ├── SocialStatusCheckboxes
│   │       ├── SpecialRequirementsCheckboxes
│   │       └── AdditionalDetailsTextarea
│   ├── Step4: BudgetInput
│   │   ├── CurrencySelect
│   │   └── BudgetAmountInput
│   └── SubmitButton
├── LoadingScreen (conditional)
│   ├── AIAnimation
│   ├── ProgressBar
│   └── StatusMessages
└── TeaserResultPage (conditional)
    ├── EventPlanOverview
    │   ├── EventSummaryCard
    │   └── KeyHighlights
    ├── BudgetBreakdown
    │   ├── BudgetChart
    │   └── CategoryList
    ├── VendorCategoriesPreview
    │   ├── CategoryCard (multiple, with blur/lock)
    │   └── UnlockOverlay
    ├── TimelinePreview
    │   ├── MilestonesList
    │   └── LockedDetailedTimeline
    └── CTASection
        ├── SignUpButton
        ├── SaveContinueButton
        └── BenefitsList
```

## Components and Interfaces

### 1. EventPlanningForm Component

**Purpose:** Main form component orchestrating the multi-step event planning input

**Props:**

```typescript
interface EventPlanningFormProps {
  onSubmit: (data: EventPlanFormData) => Promise<void>;
  initialData?: Partial<EventPlanFormData>;
}
```

**State:**

```typescript
interface EventPlanFormData {
  eventType: EventType;
  eventDate: Date;
  guestCount: number;
  location: LocationData;
  eventDescription: string;
  guestClass: GuestClassData;
  budget: BudgetData;
}

interface LocationData {
  method: "map" | "manual";
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface GuestClassData {
  ageGroups: AgeGroup[];
  formality: FormalityLevel;
  socialStatus: SocialStatus[];
  specialRequirements: SpecialRequirement[];
  additionalDetails: string;
}

interface BudgetData {
  amount: number;
  currency: Currency;
}

enum EventType {
  WEDDING = "wedding",
  CORPORATE = "corporate",
  BIRTHDAY = "birthday",
  GRADUATION = "graduation",
  CONFERENCE = "conference",
  OTHER = "other",
}

enum AgeGroup {
  CHILDREN = "children",
  TEENAGERS = "teenagers",
  YOUNG_ADULTS = "young_adults",
  ADULTS = "adults",
  SENIORS = "seniors",
}

enum FormalityLevel {
  CASUAL = "casual",
  SEMI_FORMAL = "semi_formal",
  FORMAL = "formal",
  BLACK_TIE = "black_tie",
}

enum SocialStatus {
  BUDGET_CONSCIOUS = "budget_conscious",
  MIDDLE_CLASS = "middle_class",
  AFFLUENT = "affluent",
  LUXURY = "luxury",
}

enum SpecialRequirement {
  DIETARY_RESTRICTIONS = "dietary_restrictions",
  ACCESSIBILITY_NEEDS = "accessibility_needs",
  CULTURAL_CONSIDERATIONS = "cultural_considerations",
  RELIGIOUS_CONSIDERATIONS = "religious_considerations",
}

enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  NGN = "NGN",
}
```

**Validation Rules:**

```typescript
const validationSchema = {
  eventType: { required: true },
  eventDate: {
    required: true,
    minDate: new Date(),
    message: "Event date must be in the future",
  },
  guestCount: {
    required: true,
    min: 1,
    max: 10000,
    message: "Guest count must be between 1 and 10,000",
  },
  location: {
    address: { required: true, minLength: 5 },
    city: { required: true },
    state: { required: true },
  },
  eventDescription: {
    required: true,
    minLength: 50,
    maxLength: 1000,
    message: "Please provide at least 50 characters describing your event",
  },
  guestClass: {
    ageGroups: { required: true, minItems: 1 },
    formality: { required: true },
    socialStatus: { required: true, minItems: 1 },
  },
  budget: {
    amount: {
      required: true,
      min: 100,
      message: "Please enter a realistic budget for your event",
    },
    currency: { required: true },
  },
};
```

### 2. MapPicker Component

**Purpose:** Interactive map for location selection

**Props:**

```typescript
interface MapPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  onToggleManualEntry: () => void;
}
```

**Implementation:**

- Use Leaflet or Google Maps API
- Display interactive map with search functionality
- Allow click-to-select location
- Reverse geocode coordinates to address
- Display selected location marker
- Provide zoom controls
- Show "Use Manual Entry" button

### 3. GuestClassForm Component

**Purpose:** Collect detailed guest information

**Props:**

```typescript
interface GuestClassFormProps {
  value: GuestClassData;
  onChange: (data: GuestClassData) => void;
  errors?: Record<string, string>;
}
```

**Layout:**

- Section 1: Age Groups (checkboxes in grid)
- Section 2: Formality Level (radio buttons with icons)
- Section 3: Social Status (checkboxes with descriptions)
- Section 4: Special Requirements (checkboxes with icons)
- Section 5: Additional Details (textarea)

### 4. LoadingScreen Component

**Purpose:** Engaging loading experience during AI processing

**Props:**

```typescript
interface LoadingScreenProps {
  progress: number; // 0-100
  currentStep: string;
}
```

**Animation Sequence:**

```typescript
const loadingSteps = [
  { progress: 0, message: "Analyzing your event requirements..." },
  { progress: 20, message: "Searching vendor database in your area..." },
  { progress: 40, message: "Calculating optimal budget allocation..." },
  { progress: 60, message: "Matching vendors to your preferences..." },
  { progress: 80, message: "Generating your personalized event plan..." },
  { progress: 100, message: "Your event plan is ready!" },
];
```

**Visual Elements:**

- Animated AI brain or sparkles icon
- Smooth progress bar with gradient
- Rotating status messages
- Particle effects or confetti animation
- Estimated time remaining

### 5. TeaserResultPage Component

**Purpose:** Display event plan preview with conversion-focused design

**Props:**

```typescript
interface TeaserResultPageProps {
  eventPlan: EventPlanTeaser;
  sessionToken: string;
  onSignUp: () => void;
  onSaveContinue: () => void;
}

interface EventPlanTeaser {
  eventSummary: EventSummary;
  budgetBreakdown: BudgetBreakdown;
  vendorCategories: VendorCategory[];
  timeline: TimelinePreview;
  recommendations: string[];
}

interface EventSummary {
  eventType: string;
  eventDate: Date;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
}

interface BudgetBreakdown {
  categories: BudgetCategory[];
  totalAllocated: number;
  contingency: number;
}

interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  description: string;
  priority: "essential" | "recommended" | "optional";
}

interface VendorCategory {
  name: string;
  description: string;
  estimatedCost: { min: number; max: number };
  priority: "essential" | "recommended" | "optional";
  locked: boolean; // true for teaser
}

interface TimelinePreview {
  planningMilestones: Milestone[];
  eventDaySchedule: ScheduleItem[];
  detailedTimelineLocked: boolean;
}

interface Milestone {
  title: string;
  timeframe: string;
  description: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
  duration: string;
}
```

### 6. BudgetBreakdownChart Component

**Purpose:** Visual representation of budget allocation

**Props:**

```typescript
interface BudgetBreakdownChartProps {
  categories: BudgetCategory[];
  totalBudget: number;
  currency: string;
  chartType: "pie" | "bar" | "donut";
}
```

**Implementation:**

- Use Chart.js or Recharts
- Interactive hover tooltips
- Color-coded categories
- Responsive sizing
- Legend with percentages
- Animated entrance

### 7. VendorCategoryCard Component

**Purpose:** Display vendor category with lock overlay for teaser

**Props:**

```typescript
interface VendorCategoryCardProps {
  category: VendorCategory;
  locked: boolean;
  onUnlockClick: () => void;
}
```

**Visual Design:**

- Card with category icon
- Category name and description
- Estimated cost range
- Priority badge (Essential/Recommended/Optional)
- Blur effect when locked
- Lock icon overlay
- "Sign up to see vendors" text
- Hover effect with CTA

### 8. CTASection Component

**Purpose:** Conversion-focused call-to-action

**Props:**

```typescript
interface CTASectionProps {
  onSignUp: () => void;
  onSaveContinue: () => void;
  benefits: string[];
}
```

**Layout:**

- Prominent headline: "Ready to Plan Your Perfect Event?"
- Two CTA buttons (primary and secondary)
- Benefits list with checkmarks
- Social proof (testimonials or stats)
- Trust indicators (security, privacy)

## Data Flow

### Form Submission Flow

```
User fills form → Validation → Submit
                     ↓
              API Call: POST /api/v1/ai-planner/analyze
                     ↓
              Loading Screen (with progress updates)
                     ↓
              Response: Event Plan Teaser
                     ↓
              Store session token in localStorage
                     ↓
              Navigate to Teaser Result Page
                     ↓
              Display teaser with locked sections
                     ↓
              User clicks "Sign Up" or "Save & Continue"
                     ↓
              Redirect to registration with session token
                     ↓
              After registration, associate plan with user account
```

### State Management

```typescript
// Use React Context for form state
interface FormContextValue {
  formData: EventPlanFormData;
  updateFormData: (data: Partial<EventPlanFormData>) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
}

// Use SWR or React Query for API calls
const { data, error, isLoading } = useSWR(
  sessionToken ? `/api/v1/ai-planner/result/${sessionToken}` : null,
  fetcher
);
```

## API Integration

### POST /api/v1/ai-planner/analyze

**Request:**

```typescript
{
  eventType: string;
  eventDate: string; // ISO date
  guestCount: number;
  location: {
    latitude?: number;
    longitude?: number;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  eventDescription: string;
  guestClass: {
    ageGroups: string[];
    formality: string;
    socialStatus: string[];
    specialRequirements: string[];
    additionalDetails: string;
  };
  budget: {
    amount: number;
    currency: string;
  };
}
```

**Response:**

```typescript
{
  status: "success";
  data: {
    sessionToken: string;
    eventPlan: EventPlanTeaser;
  }
}
```

### GET /api/v1/ai-planner/result/:sessionToken

**Purpose:** Retrieve saved event plan teaser

**Response:**

```typescript
{
  status: "success";
  data: {
    eventPlan: EventPlanTeaser;
    expiresAt: string; // ISO timestamp
  }
}
```

## Responsive Design

### Breakpoints

- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### Mobile Adaptations

**Form:**

- Single column layout
- Larger touch targets (48px minimum)
- Native mobile inputs (date picker, number pad)
- Collapsible sections
- Sticky submit button at bottom
- Progress indicator at top

**Map Picker:**

- Full-screen map modal
- Simplified controls
- Larger markers and buttons

**Teaser Result:**

- Stacked sections
- Simplified charts (donut instead of pie)
- Collapsible vendor categories
- Fixed CTA buttons at bottom

## Animations and Transitions

### Form Interactions

```typescript
const formAnimations = {
  fieldFocus: "transition-all duration-200 ease-in-out",
  fieldError: "animate-shake",
  stepTransition: "animate-slideIn",
  submitButton: "hover:scale-105 transition-transform duration-200",
};
```

### Loading Screen

```typescript
const loadingAnimations = {
  aiIcon: "animate-pulse",
  progressBar: "transition-all duration-500 ease-out",
  statusMessage: "animate-fadeIn",
  particles: "animate-float",
};
```

### Teaser Result

```typescript
const teaserAnimations = {
  sectionEntrance: "animate-fadeInUp stagger-100",
  chartAnimation: "animate-drawChart duration-1000",
  lockOverlay: "backdrop-blur-sm transition-all duration-300",
  ctaButton: "animate-pulse-subtle",
};
```

## Accessibility

### Keyboard Navigation

- All form fields accessible via Tab
- Enter to submit form
- Arrow keys for radio buttons and checkboxes
- Escape to close modals
- Focus visible indicators

### Screen Reader Support

```typescript
// ARIA labels for form fields
<input
  type="number"
  aria-label="Number of guests"
  aria-describedby="guest-count-help"
  aria-required="true"
  aria-invalid={!!errors.guestCount}
/>

// ARIA live region for loading status
<div role="status" aria-live="polite" aria-atomic="true">
  {loadingMessage}
</div>

// ARIA labels for locked content
<div aria-label="Vendor details - Sign up to unlock">
  <div aria-hidden="true" className="blur-sm">
    {/* Blurred content */}
  </div>
</div>
```

### Color Contrast

- All text meets WCAG AA standards (4.5:1 ratio)
- Form validation errors use both color and icons
- Focus indicators visible on all interactive elements

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const MapPicker = dynamic(() => import("./MapPicker"), {
  loading: () => <MapPickerSkeleton />,
  ssr: false,
});

const BudgetChart = dynamic(() => import("./BudgetChart"), {
  loading: () => <ChartSkeleton />,
});
```

### Image Optimization

- Use Next.js Image component
- Lazy load images below fold
- Provide appropriate sizes for different viewports
- Use WebP format with fallbacks

### Form Performance

- Debounce validation (300ms)
- Memoize expensive calculations
- Use React.memo for static components
- Implement virtual scrolling for long lists

## Error Handling

### Form Validation Errors

```typescript
interface FormErrors {
  [field: string]: string;
}

const errorMessages = {
  eventType: "Please select an event type",
  eventDate: "Please select a future date",
  guestCount: "Guest count must be between 1 and 10,000",
  location: "Please provide a valid location",
  eventDescription: "Description must be at least 50 characters",
  budget: "Please enter a realistic budget",
};
```

### API Errors

```typescript
const handleAPIError = (error: APIError) => {
  switch (error.code) {
    case "INSUFFICIENT_BUDGET":
      showToast(
        "The budget is too low for this event type. Please increase your budget or adjust requirements.",
        "warning"
      );
      break;
    case "LOCATION_NOT_SUPPORTED":
      showToast(
        "We don't have vendor data for this location yet. We'll notify you when we expand to your area.",
        "info"
      );
      break;
    case "PROCESSING_TIMEOUT":
      showToast(
        "Analysis is taking longer than expected. Please try again.",
        "error"
      );
      break;
    default:
      showToast(
        "Something went wrong. Please try again or contact support.",
        "error"
      );
  }
};
```

## Design System Integration

### Colors

```typescript
const colors = {
  primary: "#9333EA", // purple-600
  secondary: "#EC4899", // pink-500
  success: "#10B981", // green-500
  warning: "#F59E0B", // yellow-500
  error: "#EF4444", // red-500
  background: "#F9FAFB", // gray-50
  card: "#FFFFFF",
  text: {
    primary: "#111827", // gray-900
    secondary: "#6B7280", // gray-500
    muted: "#9CA3AF", // gray-400
  },
  border: "#E5E7EB", // gray-200
  focus: "#9333EA", // purple-600
  blur: "rgba(0, 0, 0, 0.1)",
};
```

### Typography

```typescript
const typography = {
  heading1: "text-4xl md:text-5xl font-bold text-gray-900",
  heading2: "text-3xl md:text-4xl font-bold text-gray-900",
  heading3: "text-2xl md:text-3xl font-semibold text-gray-900",
  body: "text-base text-gray-700",
  label: "text-sm font-medium text-gray-700",
  helper: "text-sm text-gray-500",
  error: "text-sm text-red-600",
};
```

### Spacing

```typescript
const spacing = {
  section: "py-16 md:py-24",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "p-6 md:p-8",
  formField: "mb-6",
  buttonGroup: "space-x-4",
};
```

## Testing Strategy

### Unit Tests

- Form validation logic
- Input component rendering
- Error message display
- Budget calculation functions
- Date validation

### Integration Tests

- Form submission flow
- API integration
- Loading state transitions
- Error handling
- Navigation between steps

### E2E Tests

- Complete form submission
- Map picker interaction
- Teaser result display
- CTA button clicks
- Mobile responsiveness

## File Structure

```
src/
├── app/
│   └── ai-event-planner/
│       ├── page.tsx
│       ├── result/
│       │   └── [token]/
│       │       └── page.tsx
│       └── loading.tsx
├── components/
│   └── ai-planner/
│       ├── EventPlanningForm.tsx
│       ├── FormProgress.tsx
│       ├── EventBasicsStep.tsx
│       ├── LocationStep.tsx
│       │   ├── MapPicker.tsx
│       │   └── ManualLocationForm.tsx
│       ├── EventDetailsStep.tsx
│       │   └── GuestClassForm.tsx
│       ├── BudgetStep.tsx
│       ├── LoadingScreen.tsx
│       ├── TeaserResultPage.tsx
│       │   ├── EventPlanOverview.tsx
│       │   ├── BudgetBreakdown.tsx
│       │   │   └── BudgetChart.tsx
│       │   ├── VendorCategoriesPreview.tsx
│       │   │   └── VendorCategoryCard.tsx
│       │   ├── TimelinePreview.tsx
│       │   └── CTASection.tsx
│       └── modals/
│           └── SaveContinueModal.tsx
├── hooks/
│   ├── useEventPlanForm.ts
│   ├── useFormValidation.ts
│   ├── useLocationPicker.ts
│   └── useEventPlanAnalysis.ts
├── lib/
│   ├── api/
│   │   └── ai-planner.ts
│   └── utils/
│       ├── formValidation.ts
│       ├── budgetCalculations.ts
│       └── dateHelpers.ts
└── types/
    └── ai-planner.ts
```
