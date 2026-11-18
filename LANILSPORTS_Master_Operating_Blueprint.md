# LANILSPORTS.COM — MASTER OPERATING BLUEPRINT & SYSTEM SPECIFICATION
**Louisiana High School Sports Directory, Recruiting Intelligence & NIL Valuation Engine**  
*Official Version 2.0 | $0 Zero-Budget Production Architecture*

---

## 1. Executive Vision & Market Opportunity
**LANILSPORTS.COM (Louisiana NIL)** is the definitive, centralized sports information, digital yearbook, and NIL intelligence platform for Louisiana high school student-athletes across all 64 parishes.

While national recruiting networks (On3, 247Sports, Rivals) cater almost exclusively to the top 1-2% of five-star recruits, LANIL owns the **"98% Market Gap"**: the thousands of varsity student-athletes destined for D2, D3, NAIA, JUCO, or local commercial opportunities. LANIL combines athletic accomplishments, verified weekly statistics, recruiting milestones, and social media analytics into a unified public directory with subscription-based intelligence dossiers.

---

## 2. The $0 Cloud Architecture & Technical Stack
The platform operates permanently on free-tier cloud infrastructure, requiring $0 upfront software capital:

* **Edge Delivery & CDN:** Cloudflare Pages (Free) - Provides global edge caching, automated SSL encryption, and direct custom domain mapping for `lanilsports.com`.
* **Primary Database:** Supabase PostgreSQL (Free) - Relational database storing schools, parishes, athletes, and offers with strict Row-Level Security (RLS).
* **Automated Ingestion Cron:** GitHub Actions (Free) - Executes autonomous weekly data scraping workflows every Tuesday at 6:00 AM CST without hosting costs.
* **Media Storage:** Supabase Object Storage (Free) - Stores athlete profile headshots with automated client-side compression.
* **Monetization Gateway:** Stripe ($0 Upfront) - Merchant gateway charging standard transaction fees (2.9% + 30¢) only upon customer payments.

---

## 3. Master Database Schema (Columns A through Q)
The database models 17 standardized columns matching the Louisiana Yearbook Directory:
* **A: Player_ID** (Unique identifier, e.g. `LA-2027-0001`)
* **B: Player_Photo** (Headshot public URL or `=IMAGE` formula)
* **C: Full_Name** (Standardized First Last)
* **D: Grad_Year** (2027 Senior, 2028 Junior, 2029 Sophomore, 2030 Freshman)
* **E: Current_Grade** (Senior, Junior, Sophomore, Freshman)
* **F: High_School** (Official LHSAA school name)
* **G: Parish_City** (Parish and municipality classification)
* **H: Primary_Sport** (Football, Basketball, Baseball, Track, Softball)
* **I: Secondary_Sports** (Array of additional varsity sports)
* **J: Position** (QB, WR, PG, SS/RHP, etc.)
* **K: Season_Stats_Summary** (Condensed performance metrics)
* **L: Newspaper_Mentions** (JSON array of verified media articles)
* **M: Social_Handles** (Instagram, X, TikTok handles)
* **N: Total_Followers** (Sum of verified social audience)
* **O: Est_NIL_Value** (Calculated via LANIL dynamic valuation formula)
* **P: Potential_Colleges** (Reported and verified college offers)
* **Q: Last_Updated** (Timestamp of last automated data sync)

---

## 4. Complete 64 Louisiana Parishes Registry
LANIL covers every single one of Louisiana's 64 parishes, categorized into regional athletic sectors:
* **North Louisiana (19 Parishes):** Ouachita (Monroe), Caddo (Shreveport), Bossier, Lincoln (Ruston), Webster, Morehouse, Union, Claiborne, Bienville, Jackson, Caldwell, Franklin, Richland, Madison, East Carroll, West Carroll, Tensas, DeSoto, Winn.
* **Capital Area (9 Parishes):** East Baton Rouge, West Baton Rouge, Ascension, Livingston, Iberville, Pointe Coupee, East Feliciana, West Feliciana, St. Helena.
* **Greater New Orleans & River Parishes (7 Parishes):** Orleans, Jefferson, St. Bernard, Plaquemines, St. Charles, St. James, St. John the Baptist.
* **Acadiana & Bayou Region (11 Parishes):** Lafayette, Iberia, St. Martin, St. Mary, St. Landry, Vermilion, Acadia, Evangeline, Assumption, Lafourche, Terrebonne.
* **Central Louisiana (8 Parishes):** Rapides (Alexandria), Avoyelles, Grant, Natchitoches, Sabine, Vernon, Catahoula, Concordia, LaSalle.
* **Southwest Louisiana (5 Parishes):** Calcasieu (Lake Charles), Beauregard, Allen, Jefferson Davis, Cameron.
* **Florida Parishes (3 Parishes):** St. Tammany (Slidell/Mandeville), Tangipahoa (Hammond), Washington (Bogalusa).

---

## 5. The LANIL Mathematical NIL Valuation Engine
The platform features a proprietary, mathematically sound valuation formula that dynamically increases as weekly stats rise, factoring in real college collective benchmarks:

### Master Formula:
$$\text{Est\_NIL\_Value} = \Big[\Big(\text{Base} + C_{\text{college}}\Big) \times M_{\text{stats}} \times K_{\text{position}}\Big] + S_{\text{social}} + B_{\text{multisport}}$$

### Component Breakdown:
1. **College Recruiting Benchmark ($C_{\text{college}}$):**
   * Tier 1 (Power 4 / SEC e.g. LSU, Alabama, Texas A&M): **+$1,500** per verified offer
   * Tier 2 (Regional FBS e.g. Tulane, La Tech, ULL, ULM): **+$600** per verified offer
   * Tier 3 (FCS / D2 e.g. McNeese, Nicholls, Southern, Grambling): **+$250** per verified offer
2. **Weekly Stat Multiplier ($M_{\text{stats}}$):**
   Scales dynamically from 1.0x to 2.2x based on cumulative seasonal output (passing yards, touchdowns, tackles, points, rebounds).
3. **Position Scarcity Coefficient ($K_{\text{position}}$):**
   * QB & Scoring PG: **1.35x**
   * WR, Edge Rusher, Pitcher, SS: **1.15x**
   * RB & Center: **1.00x**
   * Linemen & Defensive Backs: **0.90x**
   * Specialists: **0.75x**
4. **Social Reach Value ($S_{\text{social}}$):**
   $(\text{Instagram} \times \$0.15) + (\text{TikTok} \times \$0.08) + (\text{X} \times \$0.10)$
5. **Multi-Sport Bonus ($B_{\text{multisport}}$):**
   **+$300** for athletes competing in multiple varsity sports.

### Ready-to-Use Spreadsheet Formula (Column O):
```excel
=MAX(150, ROUND((250 + IF(ISBLANK(P2), 0, COUNTA(SPLIT(P2, ",")) * 650)) * (1 + MIN(1, IF(ISBLANK(K2), 0, 0.25))) * IF(REGEXMATCH(UPPER(J2), "QB|PG"), 1.35, IF(REGEXMATCH(UPPER(J2), "WR|DE|SS|RHP"), 1.15, 1.0)) + (N2 * 0.12) + IF(ISBLANK(I2), 0, 300), 0))
```

---

## 6. Monetization Architecture & Financial Targets
* **Tier 1: LANIL Athlete Plus ($3.99/month):**
  Targeted at athletes and parents. Unlocks up to 10 photos, custom biography, highlight video embeds (Hudl/YouTube), verified badge, and 9:16 social card generator.
* **Tier 2: Recruiter & Media Pro ($19.99/month):**
  Targeted at college scouts, high school coaches, and sports journalists. Unlocks complete athlete dossiers, verified offer tracking, and exportable CSV reports.
* **Tier 3: Parish Sponsorship ($99.00/month per parish):**
  Targeted at Louisiana local businesses (car dealerships, restaurants, injury law firms). Grants header banner placement across all athletes in that parish.

### Recurring Revenue Projections:
* **Early Platform:** 150 Athlete Plus ($598) + 20 Pro ($399) + 5 Sponsors ($495) = **$1,492 / month**
* **Growing Platform:** 600 Athlete Plus ($2,394) + 80 Pro ($1,599) + 25 Sponsors ($2,475) = **$6,468 / month**
* **Established Statewide:** 1,500 Athlete Plus ($5,985) + 200 Pro ($3,998) + 64 Parish Sponsors ($6,336) = **$16,319 / month ($195,828 annually)**.

---

## 7. Intellectual Property & Anti-Scraping Defense Moat
To ensure LANIL cannot be easily copied by competitors or scraped by automated bots, five defensive layers are active:
1. **PostgreSQL Row-Level Security (RLS):** Public API keys can only query sanitized marketing fields. Private contact details and internal recruiter dossiers are locked behind database-level policies.
2. **Cloudflare Bot Fight Mode:** Edge Web Application Firewall inspects incoming browser fingerprints and automatically blocks headless browsers (Puppeteer, Scrapy, Selenium, Python requests).
3. **Anti-Framing Protection:** HTTP headers enforce `X-Frame-Options: DENY` to prevent third-party sites from embedding LANIL inside an iframe.
4. **Cryptographic Watermarking:** All generated 9:16 social cards carry an embedded `#LouisianaBuilt LANILSPORTS` watermark.
5. **The Un-Copyable Network Moat:** Competitors can scrape static text once, but cannot duplicate weekly fan voting traffic, claimed athlete self-reporting, or established relationships with Louisiana athletic directors.

---

## 8. Louisiana Legal Compliance (Act 810 / La. R.S. 17:3705)
* **Minor Protection:** Mandatory written parental or guardian consent recorded before any commercial profile goes live for an athlete under 18.
* **School IP Separation:** Prohibits student-athletes from wearing official school uniforms or displaying LHSAA logos in commercial endorsements without written school permission.
* **Prohibited Endorsement Categories:** Strict prohibition against alcohol, tobacco, vaping, adult entertainment, firearms, and sports gambling.
* **Platform Scope:** LANIL operates strictly as an independent sports directory and media index, eliminating athlete-agent licensing liabilities under Louisiana law.