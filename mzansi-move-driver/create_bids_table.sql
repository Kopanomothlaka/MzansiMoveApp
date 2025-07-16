-- Create bids table for storing rider bids on trips
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    rider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rider_name TEXT NOT NULL,
    rider_phone TEXT,
    rider_email TEXT,
    bid_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Drivers can view bids on their own trips"
    ON public.bids FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = bids.trip_id 
            AND trips.driver_id = auth.uid()
        )
    );

CREATE POLICY "Riders can insert their own bids"
    ON public.bids FOR INSERT
    WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Drivers can update bids on their own trips"
    ON public.bids FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.trips 
            WHERE trips.id = bids.trip_id 
            AND trips.driver_id = auth.uid()
        )
    );

CREATE POLICY "Riders can update their own bids"
    ON public.bids FOR UPDATE
    USING (auth.uid() = rider_id);

-- Create indexes for better performance
CREATE INDEX idx_bids_trip_id ON public.bids(trip_id);
CREATE INDEX idx_bids_rider_id ON public.bids(rider_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_created_at ON public.bids(created_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bids_updated_at 
    BEFORE UPDATE ON public.bids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 