-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bingo cards table
CREATE TABLE public.bingo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '2025 Goals',
  size INTEGER NOT NULL DEFAULT 5 CHECK (size >= 3 AND size <= 9),
  has_free_center BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bingo cells table
CREATE TABLE public.bingo_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.bingo_cards(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 80),
  goal_text TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (card_id, position)
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- Friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);

-- Activity log for streak tracking
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  cell_id UUID REFERENCES public.bingo_cells(id) ON DELETE SET NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Bingo cards policies
CREATE POLICY "Users can view own cards"
  ON public.bingo_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON public.bingo_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON public.bingo_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON public.bingo_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Bingo cells policies
CREATE POLICY "Users can view own cells"
  ON public.bingo_cells FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bingo_cards
      WHERE bingo_cards.id = bingo_cells.card_id
      AND bingo_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cells"
  ON public.bingo_cells FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bingo_cards
      WHERE bingo_cards.id = bingo_cells.card_id
      AND bingo_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cells"
  ON public.bingo_cells FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bingo_cards
      WHERE bingo_cards.id = bingo_cells.card_id
      AND bingo_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cells"
  ON public.bingo_cells FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bingo_cards
      WHERE bingo_cards.id = bingo_cells.card_id
      AND bingo_cards.user_id = auth.uid()
    )
  );

-- Achievements policies
CREATE POLICY "Users can view own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they received"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = friend_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bingo_cards_updated_at
  BEFORE UPDATE ON public.bingo_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bingo_cells_updated_at
  BEFORE UPDATE ON public.bingo_cells
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes for performance
CREATE INDEX idx_bingo_cards_user_id ON public.bingo_cards(user_id);
CREATE INDEX idx_bingo_cells_card_id ON public.bingo_cells(card_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
