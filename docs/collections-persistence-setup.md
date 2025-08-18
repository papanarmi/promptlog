# Collections Persistence Setup

This document explains how to set up persistent collections for PromptLog.

## Problem Solved

Previously, collections created through the "+" button in the dashboard would disappear when the page was reloaded because they were only stored in React state. Now collections are persisted across page reloads and browser sessions.

## How It Works

The collections system uses a **multi-layered approach** for maximum reliability:

1. **Supabase Database (Primary)**: Collections are stored in a dedicated `collections` table
2. **Existing Templates (Secondary)**: Collections are extracted from existing templates in `prompt_logs` 
3. **localStorage (Fallback)**: Collections are stored locally as a backup

## Setup Instructions

### Option 1: Run the Migration (Recommended)

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `docs/collections-table-migration.sql`
4. Run the migration

This will create:
- A `collections` table with proper RLS policies
- Indexes for performance
- A `collection` field in `prompt_logs` (if it doesn't exist)

### Option 2: Manual Setup

If you prefer to set up manually or the migration doesn't work:

1. **Collections will automatically fall back to localStorage**
2. **No action required** - the system will work but collections will only persist locally per browser

## Features

### ✅ What Works Now

- **Persistent Collections**: Collections survive page reloads and browser sessions
- **Real-time Sync**: New collections immediately appear in all dropdowns
- **Multi-source Loading**: Collections from database, existing templates, and localStorage are merged
- **Automatic Fallback**: If database is unavailable, uses localStorage
- **User Isolation**: Each user sees only their own collections (when using database)

### 🔄 Data Flow

1. **Creating Collections**:
   - User clicks "+" and creates collection
   - Collection added to local state (immediate UI update)
   - Collection saved to database (with user_id)
   - Collection also saved to localStorage (backup)

2. **Loading Collections**:
   - Load from `collections` table (user-specific)
   - Load from existing `prompt_logs` templates
   - Load from localStorage (fallback)
   - Merge and deduplicate all sources
   - Sort alphabetically

3. **Fallback Strategy**:
   - If database unavailable → Use localStorage
   - If no collections found → Load defaults
   - Always maintain localStorage backup

## Database Schema

```sql
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);
```

## Troubleshooting

### Collections Not Persisting

1. **Check Console**: Look for warnings about "Collections table not available"
2. **Run Migration**: Execute the SQL migration in Supabase
3. **Verify RLS**: Ensure Row Level Security policies are correctly set up
4. **Check Auth**: Ensure user is properly authenticated

### Old Collections Missing

Collections are loaded from multiple sources:
- If you had collections before this update, they should be in localStorage
- Collections from existing templates will be automatically detected
- Worst case: The default collections will be loaded

### Performance Issues

- The system includes indexes on `user_id` and `name` fields
- Collections are cached in React state after initial load
- localStorage provides instant fallback

## Code Changes Made

### New Files
- `src/lib/collectionsContext.tsx` - Global collections state management
- `docs/collections-table-migration.sql` - Database setup script

### Modified Files
- `src/main.tsx` - Added CollectionsProvider wrapper
- `src/pages/PromptLogOverview.tsx` - Uses context instead of local state
- `src/pages/CreateATemplate_New_.tsx` - Dynamic dropdown options
- `src/ui/components/TemplateAdditionalDetails.tsx` - Dynamic dropdown options

## Next Steps

1. **Run the migration** to enable full database persistence
2. **Test collection creation** - they should persist after page reload
3. **Verify dropdowns** show new collections in template creation/editing

The system is designed to work even without the migration, using localStorage as a fallback, but database persistence provides the best user experience.
