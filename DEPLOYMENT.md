# Deployment Guide

## Deploy to Vercel (Recommended - Free Tier Available)

Vercel is the recommended platform as it's built by the creators of Next.js and offers seamless integration.

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com with GitHub)
- Completed Supabase setup

### Method 1: GitHub Integration (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Blackjack app"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Click "Environment Variables"
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
   - Add to Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live at `your-project.vercel.app`

5. **Auto-Deploy** (Bonus)
   - Every push to main branch auto-deploys
   - Pull requests get preview deployments

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Post-Deployment Checklist

- [ ] Test registration with a new account
- [ ] Verify login works
- [ ] Play a complete game
- [ ] Check leaderboard updates in real-time
- [ ] Test on mobile device
- [ ] Verify sound effects work (may need user interaction first)
- [ ] Check browser console for errors

## Alternative Deployment Options

### Deploy to Netlify

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

2. **Add netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

### Deploy to AWS Amplify

1. Connect your GitHub repo
2. Set build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add environment variables
4. Deploy

### Self-Hosting (VPS/Docker)

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "blackjack" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., blackjack.yourdomain.com)
3. Add DNS records as shown
4. Wait for SSL certificate (automatic)

### DNS Configuration
```
Type: CNAME
Name: blackjack (or @)
Value: cname.vercel-dns.com
```

## Environment Variables Management

### Production Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...your-key
```

### Security Best Practices
- Never commit `.env.local` to Git
- Use Vercel's environment variable encryption
- Rotate keys if compromised
- Use Supabase RLS for database security

## Performance Optimization

### Vercel-Specific Optimizations
- Edge Functions are automatic
- Image optimization is built-in
- Automatic code splitting enabled
- CDN distribution worldwide

### Additional Optimizations
1. Enable Vercel Analytics:
   ```bash
   npm install @vercel/analytics
   ```

2. Add to `app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## Monitoring & Debugging

### Vercel Dashboard
- View deployment logs
- Check function execution
- Monitor performance
- View real-time logs

### Supabase Dashboard
- Monitor database usage
- View real-time connections
- Check API usage
- Review auth logs

## Scaling Considerations

### Supabase Free Tier Limits
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users
- Upgrade to Pro for more

### Vercel Free Tier Limits
- 100 GB bandwidth
- Unlimited websites
- Automatic SSL
- Upgrade to Pro for more

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Working
- Ensure they start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check spelling and formatting

### Supabase Connection Issues
- Verify Supabase project is active
- Check API keys are correct
- Ensure RLS policies are set up
- Test connection from Supabase dashboard

### 404 Errors
- Ensure all routes are in `/app` directory
- Check file naming conventions
- Verify dynamic routes work locally first

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Git-based Rollback
```bash
git revert HEAD
git push origin main
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## Success Metrics

After deployment, monitor:
- ✓ Page load time < 2 seconds
- ✓ Zero console errors
- ✓ All API routes responding
- ✓ Database queries < 100ms
- ✓ Real-time updates working
- ✓ Mobile responsiveness
- ✓ Sound effects loading

## Post-Launch Tasks

1. [ ] Set up monitoring alerts
2. [ ] Create backup strategy for database
3. [ ] Document any custom configurations
4. [ ] Share app URL with users
5. [ ] Monitor error logs
6. [ ] Gather user feedback
7. [ ] Plan feature updates

---

**Your app is now live! 🎉**

Share your Blackjack app and let players compete on the leaderboard!
