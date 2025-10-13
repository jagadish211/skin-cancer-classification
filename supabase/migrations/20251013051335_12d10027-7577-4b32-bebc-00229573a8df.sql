-- Create classifications table to store analysis results
CREATE TABLE public.classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  classification_type TEXT NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert classifications (public demo)
CREATE POLICY "Allow public insert" ON public.classifications
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read classifications (public demo)
CREATE POLICY "Allow public read" ON public.classifications
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_classifications_created_at ON public.classifications(created_at DESC);