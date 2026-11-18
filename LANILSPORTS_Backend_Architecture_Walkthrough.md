# LANILSPORTS.COM — System Architecture & Backend Workflow Blueprint
**Louisiana High School Athlete Directory & NIL Intelligence Platform**  
*Confidential Operating Manual & Proprietary Blueprint*

---

## 1. High-Level System Overview & Tech Stack ($0 Operating Cost)

LANIL operates on a modern, decoupled cloud architecture designed to run on permanent $0 free tiers while scaling effortlessly to tens of thousands of daily visitors:

```
[ Data Ingestion Sources ] ──▶ [ GitHub Actions Cron (Weekly) ]
(MaxPreps, RSS, Rosters)               │
                                       ▼
                       [ Supabase PostgreSQL DB ]
                       (RLS Security, 64 Parishes, Auth)
                                       ▲
                                       │ Real-time API
                                       ▼
                       [ Cloudflare Pages Edge CDN ]
                       (Fast Global Delivery + WAF Bot Defense)
                                       │
                                       ▼
                       [ End Users & Mobile Browsers ]
                       (Athletes, Parents, Recruiters, Sponsors)
```

| Component | Technology | Cost Tier | Purpose |
| :--- | :--- | :--- | :--- |
| **Edge Hosting** | Cloudflare Pages | $0 (Free) | Global CDN, automated SSL, custom domain routing (`lanilsports.com`). |
| **Bot Defense / WAF** | Cloudflare Bot Fight Mode | $0 (Free) | Blocks automated scrapers, malicious scrapers, and competitors ripping data. |
| **Database** | Supabase (PostgreSQL) | $0 (Free) | Relational database, table schemas, Row-Level Security (RLS) policies. |
| **Automated Scrapers** | GitHub Actions | $0 (Free) | Autonomous cron runner (2,000 free minutes/mo) waking up every Tuesday at 6 AM. |
| **Object Storage** | Supabase Storage | $0 (Free) | 1 GB free bucket storage for athlete headshots and verified yearbook scans. |
| **Monetization Engine**| Stripe Checkout | $0 upfront | Pay-as-you-go merchant processing (2.9% + 30¢ only when you get paid). |

---

## 2. Step-by-Step Backend Data Pipeline

### Phase A: Automated Weekly Ingestion (Tuesdays at 6:00 AM CST)
1. **Trigger:** GitHub Actions triggers `.github/workflows/weekly_sync.yml` on a scheduled cron (`0 12 * * 2`).
2. **Fetch:** Node.js script connects to Louisiana regional news feeds (Google News RSS, *The Advocate, NOLA.com, The News-Star, The Shreveport Times*).
3. **Entity Extraction:** Matches keywords with LHSAA schools (e.g. *Neville, Edna Karr, Catholic High, Byrd, Westgate, Ouachita*).
4. **Deduplication Check:** Queries Supabase using composite key:
   $$\text{Match Key} = \text{LOWER(Full\_Name)} + \text{LOWER(School\_Name)}$$
   - **If Match Found:** Appends stats and news mentions to existing profile.
   - **If No Match:** Generates next unique `Player_ID` (`LA-[GradYear]-[Sequence]`) and creates a new profile.

### Phase B: Athlete Claiming & Self-Reporting Workflow
1. Athlete or parent clicks **"Athlete Portal"** on `lanilsports.com`.
2. Searches for their name or submits their high school information.
3. System logs parental consent verification (mandatory under Louisiana Act 810 / La. R.S. 17:3705 for minors under 18).
4. Record updates in Supabase: `claimed = TRUE`, `claimed_at = NOW()`.
5. Athlete uploads primary photo (compressed on client before upload to conserve free storage).

### Phase C: Freemium Paywall & Monetization Workflow
1. **Public Level (Free):** Basic directory, graduation class, primary sport, school, and teaser stats snapshot are open to search engines (Google SEO acquisition).
2. **Athlete Plus Level ($3.99/mo):** Unlocks up to 10 photos, custom biography, highlight video links (Hudl/YouTube embeds), and verified badge.
3. **Recruiter & Media Pro ($19.99/mo):** Gated profile intelligence (verified college offer tracker, historical performance progression, exportable CSV dossiers).
4. **Parish Sponsorship ($99.00/mo):** Local business banner placement at top of specific parish directories.

---

## 3. Intellectual Property (IP) Protection: Making LANIL Hard to Copy

Competitors and scrapers often try to copy successful directories. Here is how LANIL defends its data and builds an un-copyable competitive moat:

### Defense 1: Database Row-Level Security (RLS)
- Never expose the `service_role` key to the public frontend.
- RLS restricts the public `anon` key: visitors can only query public fields. Sensitive backend fields (contact info, internal verification notes, raw recruiter contact data) are strictly invisible.
- **Bulk Export Blocking:** The API enforces a maximum limit of 50 records per query with request throttles. Competitors cannot run a single script to dump your whole database.

### Defense 2: Cloudflare Bot Fight Mode (Edge Armor)
- By routing `lanilsports.com` through Cloudflare (free):
  - **Turn on Bot Fight Mode:** Cloudflare inspects browser fingerprints and automatically challenges or blocks automated headless scrapers (Puppeteer, Scrapy, Python requests, Selenium).
  - **Rate Limiting:** IP addresses making more than 60 requests per minute receive automated HTTP 429 rate limit blocks.

### Defense 3: Watermarked Shareable Player Cards
- Every generated 9:16 social card has a hardcoded, semi-transparent watermark: `Verified on LANILSPORTS.COM #LouisianaBuilt`.
- When athletes share this on Instagram and X, it markets your domain while preventing competitors from using your graphic assets.

### Defense 4: The Network Effect Moat (The Real Defense)
- Scrapers can only copy **stale, historical data**.
- A scraper **CANNOT copy**:
  - The hundreds of Louisiana athletes and parents actively logging into their LANIL profiles.
  - The direct relationships with Louisiana high school athletic directors.
  - The weekly community participation in the **Louisiana Athlete of the Week** voting engine.
  - The local parish business advertising relationships.

---

## 4. Disaster Recovery & Database Backup
1. **Automated Supabase Backups:** Included in the Supabase dashboard.
2. **Local Spreadsheet Mirror:** Keep an offline mirror in `LA_High_School_Yearbook_NIL_Directory_2026_2027.xlsx` as an immutable offline archive.