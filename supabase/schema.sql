-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitored sites table
CREATE TABLE IF NOT EXISTS monitored_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site snapshots table
CREATE TABLE IF NOT EXISTS site_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES monitored_sites(id) ON DELETE CASCADE NOT NULL,
  html_content TEXT NOT NULL,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site changes table
CREATE TABLE IF NOT EXISTS site_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES monitored_sites(id) ON DELETE CASCADE NOT NULL,
  previous_snapshot_id UUID REFERENCES site_snapshots(id),
  current_snapshot_id UUID REFERENCES site_snapshots(id),
  diff_summary JSONB,
  ai_summary TEXT,
  ai_intent TEXT,
  ai_suggestions TEXT,
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monitored_sites_user_id ON monitored_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_site_snapshots_site_id ON site_snapshots(site_id);
CREATE INDEX IF NOT EXISTS idx_site_changes_site_id ON site_changes(site_id);
CREATE INDEX IF NOT EXISTS idx_site_changes_notified ON site_changes(notified);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_changes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Monitored sites policies
CREATE POLICY "Users can view own sites"
  ON monitored_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
  ON monitored_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON monitored_sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON monitored_sites FOR DELETE
  USING (auth.uid() = user_id);

-- Site snapshots policies
CREATE POLICY "Users can view snapshots of own sites"
  ON site_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM monitored_sites
      WHERE monitored_sites.id = site_snapshots.site_id
      AND monitored_sites.user_id = auth.uid()
    )
  );

-- Site changes policies
CREATE POLICY "Users can view changes of own sites"
  ON site_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM monitored_sites
      WHERE monitored_sites.id = site_changes.site_id
      AND monitored_sites.user_id = auth.uid()
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitored_sites_updated_at
  BEFORE UPDATE ON monitored_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

