#!/bin/bash

echo "🎨 Applying WHITE THEME to all pages..."
echo "========================================"

cd /Users/bavadharini_k/ai_legal_assistance/AI_legal_Assistant/frontend/src/app

# Update Lawyers Page
echo "📄 Updating Lawyers Page..."
sed -i '' 's/from-slate-900 via-blue-900 to-slate-900/from-gray-50 via-white to-gray-50/g' lawyers/page.tsx
sed -i '' 's/from-indigo-950 via-purple-900 to-indigo-950/from-gray-50 via-white to-gray-50/g' lawyers/page.tsx
sed -i '' 's/bg-white\/5/bg-white/g' lawyers/page.tsx
sed -i '' 's/bg-white\/10/bg-white border border-gray-200/g' lawyers/page.tsx
sed -i '' 's/bg-white\/15/bg-gray-50/g' lawyers/page.tsx
sed -i '' 's/border-white\/10/border-gray-200/g' lawyers/page.tsx
sed -i '' 's/border-white\/20/border-gray-300/g' lawyers/page.tsx
sed -i '' 's/from-purple-500 to-indigo-600/from-blue-600 to-cyan-600/g' lawyers/page.tsx
sed -i '' 's/from-purple-300 via-pink-300 to-indigo-300/from-blue-600 to-cyan-600/g' lawyers/page.tsx
sed -i '' 's/text-purple-300/text-blue-600/g' lawyers/page.tsx
sed -i '' 's/text-gray-300/text-gray-700/g' lawyers/page.tsx
sed -i '' 's/text-gray-400/text-gray-600/g' lawyers/page.tsx
sed -i '' 's/border-purple-/border-blue-/g' lawyers/page.tsx
sed -i '' 's/bg-purple-/bg-blue-/g' lawyers/page.tsx
sed -i '' 's/focus:border-purple-500/focus:border-blue-500/g' lawyers/page.tsx
sed -i '' 's/hover:text-purple-300/hover:text-blue-600/g' lawyers/page.tsx
echo "✅ Lawyers page updated!"

# Update Cases Page
echo "📄 Updating Cases Page..."
sed -i '' 's/from-slate-900 via-blue-900 to-slate-900/from-gray-50 via-white to-gray-50/g' cases/page.tsx
sed -i '' 's/from-indigo-950 via-purple-900 to-indigo-950/from-gray-50 via-white to-gray-50/g' cases/page.tsx
sed -i '' 's/bg-white\/5/bg-white/g' cases/page.tsx
sed -i '' 's/bg-white\/10/bg-white border border-gray-200/g' cases/page.tsx
sed -i '' 's/border-white\/10/border-gray-200/g' cases/page.tsx
sed -i '' 's/border-white\/20/border-gray-300/g' cases/page.tsx
sed -i '' 's/from-purple-500 to-indigo-600/from-blue-600 to-cyan-600/g' cases/page.tsx
sed -i '' 's/from-purple-300 via-pink-300 to-indigo-300/from-blue-600 to-cyan-600/g' cases/page.tsx
sed -i '' 's/text-purple-300/text-blue-600/g' cases/page.tsx
sed -i '' 's/text-gray-300/text-gray-700/g' cases/page.tsx
sed -i '' 's/text-gray-400/text-gray-600/g' cases/page.tsx
sed -i '' 's/hover:text-purple-300/hover:text-blue-600/g' cases/page.tsx
echo "✅ Cases page updated!"

# Update Login Page
echo "📄 Updating Login Page..."
sed -i '' 's/from-slate-900 via-blue-900 to-slate-900/from-gray-50 via-white to-gray-50/g' login/page.tsx
sed -i '' 's/from-indigo-950 via-purple-900 to-indigo-950/from-gray-50 via-white to-gray-50/g' login/page.tsx
sed -i '' 's/bg-white\/5/bg-white/g' login/page.tsx
sed -i '' 's/bg-white\/10/bg-white border border-gray-200/g' login/page.tsx
sed -i '' 's/border-white\/10/border-gray-200/g' login/page.tsx
sed -i '' 's/border-white\/20/border-gray-300/g' login/page.tsx
sed -i '' 's/from-purple-500 to-indigo-600/from-blue-600 to-cyan-600/g' login/page.tsx
sed -i '' 's/from-purple-300 via-pink-300 to-indigo-300/from-blue-600 to-cyan-600/g' login/page.tsx
sed -i '' 's/text-purple-300/text-blue-600/g' login/page.tsx
sed -i '' 's/text-gray-300/text-gray-700/g' login/page.tsx
sed -i '' 's/text-gray-400/text-gray-600/g' login/page.tsx
sed -i '' 's/hover:text-purple-200/hover:text-blue-600/g' login/page.tsx
echo "✅ Login page updated!"

echo ""
echo "========================================"
echo "✅ WHITE THEME applied to all pages!"
echo "========================================"
echo ""
echo "🌐 View your app at: http://localhost:3000"
echo ""
