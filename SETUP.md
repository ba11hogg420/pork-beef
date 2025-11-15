# Quick Setup Guide

## Step-by-Step Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Project
1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Fill in project details and wait for it to initialize (~2 minutes)

### 3. Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy all content from `supabase-schema.sql` file
4. Paste into the editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned"

### 4. Get API Credentials
1. In Supabase dashboard, go to **Settings** > **API**
2. Copy the **Project URL** (under Project API)
3. Copy the **anon public** key (under Project API keys)

### 5. Set Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and paste your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 6. Add Sound Files (Optional but Recommended)
1. Visit https://freesound.org/
2. Download these 5 sounds (search terms in parentheses):
   - card-deal.mp3 (card swoosh)
   - chip-clink.mp3 (poker chips)
   - win.mp3 (cash register)
   - loss.mp3 (buzzer)
   - casino-ambience.mp3 (casino ambience)
3. Place all files in `/public/sounds/` folder
4. Or use placeholder sounds - the app will work without them

### 7. Run Development Server
```bash
npm run dev
```

### 8. Test the App
1. Open http://localhost:3000
2. Click **Register**
3. Create a test account (username: "testuser", password: "test123")
4. You should see $1,000 starting bankroll
5. Place a bet and play!

## Deployment to Vercel (2 minutes)

### Option 1: GitHub (Recommended)
1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```
2. Go to https://vercel.com
3. Click **Import Project**
4. Select your GitHub repo
5. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Click **Deploy**
7. Done! Your app is live at yourapp.vercel.app

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow prompts and add environment variables when asked.

## Troubleshooting

### "Failed to fetch" error
- Check your `.env.local` file exists and has correct values
- Restart the dev server after adding env variables

### Database errors
- Make sure you ran the SQL schema in Supabase
- Check RLS policies are enabled
- Verify your Supabase project is active

### Sound not playing
- Check sound files are in `/public/sounds/` folder
- Click the unmute button in the app
- Check browser console for file loading errors

### Login not working
- Clear localStorage and try again
- Check Supabase Auth is enabled
- Verify API keys are correct

## What's Next?

After setup, you can:
1. Customize the starting bankroll in `supabase-schema.sql`
2. Adjust minimum bet in `lib/gameLogic.ts`
3. Change color theme in `tailwind.config.ts`
4. Add more sound effects in `lib/soundManager.ts`

## Need Help?

- Check the main README.md for detailed documentation
- Review the Supabase dashboard for database issues
- Check browser console for JavaScript errors
- Ensure all environment variables are set correctly

Happy gaming! 🎰
