import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get user ID from Clerk
export const getClerkUserId = () => {
  if (typeof window !== 'undefined') {
    // This will be set by Clerk middleware
    return localStorage.getItem('clerk_user_id')
  }
  return null
}

// Database types (we'll define these as we build the schema)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          game_system: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          game_system: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          game_system?: string
          created_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          campaign_id: string
          name: string
          is_npc: boolean
          data: Record<string, unknown> // JSONB - will hold system-specific stats
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          name: string
          is_npc?: boolean
          data: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          name?: string
          is_npc?: boolean
          data?: Record<string, unknown>
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          owner_character_id: string
          name: string
          description: string | null
          quantity: number
          properties: Record<string, unknown> // JSONB - for things like "bulky" in Cairn
          created_at: string
        }
        Insert: {
          id?: string
          owner_character_id: string
          name: string
          description?: string | null
          quantity?: number
          properties?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          owner_character_id?: string
          name?: string
          description?: string | null
          quantity?: number
          properties?: Record<string, unknown>
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          campaign_id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          title?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}
