export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      founders: {
        Row: {
          id: string
          name: string
          handle: string | null
          avatar_url: string | null
          bio: string | null
          past_experience: string | null
          public_links: Json
          credibility_signals: string | null
          open_concerns: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['founders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['founders']['Insert']>
        Relationships: []
      }
      subnets: {
        Row: {
          id: string
          subnet_number: number
          name: string
          slug: string
          category: string | null
          founder_id: string | null
          team_notes: string | null
          thesis: string | null
          latest_update: string | null
          recent_catalysts: string | null
          risks: string | null
          nerds_score: number | null
          last_reviewed_at: string | null
          market_cap_usd: number | null
          alpha_price_usd: number | null
          apy_percent: number | null
          emissions_daily: number | null
          market_data_updated_at: string | null
          github_url: string | null
          website_url: string | null
          status: 'active' | 'inactive' | 'watchlist'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subnets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subnets']['Insert']>
        Relationships: []
      }
      amas: {
        Row: {
          id: string
          subnet_id: string | null
          founder_id: string | null
          title: string
          ama_date: string | null
          transcript: string | null
          raw_notes: string | null
          draft_x_post: string | null
          draft_recap: string | null
          draft_founder_update: string | null
          draft_thesis_update: string | null
          draft_risks: string | null
          draft_quote_highlights: Json
          draft_what_changed: string | null
          published_x_post: string | null
          published_recap: string | null
          published_quote_highlights: Json
          published_what_changed: string | null
          draft_status: 'pending' | 'drafted' | 'approved' | 'published'
          published_at: string | null
          cover_image_url: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['amas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['amas']['Insert']>
        Relationships: []
      }
      signals: {
        Row: {
          id: string
          signal_date: string
          title: string
          body: string
          signal_type: string
          subnet_id: string | null
          severity: 'low' | 'normal' | 'high'
          source_url: string | null
          is_ai_draft: boolean
          approved_by: string | null
          approved_at: string | null
          status: 'draft' | 'published'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['signals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['signals']['Insert']>
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          subnet_id: string
          user_id: string
          sentiment: 'bullish' | 'neutral' | 'bearish'
          confidence: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['votes']['Insert']>
        Relationships: []
      }
      vote_snapshots: {
        Row: {
          id: string
          subnet_id: string
          snapshot_date: string
          bullish_count: number
          neutral_count: number
          bearish_count: number
          avg_confidence: number | null
          community_score: number | null
        }
        Insert: Omit<Database['public']['Tables']['vote_snapshots']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['vote_snapshots']['Insert']>
        Relationships: []
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          subnet_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['watchlists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['watchlists']['Insert']>
        Relationships: []
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          subnet_id: string
          alert_type: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Convenience types
export type Subnet = Database['public']['Tables']['subnets']['Row']
export type Founder = Database['public']['Tables']['founders']['Row']
export type AMA = Database['public']['Tables']['amas']['Row']
export type Signal = Database['public']['Tables']['signals']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type VoteSnapshot = Database['public']['Tables']['vote_snapshots']['Row']
export type Watchlist = Database['public']['Tables']['watchlists']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']

export type Sentiment = 'bullish' | 'neutral' | 'bearish'
export type SignalType = Signal['signal_type']
