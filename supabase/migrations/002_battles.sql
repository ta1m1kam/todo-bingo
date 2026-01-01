-- Battles table
CREATE TABLE public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Battle settings
  battle_type TEXT DEFAULT 'duel' CHECK (battle_type IN ('duel', 'group', 'tournament')),
  duration_days INTEGER DEFAULT 7 CHECK (duration_days >= 1 AND duration_days <= 365),

  -- Period
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),

  -- Winner (determined on completion)
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_draw BOOLEAN DEFAULT false,

  -- Bonus points setting
  bonus_points INTEGER DEFAULT 1000 CHECK (bonus_points >= 0),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CHECK (creator_id != opponent_id),
  CHECK (end_date > start_date)
);

-- Battle points table (daily tracking)
CREATE TABLE public.battle_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.battles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Daily data
  date DATE NOT NULL,
  daily_points INTEGER DEFAULT 0 CHECK (daily_points >= 0),

  -- Cumulative data (cache)
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One record per user per day
  UNIQUE (battle_id, user_id, date)
);

-- Battle participants table (for future group battles)
CREATE TABLE public.battle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.battles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Final score
  final_points INTEGER DEFAULT 0,
  rank INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (battle_id, user_id)
);

-- Indexes
CREATE INDEX idx_battles_creator_id ON public.battles(creator_id);
CREATE INDEX idx_battles_opponent_id ON public.battles(opponent_id);
CREATE INDEX idx_battles_status ON public.battles(status);
CREATE INDEX idx_battles_end_date ON public.battles(end_date) WHERE status = 'active';

CREATE INDEX idx_battle_points_battle_id ON public.battle_points(battle_id);
CREATE INDEX idx_battle_points_user_id ON public.battle_points(user_id);
CREATE INDEX idx_battle_points_date ON public.battle_points(date);

CREATE INDEX idx_battle_participants_battle_id ON public.battle_participants(battle_id);
CREATE INDEX idx_battle_participants_user_id ON public.battle_participants(user_id);

-- Enable Row Level Security
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;

-- Battles policies
CREATE POLICY "Users can view own battles"
  ON public.battles FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create battles as creator"
  ON public.battles FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Opponent can accept or reject pending battles"
  ON public.battles FOR UPDATE
  USING (auth.uid() = opponent_id AND status = 'pending')
  WITH CHECK (auth.uid() = opponent_id AND status IN ('active', 'cancelled'));

CREATE POLICY "Creator can cancel pending battles"
  ON public.battles FOR UPDATE
  USING (auth.uid() = creator_id AND status = 'pending')
  WITH CHECK (auth.uid() = creator_id AND status = 'cancelled');

CREATE POLICY "Participants can complete active battles"
  ON public.battles FOR UPDATE
  USING ((auth.uid() = creator_id OR auth.uid() = opponent_id) AND status = 'active')
  WITH CHECK ((auth.uid() = creator_id OR auth.uid() = opponent_id) AND status = 'completed');

-- Battle points policies
CREATE POLICY "Users can view battle points for their battles"
  ON public.battle_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles
      WHERE battles.id = battle_points.battle_id
      AND (battles.creator_id = auth.uid() OR battles.opponent_id = auth.uid())
    )
  );

CREATE POLICY "System can insert battle points"
  ON public.battle_points FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.battles
      WHERE battles.id = battle_points.battle_id
      AND (battles.creator_id = auth.uid() OR battles.opponent_id = auth.uid())
    )
  );

-- Battle participants policies
CREATE POLICY "Users can view participants for their battles"
  ON public.battle_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles
      WHERE battles.id = battle_participants.battle_id
      AND (battles.creator_id = auth.uid() OR battles.opponent_id = auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_battles_updated_at
  BEFORE UPDATE ON public.battles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to record battle points from activity_log
CREATE OR REPLACE FUNCTION public.record_battle_points()
RETURNS TRIGGER AS $$
DECLARE
  active_battle RECORD;
BEGIN
  -- Only process cell_complete and bingo activities
  IF NEW.activity_type IN ('cell_complete', 'bingo') THEN
    -- Find active battles for this user (use activity timestamp for validation)
    FOR active_battle IN
      SELECT id, creator_id, opponent_id
      FROM public.battles
      WHERE status = 'active'
      AND (creator_id = NEW.user_id OR opponent_id = NEW.user_id)
      AND start_date <= NEW.created_at
      AND end_date >= NEW.created_at
    LOOP
      -- Insert or update daily points (use activity date, not current date)
      INSERT INTO public.battle_points (battle_id, user_id, date, daily_points, total_points)
      VALUES (
        active_battle.id,
        NEW.user_id,
        DATE(NEW.created_at),
        NEW.points_earned,
        NEW.points_earned
      )
      ON CONFLICT (battle_id, user_id, date)
      DO UPDATE SET
        daily_points = battle_points.daily_points + NEW.points_earned,
        total_points = battle_points.total_points + NEW.points_earned;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to record battle points on activity_log insert
CREATE TRIGGER on_activity_log_record_battle_points
  AFTER INSERT ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION public.record_battle_points();

-- Function to complete a battle
CREATE OR REPLACE FUNCTION public.complete_battle(battle_uuid UUID)
RETURNS void AS $$
DECLARE
  battle_record RECORD;
  creator_total INTEGER;
  opponent_total INTEGER;
BEGIN
  -- Get battle info
  SELECT * INTO battle_record FROM public.battles WHERE id = battle_uuid;

  -- Authorization check: only participants can complete
  IF battle_record.creator_id != auth.uid() AND battle_record.opponent_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: only battle participants can complete this battle';
  END IF;

  IF battle_record.status != 'active' THEN
    RETURN;
  END IF;

  -- Calculate total points for each player
  SELECT COALESCE(SUM(daily_points), 0) INTO creator_total
  FROM public.battle_points
  WHERE battle_id = battle_uuid AND user_id = battle_record.creator_id;

  SELECT COALESCE(SUM(daily_points), 0) INTO opponent_total
  FROM public.battle_points
  WHERE battle_id = battle_uuid AND user_id = battle_record.opponent_id;

  -- Determine winner
  UPDATE public.battles
  SET
    status = 'completed',
    completed_at = NOW(),
    winner_id = CASE
      WHEN creator_total > opponent_total THEN battle_record.creator_id
      WHEN opponent_total > creator_total THEN battle_record.opponent_id
      ELSE NULL
    END,
    is_draw = (creator_total = opponent_total)
  WHERE id = battle_uuid;

  -- Award bonus points to winner
  IF creator_total > opponent_total THEN
    UPDATE public.profiles
    SET total_points = total_points + battle_record.bonus_points
    WHERE id = battle_record.creator_id;

    INSERT INTO public.activity_log (user_id, activity_type, points_earned)
    VALUES (battle_record.creator_id, 'battle_win', battle_record.bonus_points);
  ELSIF opponent_total > creator_total THEN
    UPDATE public.profiles
    SET total_points = total_points + battle_record.bonus_points
    WHERE id = battle_record.opponent_id;

    INSERT INTO public.activity_log (user_id, activity_type, points_earned)
    VALUES (battle_record.opponent_id, 'battle_win', battle_record.bonus_points);
  END IF;

  -- Record participants for history
  INSERT INTO public.battle_participants (battle_id, user_id, final_points, rank)
  VALUES
    (battle_uuid, battle_record.creator_id, creator_total,
      CASE WHEN creator_total > opponent_total THEN 1
           WHEN creator_total < opponent_total THEN 2
           ELSE 1 END),
    (battle_uuid, battle_record.opponent_id, opponent_total,
      CASE WHEN opponent_total > creator_total THEN 1
           WHEN opponent_total < creator_total THEN 2
           ELSE 1 END)
  ON CONFLICT (battle_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
