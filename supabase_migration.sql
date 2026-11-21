-- ============================================================================
-- AAROH ART MARKETPLACE - SUPABASE POSTGRESQL & AUTH MIGRATION
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Create public.profiles table (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'artisan', 'admin')),
  user_id TEXT UNIQUE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Performance & Unique Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies (Users can only access and update their own record)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public can view basic artisan profiles for the marketplace catalog
DROP POLICY IF EXISTS "Public can view artisan profiles" ON public.profiles;
CREATE POLICY "Public can view artisan profiles"
  ON public.profiles
  FOR SELECT
  USING (role = 'artisan');

-- 5. Trigger Function: Automatically create/update profile when auth.users changes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_user_id TEXT;
BEGIN
  -- Generate unique AAROH-XXXXXX identifier if not provided
  assigned_user_id := COALESCE(
    NEW.raw_user_meta_data->>'user_id',
    'AAROH-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
  );

  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone_number,
    email_verified,
    phone_verified,
    role,
    user_id,
    avatar,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone_number'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    COALESCE(NEW.phone_confirmed_at IS NOT NULL, FALSE),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    assigned_user_id,
    NEW.raw_user_meta_data->>'avatar',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    email_verified = (NEW.email_confirmed_at IS NOT NULL),
    phone_verified = (NEW.phone_confirmed_at IS NOT NULL),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Compatibility View for public.users
CREATE OR REPLACE VIEW public.users AS
  SELECT 
    id,
    user_id,
    name,
    email,
    phone_number,
    email_verified,
    phone_verified,
    role,
    avatar,
    created_at,
    updated_at
  FROM public.profiles;

-- ============================================================================
-- Migration complete. Profiles table with RLS and automated sync is ready.
-- ============================================================================
