#!/bin/bash

echo "🚀 Deploying Flippa Deal Tracker to Vercel..."
echo ""
echo "📦 Building project..."
npm run build

echo ""
echo "🔗 Deploying to Vercel..."
echo "Note: If not authenticated, visit the URL shown and approve"
echo ""

vercel --prod
