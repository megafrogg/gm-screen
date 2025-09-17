# GM Screen - The Modern Game Master's Toolset

A flexible, elegant, and fast digital toolset for running tabletop roleplaying games. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Campaign Management**: Create and manage multiple campaigns
- **Character Sheets**: System-agnostic character management
- **Inventory Tracking**: Manage character items and equipment
- **Story Journal**: Rich text journaling for campaign notes
- **Multi-System Support**: Designed to work with Cairn, D&D 5e, Blades in the Dark, and more

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Authentication**: Clerk (modern auth with great DX)
- **Backend**: Supabase (PostgreSQL, Real-time)
- **Deployment**: Vercel
- **Animations**: GSAP (planned)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (preferred) or npm
- Clerk account (for authentication)
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gm-screen
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your Clerk project:
   - Create a new application at [clerk.com](https://clerk.com)
   - Copy your publishable key and secret key to `.env.local`

5. Configure your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env.local`
   - Run the database migrations (see Database Setup below)

6. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

Run the following SQL in your Supabase SQL editor to create the initial schema:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
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

-- Set up Row Level Security policies
-- Note: Since we're using Clerk for auth, we'll need to create a custom function
-- to handle user ID verification. For now, we'll disable RLS on profiles.
-- You can implement custom RLS policies based on Clerk user IDs if needed.

-- For now, let's create a simple approach without RLS on profiles
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Note: RLS policies using auth.uid() won't work with Clerk
-- For now, we'll handle security at the application level
-- You can implement custom RLS policies later if needed

-- CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can create own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);

-- All RLS policies commented out since they use auth.uid() which doesn't work with Clerk
-- Security will be handled at the application level for now

-- CREATE POLICY "Users can view characters in own campaigns" ON characters FOR SELECT USING (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "Users can create characters in own campaigns" ON characters FOR INSERT WITH CHECK (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "Users can update characters in own campaigns" ON characters FOR UPDATE USING (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "Users can delete characters in own campaigns" ON characters FOR DELETE USING (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );

-- CREATE POLICY "Users can view items for characters in own campaigns" ON items FOR SELECT USING (
--   owner_character_id IN (
--     SELECT id FROM characters 
--     WHERE campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
--   )
-- );
-- CREATE POLICY "Users can create items for characters in own campaigns" ON items FOR INSERT WITH CHECK (
--   owner_character_id IN (
--     SELECT id FROM characters 
--     WHERE campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
--   )
-- );
-- CREATE POLICY "Users can update items for characters in own campaigns" ON items FOR UPDATE USING (
--   owner_character_id IN (
--     SELECT id FROM characters 
--     WHERE campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
--   )
-- );
-- CREATE POLICY "Users can delete items for characters in own campaigns" ON items FOR DELETE USING (
--   owner_character_id IN (
--     SELECT id FROM characters 
--     WHERE campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
--   )
-- );

-- CREATE POLICY "Users can view journal entries in own campaigns" ON journal_entries FOR SELECT USING (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "Users can create journal entries in own campaigns" ON journal_entries FOR INSERT WITH CHECK (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "Users can update journal entries in own campaigns" ON journal_entries FOR UPDATE USING (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "Users can delete journal entries in own campaigns" ON journal_entries FOR DELETE USING (
--   campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
-- );

-- Note: Since we're using Clerk for authentication, we don't need these functions
-- User profiles will be managed by Clerk, and we'll sync user data as needed

-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, username)
--   VALUES (NEW.id, NEW.email);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Development Roadmap

### Phase 0: Setup & Foundations ✅
- [x] Next.js project setup
- [x] Supabase integration
- [x] Authentication system
- [x] Basic UI components

### Phase 1: Cairn MVP (In Progress)
- [ ] Campaign management
- [ ] Character sheets for Cairn
- [ ] Inventory management
- [ ] Story journal

### Phase 2: Multi-System Support
- [ ] Game system templates
- [ ] Dynamic character sheets
- [ ] Support for D&D 5e, Blades in the Dark, etc.

### Phase 3: Polish and Advanced Features
- [ ] GSAP animations
- [ ] Advanced journal features
- [ ] World-building tools
- [ ] Session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.