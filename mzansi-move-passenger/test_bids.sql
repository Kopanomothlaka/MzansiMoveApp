-- Insert test bid data for debugging
-- Replace the UUIDs with actual user and trip IDs from your database

INSERT INTO public.bids (
    trip_id,
    rider_id,
    rider_name,
    rider_phone,
    rider_email,
    bid_amount,
    status,
    message,
    created_at,
    updated_at
) VALUES (
    'your-trip-id-here', -- Replace with actual trip ID
    'your-rider-id-here', -- Replace with actual rider user ID
    'Test Rider',
    '+27123456789',
    'test@example.com',
    150.00,
    'pending',
    'Test bid message',
    NOW(),
    NOW()
); 