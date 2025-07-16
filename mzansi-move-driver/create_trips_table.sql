-- Create trips table for driver app
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    trip_date DATE NOT NULL,
    trip_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Drivers can view their own trips"
    ON public.trips FOR SELECT
    USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own trips"
    ON public.trips FOR UPDATE
    USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete their own trips"
    ON public.trips FOR DELETE
    USING (auth.uid() = driver_id);

-- Create index for better performance
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_date ON public.trips(trip_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON public.trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 