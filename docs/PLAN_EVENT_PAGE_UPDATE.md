# Plan Event Page - Updated to AI Event Planner

## Date: January 11, 2025

---

## 🎯 Issue Identified

You correctly identified that the `/plan-event` page had a **simplified form** with only these fields:

- budget
- date
- description
- eventType
- guestCount
- location
- venue

This form was **missing** the required fields specified in the backend API:

- ❌ Guest class (ageGroups, formality, socialStatus, specialRequirements, additionalDetails)
- ❌ Proper location structure (city, state, country, address, coordinates)
- ❌ Budget currency selection
- ❌ Event description with character limits

---

## ✅ Solution Applied

**Replaced** the simple form with the **complete AI Event Planner form** that includes ALL required fields.

### File Updated:

`src/app/plan-event/page.tsx`

### Changes Made:

#### Before (Simple Form):

```typescript
{
  eventType: "",
  guestCount: "",
  location: "",      // Just a string
  date: "",
  venue: "",         // Not needed by backend
  budget: "",        // No currency
  description: ""
}
```

#### After (Complete AI Form):

```typescript
{
  eventType: EventType,
  eventDate: Date,
  guestCount: number,
  location: {
    method: "map" | "manual",
    latitude?: number,
    longitude?: number,
    address: string,
    city: string,
    state: string,
    country: string
  },
  eventDescription: string,
  guestClass: {
    ageGroups: AgeGroup[],
    formality: FormalityLevel,
    socialStatus: SocialStatus[],
    specialRequirements: SpecialRequirement[],
    additionalDetails: string
  },
  budget: {
    amount: number,
    currency: Currency
  }
}
```

---

## 📋 Complete Field List

### Now Includes ALL Backend Required Fields:

#### 1. Event Type ✅

- Dropdown with: Wedding, Corporate, Birthday, Graduation, Conference, Other
- Maps to backend: `"wedding" | "corporate" | "birthday" | "graduation" | "conference" | "other"`

#### 2. Event Date ✅

- Date picker with future date validation
- Maps to backend: ISO 8601 string

#### 3. Guest Count ✅

- Number input (1-10,000)
- Maps to backend: number

#### 4. Location ✅

**Complete structure with:**

- City (required)
- State (required)
- Country (defaults to "Nigeria")
- Address (required)
- Coordinates (optional, from map picker)
- Maps to backend: `{ city, state, country, address, coordinates?: [lon, lat] }`

#### 5. Event Description ✅

- Textarea with character counter
- Validation: 50-1000 characters
- Maps to backend: string

#### 6. Guest Class ✅

**Complete structure with:**

- **Age Groups** (multi-select):
  - Children
  - Teenagers
  - Young Adults
  - Adults
  - Seniors
- **Formality** (single select):
  - Casual
  - Semi-Formal
  - Formal
  - Black-Tie
- **Social Status** (multi-select):
  - Budget-Conscious
  - Middle-Class
  - Affluent
  - Luxury
- **Special Requirements** (multi-select):
  - Dietary Restrictions
  - Accessibility Needs
  - Cultural Considerations
  - Religious Considerations
- **Additional Details** (textarea, max 500 chars)

#### 7. Budget ✅

**Complete structure with:**

- Amount (number input)
- Currency (dropdown):
  - NGN (Nigerian Naira)
  - USD (US Dollar)
  - EUR (Euro)
  - GBP (British Pound)

---

## 🎨 UI Features

### Multi-Step Form

The form is now a **4-step wizard**:

**Step 1: Event Basics**

- Event Type
- Event Date
- Guest Count

**Step 2: Location**

- Map picker or manual entry
- City, State, Country, Address
- Coordinates (if using map)

**Step 3: Event Details**

- Event Description
- Guest Class (all fields)

**Step 4: Budget**

- Budget Amount
- Currency Selection

### Features:

- ✅ Progress indicator
- ✅ Step navigation (Next/Back buttons)
- ✅ Real-time validation
- ✅ Character counters
- ✅ Inline error messages
- ✅ Loading screen during analysis
- ✅ Animated transitions
- ✅ Mobile responsive

---

## 🔄 User Flow

### Complete Flow:

```
1. User visits /plan-event
   ↓
2. Fills out 4-step form with ALL required fields
   ↓
3. Clicks "Get AI Event Plan"
   ↓
4. Loading screen (3-5 seconds)
   ↓
5. Redirects to /ai-event-planner/result/[token]
   ↓
6. Views teaser result
   ↓
7. Signs up to unlock full plan
```

---

## 📊 Comparison

### Old /plan-event Page

- ❌ Simple 7-field form
- ❌ Missing guest class
- ❌ Missing location details
- ❌ Missing currency selection
- ❌ No validation
- ❌ No character limits
- ❌ Doesn't match backend spec

### New /plan-event Page

- ✅ Complete 4-step form
- ✅ All backend fields included
- ✅ Proper data structure
- ✅ Full validation
- ✅ Character counters
- ✅ Matches backend spec exactly
- ✅ Same as /ai-event-planner

---

## 🧪 Testing

### Test the Updated Page:

1. **Navigate to:**

   ```
   http://localhost:3000/plan-event
   ```

2. **Verify all fields are present:**

   - [ ] Event Type dropdown
   - [ ] Event Date picker
   - [ ] Guest Count input
   - [ ] Location (map or manual)
   - [ ] Event Description textarea
   - [ ] Guest Class - Age Groups
   - [ ] Guest Class - Formality
   - [ ] Guest Class - Social Status
   - [ ] Guest Class - Special Requirements
   - [ ] Guest Class - Additional Details
   - [ ] Budget Amount
   - [ ] Budget Currency

3. **Test form submission:**

   - Fill out all required fields
   - Click "Get AI Event Plan"
   - Verify loading screen appears
   - Verify redirect to result page

4. **Test validation:**
   - Try submitting with empty fields
   - Try description < 50 characters
   - Try description > 1000 characters
   - Try past date
   - Verify error messages appear

---

## 📝 Notes

### Why Two Pages?

Now you have **two identical pages**:

1. `/ai-event-planner` - AI Event Planner
2. `/plan-event` - Plan Event (now also AI-powered)

**Recommendation:**

- Keep both if you want different entry points
- Or redirect `/plan-event` to `/ai-event-planner`
- Or remove one to avoid duplication

### To Redirect /plan-event to /ai-event-planner:

```typescript
// src/app/plan-event/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlanEventPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ai-event-planner");
  }, [router]);

  return null;
}
```

---

## ✅ Summary

**Problem:** `/plan-event` had incomplete form
**Solution:** Replaced with complete AI Event Planner form
**Result:** All backend required fields now present
**Status:** ✅ Ready for testing

---

**Last Updated:** January 11, 2025
**Status:** ✅ Complete
