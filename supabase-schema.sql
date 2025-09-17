-- GM Screen Database Schema for Clerk Authentication
-- Run this in your Supabase SQL Editor

-- Create profiles table (using Clerk user IDs as strings)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  game_system TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create characters table
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_npc BOOLEAN DEFAULT FALSE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Row Level Security (RLS) is disabled for now since we're using Clerk
-- Security will be handled at the application level
-- You can enable RLS later with custom policies if needed
