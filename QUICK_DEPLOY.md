# Quick Deployment Guide

## You're seeing the old version because my deployment failed! Here's how to deploy the fix:

### Option 1: Vercel Dashboard (EASIEST - 2 minutes)

1. Go to https://vercel.com/dashboard
2. Find your "flippa-deal-tracker" project
3. Click on it
4. Go to Settings → Git
5. Note the GitHub repo it's connected to
6. We'll push the fixed code there!

### Option 2: Direct Upload to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select "Import from CLI/API" or drag the folder
4. Point it to: `~/flippa-deal-tracker`
5. Click Deploy

### Option 3: Replace Existing Project

If you want to update your existing project:

1. Download your current project from Vercel
2. Replace the `src/App.jsx` file with the one in `~/flippa-deal-tracker/src/App.jsx`
3. Commit and push to trigger automatic deployment

## What I Fixed

The key fix is in `src/App.jsx` line 103-118:

```javascript
function getDisplayTitle(deal) {
  // Priority: business_name > property_name > title (truncated) > generic fallback
  if (deal.business_name && deal.business_name !== 'Sign NDA to view more details →') {
    return deal.business_name
  }
  if (deal.property_name && deal.property_name !== 'Sign NDA to view more details →') {
    return deal.property_name
  }
  if (deal.title) {
    // Use first 60 chars of title as summary
    return deal.title.length > 60 ? deal.title.substring(0, 60) + '...' : deal.title
  }
  return 'Confidential Business Listing'
}
```

This now uses the `title` field from your database, which contains the actual business description!

## Need Help?

Tell me which option you prefer, or I can help you push to GitHub if you give me the repo name.
