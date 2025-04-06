/*
  # Add Revision Materials and Mood Logs Tables

  1. New Tables
    - `revision_materials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `title` (text)
      - `content` (jsonb)
      - `original_filename` (text)
      - `created_at` (timestamptz)
    - `mood_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `mood` (text)
      - `emotions` (text[])
      - `reasons` (text[])
      - `recommendations` (text[])
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create revision_materials table
CREATE TABLE IF NOT EXISTS revision_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  original_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  emotions TEXT[] NOT NULL,
  reasons TEXT[] NOT NULL,
  recommendations TEXT[] NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE revision_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revision_materials
CREATE POLICY "Users can manage own revision materials"
  ON revision_materials
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for mood_logs
CREATE POLICY "Users can manage own mood logs"
  ON mood_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);