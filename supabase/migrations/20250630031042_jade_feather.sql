/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, required) - Project name
      - `description` (text, optional) - Project description
      - `color` (text, required) - Project color for UI
      - `status` (text, required) - Project status (active, completed, on-hold, cancelled)
      - `start_date` (timestamptz, optional) - Project start date
      - `end_date` (timestamptz, optional) - Project end date
      - `progress` (integer, required, default 0) - Project completion percentage
      - `created_at` (timestamptz, required, default now()) - Record creation timestamp
      - `updated_at` (timestamptz, required, default now()) - Record update timestamp
      - `user_id` (uuid, required) - Foreign key to auth.users

  2. Security
    - Enable RLS on `projects` table
    - Add policies for authenticated users to manage their own projects:
      - SELECT: Users can read their own projects
      - INSERT: Users can create projects for themselves
      - UPDATE: Users can update their own projects
      - DELETE: Users can delete their own projects

  3. Indexes
    - Index on user_id for efficient querying
    - Index on status for filtering
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz,
  end_date timestamptz,
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);

-- Add constraint to ensure valid status values
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('active', 'completed', 'on-hold', 'cancelled'));

-- Add constraint to ensure progress is between 0 and 100
ALTER TABLE projects ADD CONSTRAINT projects_progress_check 
  CHECK (progress >= 0 AND progress <= 100);