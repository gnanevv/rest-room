import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get keys from app.config extra so that we don't commit secrets
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase keys are missing. Add them to app.json → expo.extra');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // we run without user auth/session
  },
});

// Database schema for restrooms table:
/*
CREATE TABLE restrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'София',
  business_type TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(5,2),
  accessibility BOOLEAN DEFAULT false,
  description TEXT,
  amenities TEXT[],
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.0,
  cleanliness INTEGER DEFAULT 5,
  availability TEXT DEFAULT 'available',
  is_open BOOLEAN DEFAULT true,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE restrooms ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON restrooms
  FOR SELECT USING (true);

-- Create policy for authenticated insert
CREATE POLICY "Authenticated insert" ON restrooms
  FOR INSERT WITH CHECK (true);
*/