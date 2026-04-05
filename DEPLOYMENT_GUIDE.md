# Flippa Deal Tracker - Fixed Version

## Changes Made

### 1. Fixed Title Display Issue
**Problem:** Titles showing "Sign NDA to view more details →" instead of business descriptions

**Solution:** Updated the `getDisplayTitle()` function to use this priority order:
1. `business_name` (if available and not the placeholder text)
2. `property_name` (if available and not the placeholder text)
3. `title` field (first 60 chars as summary) - **THIS IS THE KEY FIX**
4. Fallback: "Confidential Business Listing"

The `title` field from Flippa contains the business description/summary!

### 2. Added Feedback Functionality
**New Features:**
- Thumbs up/down buttons on each deal card
- Optional feedback textarea for notes
- Saves to Supabase with these columns:
  - `user_feedback` ('interested' or 'passed')
  - `feedback_reason` (optional notes)
  - `feedback_at` (timestamp)

### 3. Filter by Feedback Status
- All Deals
- Interested (shows deals marked interested OR with positive feedback)
- Passed (shows deals marked passed OR with negative feedback)
- Pending Review (deals without feedback)

## Required Supabase Columns

Make sure your `flippa_deals` table has these columns:

```sql
ALTER TABLE flippa_deals 
ADD COLUMN IF NOT EXISTS user_feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_reason TEXT,
ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMP;
```

Run this in your Supabase SQL Editor.

## Deployment

To deploy, run:
```bash
cd ~/flippa-deal-tracker
vercel --prod
```

Or drag the folder to Vercel dashboard.
