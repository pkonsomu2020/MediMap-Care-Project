-- Add google_place_id column to clinics table for Google Places API integration
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS google_place_id text UNIQUE;

-- Add index for better performance on google_place_id lookups
CREATE INDEX IF NOT EXISTS idx_clinics_google_place_id ON public.clinics(google_place_id);

-- Add comment to explain the column purpose
COMMENT ON COLUMN public.clinics.google_place_id IS 'Google Places API place_id for tracking duplicates and reducing API costs';
