-- Add policy to allow riders to view trips for bidding
CREATE POLICY "Riders can view trips for bidding"
    ON public.trips FOR SELECT
    USING (true); -- Allow all riders to view trips for bidding purposes 