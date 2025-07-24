-- =====================================================
-- Experiments Gallery Database Setup
-- =====================================================
-- This script sets up the complete database schema for:
-- 1. Voting system for experiments
-- 2. User authentication and profiles
-- 3. Row Level Security policies
-- =====================================================

-- =====================================================
-- 1. EXPERIMENT VOTES TABLE
-- =====================================================

-- Create the experiment_votes table
CREATE TABLE IF NOT EXISTS public.experiment_votes (
    id BIGSERIAL PRIMARY KEY,
    experiment_id TEXT NOT NULL,
    vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one vote per user per experiment OR one vote per device per experiment
    CONSTRAINT unique_user_experiment UNIQUE (experiment_id, user_id),
    CONSTRAINT unique_device_experiment UNIQUE (experiment_id, device_id),
    
    -- Ensure either user_id or device_id is provided (but not both null)
    CONSTRAINT user_or_device_required CHECK (
        (user_id IS NOT NULL AND device_id IS NOT NULL) OR
        (user_id IS NOT NULL AND device_id IS NULL) OR
        (user_id IS NULL AND device_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiment_votes_experiment_id ON public.experiment_votes(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_votes_user_id ON public.experiment_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_votes_device_id ON public.experiment_votes(device_id);

-- =====================================================
-- 2. USER PROFILES TABLE
-- =====================================================

-- Create the profiles table for public user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- =====================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on experiment_votes table
ALTER TABLE public.experiment_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read votes (for displaying totals)
CREATE POLICY "Anyone can view experiment votes" ON public.experiment_votes
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert votes with their user_id
CREATE POLICY "Authenticated users can vote" ON public.experiment_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can insert votes with device_id only
CREATE POLICY "Anonymous users can vote with device_id" ON public.experiment_votes
    FOR INSERT WITH CHECK (user_id IS NULL AND device_id IS NOT NULL);

-- Policy: Users can update their own votes
CREATE POLICY "Users can update their own votes" ON public.experiment_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Anonymous users can update votes by device_id
CREATE POLICY "Anonymous users can update votes by device_id" ON public.experiment_votes
    FOR UPDATE USING (user_id IS NULL AND device_id IS NOT NULL);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 4. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS handle_updated_at ON public.experiment_votes;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.experiment_votes
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =====================================================
-- 5. RPC FUNCTION FOR VOTE AGGREGATION
-- =====================================================

-- Function to get experiment votes and user's current vote
CREATE OR REPLACE FUNCTION public.get_experiment_votes(
    p_experiment_id TEXT,
    p_user_id UUID DEFAULT NULL,
    p_device_id TEXT DEFAULT NULL
)
RETURNS TABLE(total_votes BIGINT, user_vote INTEGER) AS $$
BEGIN
    -- Get total votes for the experiment
    SELECT COALESCE(SUM(vote), 0) INTO total_votes
    FROM public.experiment_votes
    WHERE experiment_id = p_experiment_id;

    -- Get user's current vote (prioritize user_id over device_id)
    IF p_user_id IS NOT NULL THEN
        SELECT vote INTO user_vote
        FROM public.experiment_votes
        WHERE experiment_id = p_experiment_id AND user_id = p_user_id;
    ELSIF p_device_id IS NOT NULL THEN
        SELECT vote INTO user_vote
        FROM public.experiment_votes
        WHERE experiment_id = p_experiment_id AND device_id = p_device_id AND user_id IS NULL;
    ELSE
        user_vote := 0;
    END IF;

    -- Default to 0 if no vote found
    IF user_vote IS NULL THEN
        user_vote := 0;
    END IF;

    RETURN QUERY SELECT total_votes, user_vote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. SEED DATA (OPTIONAL)
-- =====================================================

-- Insert some initial vote data for testing (optional)
-- You can uncomment these lines if you want some test data

/*
INSERT INTO public.experiment_votes (experiment_id, vote, device_id) VALUES
    ('gravity-balls', 1, 'test-device-1'),
    ('gravity-balls', 1, 'test-device-2'),
    ('crazy-calculator', -1, 'test-device-1'),
    ('liquid-gravity', 1, 'test-device-3'),
    ('magnet-sim', 1, 'test-device-1'),
    ('motorcycle-game', 1, 'test-device-2'),
    ('octagon-bounce', 1, 'test-device-3'),
    ('planetary-sim', 1, 'test-device-1')
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- Next steps:
-- 1. Run this script in your Supabase SQL editor
-- 2. Enable Google OAuth in Supabase Auth settings
-- 3. Update your .env.local with correct Supabase keys
-- 4. Test the voting functionality
-- 
-- =====================================================