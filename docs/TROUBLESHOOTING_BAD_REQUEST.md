# Troubleshooting: "Bad Request" Error

## Error Message

```
Error analyzing event: Error: Bad request
at analyzeEvent (ai-planner.ts:161:9)
```

---

## 🔍 Possible Causes

### 1. Backend Not Running ⚠️

**Most Common Cause**

The backend API server is not running or not accessible.

**Check:**

```bash
# Test if backend is running
curl http://localhost:9600/api/v1/ai-planner/health

# Expected response:
{
  "status": "success",
  "data": {
    "status": "healthy",
    ...
  }
}
```

**Fix:**

```bash
# Start the backend server
cd backend
npm run dev

# Or check backend documentation for start command
```

---

### 2. Wrong API URL ⚠️

The `NEXT_PUBLIC_API_URL` environment variable is not set or incorrect.

**Check:**

```bash
# Check .env.local file
cat .env.local

# Should contain:
NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1
```

**Fix:**

```bash
# Create or update .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1" > .env.local

# Restart frontend
npm run dev
```

---

### 3. CORS Issues ⚠️

Backend is not configured to accept requests from frontend origin.

**Check Browser Console:**

```
Access to XMLHttpRequest at 'http://localhost:9600/api/v1/ai-planner/analyze'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix (Backend):**

```javascript
// Backend CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
```

---

### 4. Invalid Payload Format ⚠️

The data being sent doesn't match backend expectations.

**Check Browser Console:**
Look for the logged payload:

```javascript
console.log("Sending payload to backend:", payload);
```

**Common Issues:**

- Missing required fields
- Wrong data types
- Invalid enum values
- Incorrect date format

**Fix:**
Review the payload structure in `docs/AI_PLANNER_FIELD_MAPPING.md`

---

### 5. Backend Validation Errors ⚠️

Backend is rejecting the request due to validation failures.

**Check:**

- Event description length (50-1000 characters)
- Guest count range (1-10,000)
- Date is in the future
- All required fields present

**Fix:**
Ensure form validation matches backend requirements.

---

## 🛠️ Debugging Steps

### Step 1: Check Backend Status

```bash
# Test health endpoint
curl http://localhost:9600/api/v1/ai-planner/health

# If this fails, backend is not running
```

**Expected Output:**

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
    }
  }
}
```

**If Failed:**

- Backend is not running → Start it
- Wrong port → Check backend configuration
- Backend crashed → Check backend logs

---

### Step 2: Check Environment Variables

```bash
# Frontend
cat .env.local

# Should show:
NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1
```

**If Missing:**

```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1
EOF

# Restart frontend
npm run dev
```

---

### Step 3: Check Browser Console

Open DevTools (F12) and check:

1. **Console Tab:**

   - Look for "Sending payload to backend:" log
   - Check the payload structure
   - Look for any error messages

2. **Network Tab:**

   - Find the `/ai-planner/analyze` request
   - Check Status Code:
     - `0` or `ERR_CONNECTION_REFUSED` → Backend not running
     - `400` → Validation error (check Response tab)
     - `404` → Wrong endpoint URL
     - `500` → Backend error (check backend logs)
     - `CORS error` → CORS not configured

3. **Response Tab:**
   - Check the error message from backend
   - Look for validation details

---

### Step 4: Test with cURL

```bash
# Test the endpoint directly
curl -X POST http://localhost:9600/api/v1/ai-planner/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "wedding",
    "eventDate": "2025-06-15T00:00:00.000Z",
    "guestCount": 200,
    "location": {
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "address": "Victoria Island"
    },
    "eventDescription": "Beautiful outdoor wedding with garden theme and elegant decorations for a memorable celebration with family and friends",
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
  }'
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "sessionToken": "...",
    "eventPlan": { ... }
  }
}
```

**If This Works:**

- Backend is fine
- Issue is in frontend payload construction
- Compare cURL payload with frontend payload

**If This Fails:**

- Backend has issues
- Check backend logs
- Check backend validation

---

### Step 5: Check Payload Structure

Open browser console and look for:

```javascript
Sending payload to backend: {
  "eventType": "wedding",
  "eventDate": "2025-06-15T00:00:00.000Z",
  ...
}
```

**Verify:**

- ✅ `eventType` is lowercase string
- ✅ `eventDate` is ISO 8601 string
- ✅ `guestCount` is number
- ✅ `location.coordinates` is array `[lon, lat]` or omitted
- ✅ `guestClass.ageGroups` uses hyphens (e.g., "young-adults")
- ✅ `guestClass.formality` uses hyphens (e.g., "semi-formal")
- ✅ `guestClass.socialStatus` uses hyphens (e.g., "budget-conscious")
- ✅ `budget.amount` is number
- ✅ `budget.currency` is uppercase (NGN, USD, EUR, GBP)

---

## 🔧 Quick Fixes

### Fix 1: Backend Not Running

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Fix 2: Environment Variable

```bash
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1" > .env.local

# Restart
npm run dev
```

### Fix 3: Clear Cache

```bash
# Clear Next.js cache
rm -rf .next

# Clear browser cache
# Chrome: Ctrl+Shift+R (hard refresh)

# Restart
npm run dev
```

### Fix 4: Check Backend Logs

```bash
# Check backend terminal for errors
# Look for:
# - Port already in use
# - Database connection errors
# - Missing environment variables
# - Validation errors
```

---

## 📊 Error Code Reference

| Error Code               | Meaning                   | Fix                      |
| ------------------------ | ------------------------- | ------------------------ |
| `NETWORK_ERROR`          | Cannot connect to backend | Start backend server     |
| `INSUFFICIENT_BUDGET`    | Budget too low            | Increase budget amount   |
| `VALIDATION_ERROR`       | Invalid field value       | Check field requirements |
| `RATE_LIMIT_EXCEEDED`    | Too many requests         | Wait or sign up          |
| `PROCESSING_TIMEOUT`     | Backend took too long     | Retry request            |
| `LOCATION_NOT_SUPPORTED` | No vendors in area        | Try different location   |

---

## 🎯 Most Likely Solutions

### 90% of cases: Backend not running

```bash
cd backend
npm run dev
```

### 5% of cases: Wrong environment variable

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1" > .env.local
npm run dev
```

### 5% of cases: CORS issue

Check backend CORS configuration

---

## 📝 Checklist

Before asking for help, verify:

- [ ] Backend server is running
- [ ] Health endpoint responds: `curl http://localhost:9600/api/v1/ai-planner/health`
- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Frontend restarted after `.env.local` change
- [ ] Browser console shows payload being sent
- [ ] Network tab shows request being made
- [ ] No CORS errors in console
- [ ] Backend logs show no errors

---

## 🆘 Still Not Working?

### Collect This Information:

1. **Backend Status:**

   ```bash
   curl http://localhost:9600/api/v1/ai-planner/health
   ```

2. **Environment Variable:**

   ```bash
   cat .env.local
   ```

3. **Browser Console:**

   - Screenshot of console errors
   - Copy "Sending payload to backend:" log

4. **Network Tab:**

   - Screenshot of failed request
   - Copy response body

5. **Backend Logs:**
   - Copy any error messages from backend terminal

---

**Last Updated:** January 11, 2025
**Status:** ✅ Comprehensive Troubleshooting Guide
