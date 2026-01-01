export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          level: number
          total_points: number
          current_streak: number
          max_streak: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          level?: number
          total_points?: number
          current_streak?: number
          max_streak?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          level?: number
          total_points?: number
          current_streak?: number
          max_streak?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bingo_cards: {
        Row: {
          id: string
          user_id: string
          title: string
          size: number
          has_free_center: boolean
          is_active: boolean
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          size?: number
          has_free_center?: boolean
          is_active?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          size?: number
          has_free_center?: boolean
          is_active?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      bingo_cells: {
        Row: {
          id: string
          card_id: string
          position: number
          goal_text: string
          is_completed: boolean
          is_free: boolean
          completed_at: string | null
          category: string | null
          difficulty: number
          points_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_id: string
          position: number
          goal_text?: string
          is_completed?: boolean
          is_free?: boolean
          completed_at?: string | null
          category?: string | null
          difficulty?: number
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          position?: number
          goal_text?: string
          is_completed?: boolean
          is_free?: boolean
          completed_at?: string | null
          category?: string | null
          difficulty?: number
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          cell_id: string | null
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          cell_id?: string | null
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          cell_id?: string | null
          points_earned?: number
          created_at?: string
        }
      }
      battles: {
        Row: {
          id: string
          creator_id: string
          opponent_id: string
          battle_type: 'duel' | 'group' | 'tournament'
          duration_days: number
          start_date: string
          end_date: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          winner_id: string | null
          is_draw: boolean
          bonus_points: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          creator_id: string
          opponent_id: string
          battle_type?: 'duel' | 'group' | 'tournament'
          duration_days?: number
          start_date: string
          end_date: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          winner_id?: string | null
          is_draw?: boolean
          bonus_points?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          creator_id?: string
          opponent_id?: string
          battle_type?: 'duel' | 'group' | 'tournament'
          duration_days?: number
          start_date?: string
          end_date?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          winner_id?: string | null
          is_draw?: boolean
          bonus_points?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      battle_points: {
        Row: {
          id: string
          battle_id: string
          user_id: string
          date: string
          daily_points: number
          total_points: number
          created_at: string
        }
        Insert: {
          id?: string
          battle_id: string
          user_id: string
          date: string
          daily_points?: number
          total_points?: number
          created_at?: string
        }
        Update: {
          id?: string
          battle_id?: string
          user_id?: string
          date?: string
          daily_points?: number
          total_points?: number
          created_at?: string
        }
      }
      battle_participants: {
        Row: {
          id: string
          battle_id: string
          user_id: string
          final_points: number
          rank: number | null
          created_at: string
        }
        Insert: {
          id?: string
          battle_id: string
          user_id: string
          final_points?: number
          rank?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          battle_id?: string
          user_id?: string
          final_points?: number
          rank?: number | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type BingoCard = Database['public']['Tables']['bingo_cards']['Row']
export type BingoCell = Database['public']['Tables']['bingo_cells']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
export type Battle = Database['public']['Tables']['battles']['Row']
export type BattlePoints = Database['public']['Tables']['battle_points']['Row']
export type BattleParticipant = Database['public']['Tables']['battle_participants']['Row']
