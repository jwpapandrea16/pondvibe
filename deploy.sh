#!/bin/bash
# Deployment script for Pond Vibe

echo "🚀 Deploying Pond Vibe to GitHub..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push github main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🔄 Vercel should auto-deploy in a few moments..."
    echo "📺 Check deployment at: https://vercel.com/dashboard"
else
    echo "❌ Push failed. You may need to authenticate."
    echo "Run: git push github main"
fi
