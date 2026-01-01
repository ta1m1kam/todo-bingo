-- Allow users to search other profiles by display_name
-- This is needed for friend search functionality

CREATE POLICY "Users can search profiles by display_name"
  ON public.profiles FOR SELECT
  USING (
    -- Allow if searching (display_name is not null means profile is searchable)
    display_name IS NOT NULL
  );
