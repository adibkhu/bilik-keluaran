# Bilik Keluaran

A Malaysian music community where producers and fans post about releases, attach tracks, discuss the local scene, and discover artists — with strict moderation and no explicit content.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** (dark theme, mobile-first)
- **Supabase** (Auth, PostgreSQL, Storage)
- **Vercel** deployment-ready

## Getting started

### 1. Clone and install

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** and run the full contents of `supabase/schema.sql`.
3. Under **Authentication → URL Configuration**, add:
   - Site URL: `http://localhost:3000` (and your Vercel URL later)
   - Redirect URL: `http://localhost:3000/auth/callback`

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, for admin actions) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally |
| `BETA_CLOSED` | Set `true` to block signups |
| `BETA_INVITE_CODE` | Optional invite code required for signup |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create your admin account

1. Sign up at `/signup`.
2. In Supabase SQL Editor, promote your user:

```sql
update public.profiles set is_admin = true where username = 'your_username';
```

### 6. Seed demo content (optional)

```bash
npm run seed
```

Creates three demo accounts and sample posts if the feed is empty:

| Email | Password | Username |
|-------|----------|----------|
| `amei@seed.bilik.local` | `SeedDemo123!` | `amei_beats` |
| `rizal@seed.bilik.local` | `SeedDemo123!` | `rizal_jb` |
| `fanboy@seed.bilik.local` | `SeedDemo123!` | `penang_fan` |

### 7. Existing project hotfixes

If you already ran an older `schema.sql`, also run:

- `supabase/fix-admin-self-promote.sql` (blocks users from setting `is_admin` on themselves)

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.example`.
4. Update Supabase auth redirect URLs with your Vercel domain.
5. Deploy.

## Routes

| Route | Description |
|-------|-------------|
| `/feed` | Chronological home feed |
| `/create` | Create a post (auth required) |
| `/post/[id]` | Post detail + comments |
| `/profile/[username]` | User profile and posts |
| `/settings` | Edit profile (auth required) |
| `/admin` | Report queue (admin only) |
| `/admin/users` | User moderation (admin only) |
| `/guidelines` | Community guidelines |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

## Post types

- **New Release** — track URL required
- **Discussion** — general music talk
- **Gig / Event** — events and shows
- **Collab / Feedback** — collaboration and feedback requests
- **Discovery** — artist and sound recommendations

Track previews use oEmbed/metadata from Spotify, YouTube, SoundCloud, and Apple Music. No user-uploaded audio in v1.

## Project structure

```
src/
├── app/              # App Router pages and API routes
├── components/       # UI, feed, posts, comments, admin
└── lib/              # Supabase clients, auth, actions, utilities
supabase/
└── schema.sql        # Database schema + RLS policies
```

## Beta launch

- Set `BETA_INVITE_CODE` to require an invite code on signup.
- Set `BETA_CLOSED=true` to block all new signups.
- Run `npm run seed` for starter community posts.

## License

Private — all rights reserved.
