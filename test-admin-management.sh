#!/bin/bash

# Admin Management Page - Quick Test Script
# This script helps verify the admin management page is working correctly

echo "🚀 Admin Management Page - Test Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
echo "📋 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file found"
    
    # Check if API URL is set
    if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
        API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} API URL configured: $API_URL"
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_API_URL not found in .env.local"
        echo -e "${YELLOW}⚠${NC}  Please add: NEXT_PUBLIC_API_URL=http://localhost:9600/api/v1"
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found"
    echo -e "${YELLOW}⚠${NC}  Creating from .env.local.example..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local - please configure it"
fi

echo ""

# Check if required files exist
echo "📁 Checking required files..."
FILES=(
    "src/app/admin/auth/admins/page.tsx"
    "src/services/admin/admin-management.service.ts"
    "src/types/admin-management.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
done

echo ""

# Check if node_modules exists
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules found"
else
    echo -e "${YELLOW}⚠${NC}  node_modules not found"
    echo "   Run: npm install"
fi

echo ""

# Check if backend is running
echo "🔌 Checking backend connection..."
if [ ! -z "$API_URL" ]; then
    BACKEND_URL=$(echo $API_URL | sed 's|/api/v1||')
    
    if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is reachable at $BACKEND_URL"
    else
        echo -e "${RED}✗${NC} Backend is not reachable at $BACKEND_URL"
        echo -e "${YELLOW}⚠${NC}  Make sure your backend server is running"
    fi
fi

echo ""

# TypeScript check
echo "🔍 Running TypeScript check..."
if command -v npm &> /dev/null; then
    if npm run type-check > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} No TypeScript errors"
    else
        echo -e "${YELLOW}⚠${NC}  TypeScript errors found - run 'npm run type-check' for details"
    fi
else
    echo -e "${YELLOW}⚠${NC}  npm not found - skipping TypeScript check"
fi

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo ""
echo "Page URL: http://localhost:3000/admin/auth/admins"
echo ""
echo "Next Steps:"
echo "1. Start the development server: npm run dev"
echo "2. Ensure backend is running on port 9600"
echo "3. Navigate to: http://localhost:3000/admin/auth/admins"
echo "4. Login with admin credentials"
echo "5. Test all features"
echo ""
echo "Documentation:"
echo "- ADMIN_MANAGEMENT_IMPLEMENTATION.md - Full implementation guide"
echo "- ADMIN_MANAGEMENT_QUICK_REFERENCE.md - Quick reference"
echo "- ADMIN_MANAGEMENT_COMPLETE.md - Summary"
echo ""
echo "✨ Ready to test!"
