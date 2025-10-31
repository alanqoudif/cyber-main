export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'ADMIN' | 'USER'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'ADMIN' | 'USER'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'ADMIN' | 'USER'
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      recipients: {
        Row: {
          id: string
          email: string
          name: string | null
          campaign_id: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          campaign_id: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          campaign_id?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          type: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'
          user_id: string | null
          campaign_id: string | null
          recipient_id: string | null
          meta: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          type: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'
          user_id?: string | null
          campaign_id?: string | null
          recipient_id?: string | null
          meta?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'
          user_id?: string | null
          campaign_id?: string | null
          recipient_id?: string | null
          meta?: Record<string, unknown>
          created_at?: string
        }
      }
      risk_scores: {
        Row: {
          id: string
          user_id: string | null
          campaign_id: string | null
          score: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          campaign_id?: string | null
          score?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          campaign_id?: string | null
          score?: number
          updated_at?: string
        }
      }
    }
  }
}

