# Kynnect Deployment Guide

Your app is now configured for deployment to **kynnect.net** with PWA support!

## 🚀 Step 1: Deploy to Vercel

### 1.1 Create GitHub Repository (if you haven't already)
```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kynnect.git
git push -u origin main
```

### 1.2 Deploy with Vercel
1. Go to **https://vercel.com** and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Click **"Deploy"**

### 1.3 Connect Your Custom Domain
1. In Vercel project settings, go to **"Domains"**
2. Add: `kynnect.net` and `www.kynnect.net`
3. Vercel will show you DNS records to add
4. Go to your domain registrar and add these DNS records:
   - Type: `A` Record | Name: `@` | Value: `76.76.19.19`
   - Type: `CNAME` | Name: `www` | Value: `cname.vercel-dns.com`
5. Wait 24-48 hours for DNS propagation

## 🔐 Step 2: Update Supabase URLs

Go to: **https://supabase.com/dashboard/project/pklbyhofafkpnrazhifo/auth/url-configuration**

### Update Site URL:
```
https://kynnect.net
```

### Update Redirect URLs (click "Add URL" for each):
```
https://kynnect.net/reset-password
https://www.kynnect.net/reset-password
```

Click **"Save"** - Now your password reset emails will work!

## 📱 Step 3: PWA Setup (Already Done!)

✅ PWA is configured and ready! Your app will:
- Be installable on mobile devices
- Work offline (basic functionality)
- Have a native app feel

### Add App Icons (IMPORTANT):
1. Create two PNG icons from your logo:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
2. Place them in `/public` folder
3. See `/public/ICONS_README.md` for details

## 🧪 Step 4: Test Your Deployment

Once deployed:
1. Visit **https://kynnect.net**
2. Test password reset (should work now!)
3. On mobile (iOS/Android):
   - Visit kynnect.net in Safari/Chrome
   - Tap "Share" → "Add to Home Screen"
   - Your app installs like a native app!

## 📊 What's Deployed:

✅ Vercel configuration (`vercel.json`)
✅ PWA manifest (`public/manifest.json`)
✅ Service worker (`public/service-worker.js`)
✅ Index.html with PWA meta tags
✅ Main entry point (`src/main.tsx`)
✅ Git ignore file

## 🔄 Future Deploys:

Every time you push to GitHub `main` branch, Vercel automatically redeploys!

```bash
git add .
git commit -m "Your update message"
git push
```

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Domain Setup: https://vercel.com/docs/concepts/projects/domains
- PWA Checklist: https://web.dev/pwa-checklist/

---

**Ready to go live? Start with Step 1!** 🎉
