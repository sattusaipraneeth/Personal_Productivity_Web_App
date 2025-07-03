import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          completed: boolean;
          priority: string;
          due_date: string | null;
          category: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          project_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          priority: string;
          due_date?: string | null;
          category: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          project_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          priority?: string;
          due_date?: string | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          project_id?: string | null;
        };
      };
      habits: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          streak: number;
          completed_dates: string[];
          target: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color: string;
          streak?: number;
          completed_dates?: string[];
          target?: number;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          streak?: number;
          completed_dates?: string[];
          target?: number;
          created_at?: string;
          user_id?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          tags: string[];
          category: string;
          pinned: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          tags?: string[];
          category: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          category?: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          status: string;
          start_date: string | null;
          end_date: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
};