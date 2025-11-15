# 🃏 Blackjack Web App

Production-ready two-deck blackjack game with real-time leaderboard, built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

**Game:** Two-deck blackjack • Hit/Stand/Double/Split/Insurance • Dealer stands soft 17 • 3:2 blackjack • 2:1 insurance • $1,000 start • $5 min bet • Auto-save game state

**UI:** Framer Motion animations • Howler.js sounds • Mobile responsive • Dark casino theme • Realistic poker chips

**Backend:** Supabase Auth • PostgreSQL + RLS • Real-time leaderboard • Player stats tracking

## Quick Start

### Prerequisites

Node.js 18+, Supabase account (free tier), Vercel account (optional)

### Setup

**1. Install dependencies:**
```bash
npm install
```

**2. Setup Supabase:**

- Create project at [supabase.com](https://supabase.com)
- Go to SQL Editor → Copy/paste `supabase-schema.sql` → Execute
- Go to Settings → API → Copy Project URL and anon key

**3. Configure environment:**

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**4. Add sound files (optional):**

Download 5 MP3s from [freesound.org](https://freesound.org) and place in `/public/sounds/`:
- `card-deal.mp3` - Card swoosh sound
- `chip-clink.mp3` - Poker chips sound  
- `win.mp3` - Cash register/cha-ching
- `loss.mp3` - Buzzer sound
- `casino-ambience.mp3` - Background music

See `/public/sounds/README.md` for details.

**5. Run:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deployment

**Vercel (recommended):**
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

**Or via CLI:**
```bash
npm install -g vercel
vercel
```

## Game Rules

Two 52-card decks (104 total) • Dealer stands soft 17 • Blackjack pays 3:2 • Insurance pays 2:1 • Split pairs • Double on first two cards • $5 min / bankroll max • $1,000 starting

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── leaderboard/route.ts
│   ├── game/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── game/
│       ├── BlackjackTable.tsx
│       ├── Card.tsx
│       ├── ChipSelector.tsx
│       └── Leaderboard.tsx
├── lib/
│   ├── gameLogic.ts
│   ├── localStorage.ts
│   ├── soundManager.ts
│   ├── supabase.ts
│   └── types.ts
├── public/
│   └── sounds/
│       ├── card-deal.mp3
│       ├── chip-clink.mp3
│       ├── win.mp3
│       ├── loss.mp3
│       ├── casino-ambience.mp3
│       └── README.md
├── supabase-schema.sql
├── vercel.json
├── .env.local.example
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Animations**: Framer Motion
- **Audio**: Howler.js
- **Deployment**: Vercel

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Server-side validation for all game actions
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- No client-side manipulation of game outcomes

## 🎨 Design Features

- Dark casino theme with #0f172a background
- Green felt table aesthetic
- Animated card dealing with 150ms stagger
- Card flip animations (300ms)
- Win effects (green glow)
- Bust effects (red shake)
- Realistic poker chip designs
- Mobile-responsive layout
- Smooth transitions and hover effects

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Database errors:** Verify Supabase URL/keys in `.env.local`, ensure schema was executed, check RLS policies enabled

**Sounds not playing:** Check files in `/public/sounds/`, click unmute button, check browser console

**Build errors:** Delete `.next` folder and rebuild, check TypeScript errors with `npm run build`

**Login fails:** Clear localStorage, verify database setup, check API keys correct

## Tech Stack

Next.js 14 • TypeScript • Tailwind CSS • Supabase (PostgreSQL + Auth + Realtime) • Framer Motion • Howler.js

## License

MIT License - Open source
