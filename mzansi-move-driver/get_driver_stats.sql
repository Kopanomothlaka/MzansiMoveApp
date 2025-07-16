CREATE OR REPLACE FUNCTION get_driver_stats(driver_id_param uuid)
RETURNS TABLE (
  total_trips BIGINT,
  average_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(t.id) as total_trips,
    NULL::NUMERIC as average_rating -- Return NULL as reviews table does not exist yet
  FROM
    trips t
  WHERE
    t.driver_id = driver_id_param
    AND t.status = 'completed';
END;
$$ LANGUAGE plpgsql; 