-- Grant permissions to authenticated users
-- This is needed for RLS to work properly

-- Grant permissions on profiles table
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Grant permissions on bingo_cards table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bingo_cards TO authenticated;

-- Grant permissions on bingo_cells table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bingo_cells TO authenticated;

-- Grant permissions on achievements table
GRANT SELECT, INSERT ON public.achievements TO authenticated;

-- Grant permissions on friendships table
GRANT SELECT, INSERT, UPDATE ON public.friendships TO authenticated;

-- Grant permissions on activity_log table
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
