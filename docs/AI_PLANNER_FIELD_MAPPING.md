# AI Event Planner - Field Mapping Guide

## Overview

This document maps the frontend form fields to the backend API request structure.

---

## ✅ Fixed Issues

### Issue 1: Location Coordinates Format

**Problem:** Frontend sent `latitude` and `longitude` as separate fields
**Backend Expects:** `coordinates` as optional array `[longitude, latitude]`
**Status:** ✅ Fixed in `src/lib/api/ai-planner.ts`

### Issue 2: Enum Values with Underscores vs Hyphens

**Problem:** Frontend used underscores (`budget_conscious`, `young_adults`)
**Backend Expects:** Hyphens (`budget-conscious`, `young-adults`)
**Status:** ✅ Fixed in `src/types/ai-planner.ts`

---

## 📋 Complete Field Mapping

### Event Type

```typescript
Frontend: EventType enum
Backend: "wedding" | "corporate" | "birthday" | "graduation" | "conference" | "other"
Mapping: Direct match ✅
```

### Event Date

```typescript
Frontend: Date object
Backend: ISO 8601 string (e.g., "2025-06-15")
Transformation: formData.eventDate.toISOString() ✅
```

### Guest Count

```typescript
Frontend: number (1-10000)
Backend: number (1-10000)
Mapping: Direct match ✅
```

### Location

```typescript
Frontend:
{
  method: "map" | "manual",
  latitude?: number,
  longitude?: number,
  address: string,
  city: string,
  state: string,
  country: string
}

Backend:
{
  city: string,           // Required
  state: string,          // Required
  country: string,        // Default: "Nigeria"
  address: string,        // Required
  coordinates?: [number, number]  // Optional: [longitude, latitude]
}

Transformation:
{
  city: formData.location.city,
  state: formData.location.state,
  country: formData.location.country || "Nigeria",
  address: formData.location.address,
  coordinates: formData.location.longitude && formData.location.latitude
    ? [formData.location.longitude, formData.location.latitude]
    : undefined
}
✅ Fixed
```

### Event Description

```typescript
Frontend: string (50-1000 characters)
Backend: string (50-1000 characters)
Mapping: Direct match ✅
```

### Guest Class - Age Groups

```typescript
Frontend: AgeGroup[]
Values: "children" | "teenagers" | "young-adults" | "adults" | "seniors"

Backend: Array<"children" | "teenagers" | "young_adults" | "adults" | "seniors">
Note: Backend uses "young_adults" with underscore

Mapping: Direct match ✅ (Fixed enum values)
```

### Guest Class - Formality

```typescript
Frontend: FormalityLevel
Values: "casual" | "semi-formal" | "formal" | "black-tie"

Backend: "casual" | "semi-formal" | "formal" | "black-tie"

Mapping: Direct match ✅ (Fixed enum values)
```

### Guest Class - Social Status

```typescript
Frontend: SocialStatus[]
Values: "budget-conscious" | "middle-class" | "affluent" | "luxury"

Backend: Array<"budget-conscious" | "middle-class" | "affluent" | "luxury">

Mapping: Direct match ✅ (Fixed enum values)
```

### Guest Class - Special Requirements

```typescript
Frontend: SpecialRequirement[]
Values:
  - "dietary-restrictions"
  - "accessibility-needs"
  - "cultural-considerations"
  - "religious-considerations"

Backend: Array<
  | "dietary-restrictions"
  | "accessibility-needs"
  | "cultural-considerations"
  | "religious-considerations"
>

Mapping: Direct match ✅ (Fixed enum values)
```

### Guest Class - Additional Details

```typescript
Frontend: string (max 500 characters)
Backend: string (max 500 characters, optional)
Mapping: Direct match ✅
```

### Budget

```typescript
Frontend:
{
  amount: number,
  currency: Currency
}

Backend:
{
  amount: number,
  currency: "NGN" | "USD" | "EUR" | "GBP"
}

Mapping: Direct match ✅
```

---

## 🔄 Complete Request Transformation

### Frontend Form Data

```typescript
interface EventPlanFormData {
  eventType: EventType;
  eventDate: Date;
  guestCount: number;
  location: {
    method: "map" | "manual";
    latitude?: number;
    longitude?: number;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  eventDescription: string;
  guestClass: {
    ageGroups: AgeGroup[];
    formality: FormalityLevel;
    socialStatus: SocialStatus[];
    specialRequirements: SpecialRequirement[];
    additionalDetails: string;
  };
  budget: {
    amount: number;
    currency: Currency;
  };
}
```

### Backend API Payload

```typescript
{
  eventType: string;
  eventDate: string; // ISO 8601
  guestCount: number;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    coordinates?: [number, number];
  };
  eventDescription: string;
  guestClass: {
    ageGroups: string[];
    formality: string;
    socialStatus: string[];
    specialRequirements: string[];
    additionalDetails?: string;
  };
  budget: {
    amount: number;
    currency: string;
  };
}
```

### Transformation Code

```typescript
const payload = {
  eventType: formData.eventType,
  eventDate: formData.eventDate.toISOString(),
  guestCount: formData.guestCount,
  location: {
    city: formData.location.city,
    state: formData.location.state,
    country: formData.location.country || "Nigeria",
    address: formData.location.address,
    ...(formData.location.longitude && formData.location.latitude
      ? {
          coordinates: [
            formData.location.longitude,
            formData.location.latitude,
          ],
        }
      : {}),
  },
  eventDescription: formData.eventDescription,
  guestClass: {
    ageGroups: formData.guestClass.ageGroups,
    formality: formData.guestClass.formality,
    socialStatus: formData.guestClass.socialStatus,
    specialRequirements: formData.guestClass.specialRequirements,
    additionalDetails: formData.guestClass.additionalDetails,
  },
  budget: {
    amount: formData.budget.amount,
    currency: formData.budget.currency,
  },
};
```

---

## 🧪 Test Cases

### Test Case 1: Wedding with Map Location

```typescript
// Frontend Form Data
{
  eventType: EventType.WEDDING,
  eventDate: new Date("2025-06-15"),
  guestCount: 200,
  location: {
    method: "map",
    latitude: 6.4281,
    longitude: 3.4219,
    address: "Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria"
  },
  eventDescription: "Beautiful outdoor wedding...",
  guestClass: {
    ageGroups: [AgeGroup.ADULTS, AgeGroup.SENIORS],
    formality: FormalityLevel.FORMAL,
    socialStatus: [SocialStatus.MIDDLE_CLASS, SocialStatus.AFFLUENT],
    specialRequirements: [SpecialRequirement.DIETARY_RESTRICTIONS],
    additionalDetails: "Prefer vegetarian options"
  },
  budget: {
    amount: 5000000,
    currency: Currency.NGN
  }
}

// Backend Payload
{
  "eventType": "wedding",
  "eventDate": "2025-06-15T00:00:00.000Z",
  "guestCount": 200,
  "location": {
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "address": "Victoria Island",
    "coordinates": [3.4219, 6.4281]
  },
  "eventDescription": "Beautiful outdoor wedding...",
  "guestClass": {
    "ageGroups": ["adults", "seniors"],
    "formality": "formal",
    "socialStatus": ["middle-class", "affluent"],
    "specialRequirements": ["dietary-restrictions"],
    "additionalDetails": "Prefer vegetarian options"
  },
  "budget": {
    "amount": 5000000,
    "currency": "NGN"
  }
}
```

### Test Case 2: Corporate Event with Manual Location

```typescript
// Frontend Form Data
{
  eventType: EventType.CORPORATE,
  eventDate: new Date("2025-03-20"),
  guestCount: 150,
  location: {
    method: "manual",
    address: "Maitama District",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria"
  },
  eventDescription: "Annual company conference...",
  guestClass: {
    ageGroups: [AgeGroup.YOUNG_ADULTS, AgeGroup.ADULTS],
    formality: FormalityLevel.SEMI_FORMAL,
    socialStatus: [SocialStatus.MIDDLE_CLASS],
    specialRequirements: [SpecialRequirement.ACCESSIBILITY_NEEDS],
    additionalDetails: "Need wheelchair access"
  },
  budget: {
    amount: 3000000,
    currency: Currency.NGN
  }
}

// Backend Payload
{
  "eventType": "corporate",
  "eventDate": "2025-03-20T00:00:00.000Z",
  "guestCount": 150,
  "location": {
    "city": "Abuja",
    "state": "FCT",
    "country": "Nigeria",
    "address": "Maitama District"
    // No coordinates since manual entry
  },
  "eventDescription": "Annual company conference...",
  "guestClass": {
    "ageGroups": ["young-adults", "adults"],
    "formality": "semi-formal",
    "socialStatus": ["middle-class"],
    "specialRequirements": ["accessibility-needs"],
    "additionalDetails": "Need wheelchair access"
  },
  "budget": {
    "amount": 3000000,
    "currency": "NGN"
  }
}
```

---

## ✅ Validation Rules

### Frontend Validation

```typescript
{
  eventType: { required: true },
  eventDate: { required: true, minDate: new Date() },
  guestCount: { required: true, min: 1, max: 10000 },
  locationCity: { required: true },
  locationState: { required: true },
  locationAddress: { required: true },
  eventDescription: { required: true, minLength: 50, maxLength: 1000 },
  guestClassAgeGroups: { required: true, minItems: 1 },
  guestClassFormality: { required: true },
  guestClassSocialStatus: { required: true, minItems: 1 },
  guestClassAdditionalDetails: { maxLength: 500 },
  budgetAmount: { required: true, min: 1 },
  budgetCurrency: { required: true }
}
```

### Backend Validation

- Same as frontend
- Additional server-side validation
- Budget minimum varies by currency
- Location must be within supported areas

---

## 🐛 Common Issues

### Issue: "Validation Error: Invalid formality value"

**Cause:** Frontend sending underscore format (`semi_formal`)
**Fix:** ✅ Fixed - Now sends hyphen format (`semi-formal`)

### Issue: "Validation Error: Invalid coordinates format"

**Cause:** Sending `latitude` and `longitude` as separate fields
**Fix:** ✅ Fixed - Now sends as `coordinates: [longitude, latitude]` array

### Issue: "Validation Error: Invalid age group"

**Cause:** Frontend sending underscore format (`young_adults`)
**Fix:** ✅ Fixed - Now sends hyphen format (`young-adults`)

### Issue: "Location not found"

**Cause:** Missing `country` field (defaults to "Nigeria")
**Fix:** ✅ Fixed - Always sends country, defaults to "Nigeria"

---

## 📝 Notes

1. **Date Format:** Always use ISO 8601 format for dates
2. **Coordinates:** Optional, only sent when map picker is used
3. **Country:** Defaults to "Nigeria" if not specified
4. **Enum Values:** All use hyphens, not underscores
5. **Additional Details:** Optional field, can be empty string

---

**Last Updated:** January 11, 2025
**Status:** ✅ All Fields Mapped Correctly
