-- Update trips table to include 'pending' status
ALTER TABLE public.trips 
DROP CONSTRAINT IF EXISTS trips_status_check;

ALTER TABLE public.trips 
ADD CONSTRAINT trips_status_check 
CHECK (status IN ('pending', 'active', 'completed', 'cancelled'));

-- Update existing trips to have 'pending' status if they don't have a status
UPDATE public.trips 
SET status = 'pending' 
WHERE status IS NULL OR status = '';

-- Add a comment to explain the status workflow
COMMENT ON COLUMN public.trips.status IS 'Trip status: pending (waiting for rider), active (rider accepted/bid placed), completed (trip finished), cancelled (trip cancelled)'; 