# AI Event Planner - Quick Start Guide

## 🚀 Getting Started with Frontend-Backend Integration

This guide will help you quickly test the AI Event Planner integration between frontend and backend.

---

## Prerequisites

✅ **Frontend:**

- Next.js app running
- All dependencies installed (`npm install`)
- Leaflet CSS properly imported

✅ **Backend:**

- Backend API server running on port 9600
- Database configured
- Redis running (for caching and rate limiting)
- AI/ML services operational

---

## Step 1: Configure Environment

### 1.1 Update `.env.local`

Create or update `.env.local` in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1

# Optional: For production
# NEXT_PUBLIC_API_URL=https://api.yourdo main.com/api/v1
```

### 1.2 Verify Backend is Running

Test the health endpoint:

```bash
curl http://localhost:9600/api/v1/ai-planner/health
```

Expected response:

```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "services": {
      "nlp": "operational",
      "budget_optimizer": "operational",
      "vendor_matcher": "operational",
      "recommendation_engine": "operational"
    },
    "version": "1.0.0"
  }
}
```

---

## Step 2: Start the Frontend

```bash
# Clear Next.js cache
rm -rf .next

# Start development server
npm run dev
```

Navigate to: `http://localhost:3000/ai-event-planner`

---

## Step 3: Test Basic Flow

### 3.1 Fill Out the Form

**Event Details:**

- Event Type: Wedding
- Event Date: Select a future date (e.g., 6 months from now)
- Guest Count: 200

**Location:**

- Use map picker or manual entry
- City: Lagos
- State: Lagos
- Country: Nigeria
- Address: Victoria Island

**Event Description:**

```
Beautiful outdoor wedding with garden theme and elegant decorations for a memorable celebration with family and friends. We want a romantic atmosphere with live music and delicious food.
```

**Guest Class:**

- Age Groups: Adults, Seniors
- Formality: Formal
- Social Status: Middle Class, Affluent
- Special Requirements: Dietary Restrictions
- Additional Details: "Prefer vegetarian options and wheelchair accessibility"

**Budget:**

- Amount: 5,000,000
- Currency: NGN

### 3.2 Submit and Wait

Click "Generate Event Plan" and wait 3-5 seconds.

You should see:

- ✅ Loading screen with rotating messages
- ✅ Progress bar animation
- ✅ Redirect to result page

### 3.3 View Results

On the result page, you should see:

- ✅ Event summary card
- ✅ Budget breakdown chart
- ✅ Vendor categories (with lock icons)
- ✅ Timeline with milestones
- ✅ AI insights and recommendations
- ✅ "Sign Up to Unlock" CTA buttons

---

## Step 4: Test Error Scenarios

### 4.1 Test Insufficient Budget

Try submitting with:

- Event Type: Wedding
- Guest Count: 200
- Budget: 500,000 NGN (too low)

Expected:

- ❌ Error message about insufficient budget
- ✅ Suggested minimum budget shown
- ✅ Alternatives displayed
- ✅ Option to adjust budget

### 4.2 Test Validation Errors

Try submitting with:

- Event Description: "Short" (less than 50 characters)

Expected:

- ❌ Inline error message
- ✅ Character counter showing deficit
- ✅ Submit button disabled

### 4.3 Test Rate Limiting

Submit 5 event plans in quick succession.

On the 6th attempt, expected:

- ❌ Rate limit error
- ✅ Message: "You've reached your limit"
- ✅ Countdown timer showing minutes until reset
- ✅ Suggestion to sign up for unlimited access

---

## Step 5: Test Authentication Flow

### 5.1 View Teaser (No Auth Required)

- ✅ Can view event plan teaser
- ✅ Vendor details are locked/blurred
- ✅ CTA buttons visible

### 5.2 Sign Up

Click "Sign Up to Unlock Full Plan"

Expected:

- ✅ Redirect to signup page
- ✅ Session token preserved
- ✅ After signup, redirect back to result

### 5.3 Save Plan (Auth Required)

After signing up, click "Save & Continue"

Expected:

- ✅ Plan saved to user account
- ✅ Success message displayed
- ✅ Redirect to full plan view

### 5.4 View Full Plan (Auth Required)

Navigate to saved plan:

Expected:

- ✅ All vendor details unlocked
- ✅ Contact information visible
- ✅ Detailed timeline available
- ✅ Action items displayed
- ✅ Resources provided

---

## Step 6: Verify Data

### 6.1 Check Browser Console

Open DevTools (F12) and check:

- ✅ No JavaScript errors
- ✅ API calls successful (200 status)
- ✅ Rate limit headers present
- ✅ Session token stored

### 6.2 Check Network Tab

Verify API calls:

**POST /ai-planner/analyze:**

```
Status: 200 OK
Headers:
  X-RateLimit-Limit: 5
  X-RateLimit-Remaining: 4
  X-RateLimit-Reset: <timestamp>
Response:
  {
    "status": "success",
    "data": {
      "sessionToken": "...",
      "eventPlan": { ... },
      "expiresAt": "..."
    }
  }
```

**GET /ai-planner/result/:token:**

```
Status: 200 OK
Response:
  {
    "status": "success",
    "data": {
      "eventPlan": { ... },
      "canUpgrade": true
    }
  }
```

### 6.3 Check LocalStorage

Open DevTools → Application → Local Storage:

Should contain:

```
ai_planner_rate_limit_remaining: "4"
ai_planner_rate_limit_reset: "<timestamp>"
eventPlanSessionToken: "<token>"
```

---

## Step 7: Test Different Scenarios

### Scenario 1: Wedding (High Budget)

```json
{
  "eventType": "wedding",
  "guestCount": 200,
  "budget": { "amount": 5000000, "currency": "NGN" },
  "location": { "city": "Lagos", "state": "Lagos" }
}
```

Expected:

- ✅ Feasibility score: >75 (green)
- ✅ All essential categories allocated
- ✅ Recommended categories included
- ✅ Positive sentiment in AI insights

### Scenario 2: Corporate (Medium Budget)

```json
{
  "eventType": "corporate",
  "guestCount": 150,
  "budget": { "amount": 3000000, "currency": "NGN" },
  "location": { "city": "Abuja", "state": "FCT" }
}
```

Expected:

- ✅ Feasibility score: 60-75 (yellow)
- ✅ Essential categories prioritized
- ✅ Some optional categories excluded
- ✅ Neutral sentiment in AI insights

### Scenario 3: Birthday (Low Budget)

```json
{
  "eventType": "birthday",
  "guestCount": 50,
  "budget": { "amount": 500000, "currency": "NGN" },
  "location": { "city": "Lagos", "state": "Lagos" }
}
```

Expected:

- ✅ Feasibility score: <60 (red) or warning
- ✅ Only essential categories
- ✅ Budget optimization suggestions
- ✅ Alternatives provided

---

## Troubleshooting

### Issue: "Network Error"

**Check:**

1. Is backend running? `curl http://localhost:9600/api/v1/ai-planner/health`
2. Is CORS configured? Check backend CORS settings
3. Is `.env.local` correct? Verify `NEXT_PUBLIC_API_URL`

**Fix:**

```bash
# Restart backend
cd backend
npm run dev

# Restart frontend
cd frontend
rm -rf .next
npm run dev
```

### Issue: "Rate Limit Exceeded" Immediately

**Check:**

1. LocalStorage has old rate limit data
2. Backend rate limit counter not reset

**Fix:**

```javascript
// Clear rate limit in browser console
localStorage.removeItem("ai_planner_rate_limit_remaining");
localStorage.removeItem("ai_planner_rate_limit_reset");
```

### Issue: "Session Token Not Found"

**Check:**

1. Session expired (24 hours)
2. Redis cache cleared
3. Token not stored correctly

**Fix:**

- Generate a new event plan
- Check Redis is running: `redis-cli ping`

### Issue: Map Not Loading

**Check:**

1. Leaflet CSS imported in layout.tsx
2. Browser console for errors
3. Internet connection (for tiles)

**Fix:**
See `docs/MAP_TROUBLESHOOTING.md`

---

## Performance Benchmarks

### Expected Response Times

| Endpoint           | Expected Time | Acceptable Time |
| ------------------ | ------------- | --------------- |
| POST /analyze      | 3-5 seconds   | <10 seconds     |
| GET /result/:token | <500ms        | <1 second       |
| POST /save         | <1 second     | <2 seconds      |
| GET /full/:eventId | <1 second     | <2 seconds      |
| GET /health        | <100ms        | <500ms          |

### If Slower Than Expected

**Check:**

1. Database query performance
2. AI/ML service response time
3. Network latency
4. Redis cache hit rate

---

## Next Steps

After successful testing:

1. ✅ Mark items complete in `AI_PLANNER_INTEGRATION_CHECKLIST.md`
2. ✅ Document any issues found
3. ✅ Test on different browsers
4. ✅ Test on mobile devices
5. ✅ Prepare for production deployment

---

## Quick Reference

### API Endpoints

```
POST   /ai-planner/analyze          - Generate event plan
GET    /ai-planner/result/:token    - Get teaser result
POST   /ai-planner/save             - Save to account (auth)
GET    /ai-planner/full/:eventId    - Get full plan (auth)
GET    /ai-planner/health           - Health check
```

### Rate Limits

- Anonymous: 5 requests/hour
- Authenticated: TBD

### Session Duration

- 24 hours from creation

### Supported Currencies

- NGN (Nigerian Naira)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)

---

**Happy Testing! 🎉**

For detailed documentation, see:

- `AI_EVENT_PLANNER_FRONTEND_GUIDE.md`
- `AI_PLANNER_INTEGRATION_CHECKLIST.md`
- `docs/MAP_TROUBLESHOOTING.md`
