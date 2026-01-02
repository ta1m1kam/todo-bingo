-- Grant permissions for battle-related tables
-- This is needed for RLS to work properly

-- Grant permissions on battles table
GRANT SELECT, INSERT, UPDATE ON public.battles TO authenticated;

-- Grant permissions on battle_points table
GRANT SELECT, INSERT ON public.battle_points TO authenticated;

-- Grant permissions on battle_participants table
GRANT SELECT, INSERT ON public.battle_participants TO authenticated;
