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
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type BingoCard = Database['public']['Tables']['bingo_cards']['Row']
export type BingoCell = Database['public']['Tables']['bingo_cells']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
