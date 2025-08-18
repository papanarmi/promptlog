-- Collections Table Migration
-- Run this SQL in your Supabase SQL editor to create the collections table

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_collections
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_set_updated_at();

-- RLS Policies for collections
CREATE POLICY collections_select_owner ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY collections_insert_owner ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY collections_update_owner ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY collections_delete_owner ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS collections_user_id_idx ON public.collections (user_id);
CREATE INDEX IF NOT EXISTS collections_name_idx ON public.collections (name);

-- Optional: Add collection field to prompt_logs if it doesn't exist
-- (Check if your prompt_logs table uses 'category' or 'collection')
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='prompt_logs' AND column_name='collection') THEN
        ALTER TABLE public.prompt_logs ADD COLUMN collection text;
    END IF;
END $$;

-- Create index on collection field for faster queries
CREATE INDEX IF NOT EXISTS prompt_logs_collection_idx ON public.prompt_logs (collection);
