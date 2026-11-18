# LANILSPORTS.COM | Louisiana High School Athlete Directory & NIL Platform

Welcome to **LANILSPORTS.COM** (Louisiana NIL) — the high school sports directory, digital yearbook, recruiting intelligence, and NIL brand portfolio platform for Louisiana student-athletes.

---

## 📁 Repository Structure
```
lanil-sports/
├── index.html            # Main web application (mobile-responsive, Tailwind, Teko athletic font)
├── data.js               # Initial Louisiana Class of 2027-2030 seed data
├── app.js                # Core app logic (Directory, Drawer, Fan Poll, Rankings, Card Generator)
├── supabase/
│   └── schema.sql        # Ready-to-run PostgreSQL schema for Supabase (RLS & seed included)
└── README.md             # This guide
```

---

## 🚀 Live Features Implemented

1. **Searchable Athlete Directory:**
   - Filter by **Graduation Year** (Class of 2027 Seniors, 2028 Juniors, 2029 Sophomores, 2030 Freshmen).
   - Filter by **Sport** (Football, Basketball, Baseball, Track & Field, Softball).
   - Filter by **Parish/Region** (Ouachita/Monroe, Orleans/NOLA, East Baton Rouge, Caddo/Shreveport, Iberia).
   - Instant search across athlete name, school, and position.

2. **Dossier & Freemium Paywall Preview:**
   - Public view: Athlete photo, verified school, position, season statistics snapshot, and newspaper coverage.
   - Paywalled intelligence teaser: Estimated annual NIL valuation, verified college offers, and social engagement breakdown.
   - Interactive preview button to test the unlocked state.

3. **Athlete & Parent Claim Portal:**
   - Athletes or parents can claim an existing profile or submit a new profile.
   - Built-in compliance disclaimer adhering to **Louisiana Act 810 (La. R.S. 17:3705)** for minors.

4. **Louisiana Athlete of the Week (Viral Fan Voting):**
   - Live interactive fan poll with real-time percentage bars and vote counters.
   - Proven viral mechanism to drive thousands of free visitors and parents to `lanilsports.com`.

5. **Shareable 9:16 Digital Player Card Generator:**
   - Generates an Instagram Story / X card with the athlete's photo, school, stats, and a **"Verified on LANILSPORTS.COM"** badge.

6. **Monetization Blueprint:**
   - **LANIL Athlete Plus ($3.99/mo):** Up to 10 photos, custom bio, highlight links, verified badge, and analytics.
   - **Recruiter & Media Pro ($19.99/mo):** Full database access, historical tracking, and exportable dossiers.
   - **Parish Sponsorship ($99.00/mo):** Hyperlocal advertising banners for Louisiana businesses.

---

## 🛠️ $0 Budget Setup & Deployment Guide

### Step 1: Set Up Your Free Database (Supabase)
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `lanil-sports`.
3. In the left navigation, click on **SQL Editor**.
4. Open `supabase/schema.sql`, copy all contents, and click **Run**.
5. Your database will be created with `athletes`, `schools`, `parishes`, `athlete_offers`, and `fan_votes` tables, pre-populated with initial Louisiana prospects!

### Step 2: Deploy Free to Cloudflare Pages (or Vercel)
1. Go to [github.com](https://github.com) and create a free repository named `lanil-sports`.
2. Push or upload the files from this folder (`index.html`, `data.js`, `app.js`).
3. Go to [pages.cloudflare.com](https://pages.cloudflare.com) (or [vercel.com](https://vercel.com)) and connect your GitHub repository.
4. Framework preset: **None / Static HTML**.
5. Click **Deploy**. Your site will be live instantly on a free `.pages.dev` URL!

### Step 3: Connect Your Domain (`lanilsports.com`)
1. In Cloudflare Pages, go to **Custom Domains** -> **Set up a custom domain**.
2. Enter `lanilsports.com` (and `www.lanilsports.com`).
3. Follow the DNS instructions to point your domain registrar to Cloudflare.
4. Cloudflare provides free automated SSL/HTTPS.

---

## ⚖️ Louisiana NIL Compliance Checklist (La. R.S. 17:3705)
- **Minor Parental Consent:** Any student under 18 must have parent/guardian approval before commercial NIL agreements are finalized.
- **No School IP Without Permission:** Athletes cannot wear school uniforms or display official LHSAA member logos in paid commercial endorsements without explicit written authorization from the school principal/athletic director.
- **Prohibited Categories:** Alcohol, tobacco, vaping, cannabis, sports gambling, weapons, and adult entertainment.
- **Independent Discovery:** LANIL acts as an informational directory and media platform, not an athlete agent or broker.