-- Create transformations table
CREATE TABLE public.transformations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  message TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert transformations (public app)
CREATE POLICY "Anyone can insert transformations" 
ON public.transformations 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading (for admin purposes)
CREATE POLICY "Anyone can view transformations" 
ON public.transformations 
FOR SELECT 
USING (true);