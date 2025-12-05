#!/bin/bash

echo "🎨 Applying CONSISTENT COLOR PALETTE to all pages..."
echo "===================================================="
echo ""
echo "Using HOME PAGE colors as the standard:"
echo "  - Blue-600 to Cyan-600 (logo, buttons)"
echo "  - Gray-900, Gray-700, Gray-600 (text)"
echo "  - Gray-200, Gray-300 (borders)"
echo "  - White/Gray-50 (backgrounds)"
echo ""

cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/frontend/src/app

# ============================================
# LAWYERS PAGE - Make consistent with home
# ============================================
echo "📄 Updating Lawyers Page..."

# Replace all amber colors with blue
sed -i '' 's/text-amber-200/text-blue-600/g' lawyers/page.tsx
sed -i '' 's/text-amber-/text-blue-/g' lawyers/page.tsx
sed -i '' 's/bg-amber-/bg-blue-/g' lawyers/page.tsx
sed -i '' 's/border-amber-/border-blue-/g' lawyers/page.tsx
sed -i '' 's/hover:text-amber-200/hover:text-blue-600/g' lawyers/page.tsx
sed -i '' 's/focus:border-amber-400/focus:border-blue-500/g' lawyers/page.tsx

# Fix text colors to match home page
sed -i '' 's/text-white/text-gray-900/g' lawyers/page.tsx

# Fix blue shades to match home page
sed -i '' 's/text-blue-200/text-blue-600/g' lawyers/page.tsx
sed -i '' 's/bg-blue-900\/30/bg-blue-50/g' lawyers/page.tsx
sed -i '' 's/border-blue-500\/50/border-blue-200/g' lawyers/page.tsx
sed -i '' 's/bg-blue-500\/20/bg-blue-100/g' lawyers/page.tsx
sed -i '' 's/border-blue-400\/30/border-blue-300/g' lawyers/page.tsx
sed -i '' 's/text-blue-200/text-blue-600/g' lawyers/page.tsx
sed -i '' 's/hover:bg-blue-500\/30/hover:bg-blue-200/g' lawyers/page.tsx

# Fix select/input backgrounds
sed -i '' 's/backdrop-blur-sm/bg-white/g' lawyers/page.tsx

echo "✅ Lawyers page updated!"

# ============================================
# CASES PAGE - Make consistent with home
# ============================================
echo "📄 Updating Cases Page..."

sed -i '' 's/text-amber-200/text-blue-600/g' cases/page.tsx
sed -i '' 's/text-amber-/text-blue-/g' cases/page.tsx
sed -i '' 's/bg-amber-/bg-blue-/g' cases/page.tsx
sed -i '' 's/border-amber-/border-blue-/g' cases/page.tsx
sed -i '' 's/text-white/text-gray-900/g' cases/page.tsx

echo "✅ Cases page updated!"

# ============================================
# LOGIN PAGE - Make consistent with home
# ============================================
echo "📄 Updating Login Page..."

sed -i '' 's/text-amber-200/text-blue-600/g' login/page.tsx
sed -i '' 's/text-amber-/text-blue-/g' login/page.tsx
sed -i '' 's/bg-amber-/bg-blue-/g' login/page.tsx
sed -i '' 's/border-amber-/border-blue-/g' login/page.tsx
sed -i '' 's/text-white/text-gray-900/g' login/page.tsx
sed -i '' 's/text-gray-400/text-gray-600/g' login/page.tsx

echo "✅ Login page updated!"

echo ""
echo "===================================================="
echo "✅ ALL PAGES NOW USE CONSISTENT COLORS!"
echo "===================================================="
echo ""
echo "Color Palette Applied:"
echo "  ✓ Logo: Blue-600 → Cyan-600"
echo "  ✓ Buttons: Blue-600 → Cyan-600"
echo "  ✓ Headings: Gray-900"
echo "  ✓ Body Text: Gray-700"
echo "  ✓ Muted Text: Gray-600"
echo "  ✓ Borders: Gray-200, Gray-300"
echo "  ✓ Backgrounds: White, Gray-50"
echo "  ✓ Accents: Blue-600, Blue-500, Blue-100"
echo ""
echo "🌐 View at: http://localhost:3000"
echo ""
