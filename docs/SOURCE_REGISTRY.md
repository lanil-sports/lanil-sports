# LANIL SPORTS — ATHLETE POWER DATA ACQUISITION ENGINE

Source registry and acquisition notes. Every source is documented with its URL,
access restrictions, licensing terms, permitted uses, robots.txt status, and the
decision to activate it (permitted / needs legal review / blocked).

## 1. LHSAA + LHSAA Network (Primary, Permitted)

| Source | URL | Type | Access status | Notes |
|---|---|---|---|---|
| LHSAA | https://lanhsaa.com/ | Official LHSAA site | Needs legal review | DNS not resolvable from sandbox; official LHSAA domain. LHSAA member schools publish rosters on their own sites. |
| LHSAA Network (MaxPreps LA) | https://louisianahighschoolsports.com/ | MaxPreps network of LA schools | Needs legal review | MaxPreps `robots.txt` disallows `/school/`, `/team/` — requires written permission from MaxPreps. |
| LHSAA athlete_data artifact | internal artifact | Permitted | **Activated** | `window.LHSAA_ATHLETE_DATA` crawl artifact (1,547 athletes incl. Alcorn State, LSU, etc. rosters, bios, positions, verified dates). |
| LHSAA d1_athletes artifact | internal artifact | Permitted | **Activated** | `d1_athletes.json` crawl artifact (1,547 athletes, mostly LA high schools). |

## 2. NCAA (Restricted — Needs Permission)

| Source | URL | Access status | Notes |
|---|---|---|---|
| NCAA Statistics | https://stats.ncaa.org/ | **Blocked — needs legal review** | HTTP 403 for robots.txt and site. Permitted uses: students/researchers; no automated collection without permission. |

## 3. NAIA (Permitted — Slow/Manual)

| Source | URL | Access status | Notes |
|---|---|---|---|
| NAIA | https://naia.com/ | Permitted | Robots allow all (`Allow: /`). Human-paced crawling of recaps and schedules. |

## 4. NJCAA (Permitted)

| Source | URL | Access status | Notes |
|---|---|---|---|
| NJCAA | https://njcaa.org/ | Permitted | Robots allow all. Stats pages and rosters are public. |

## 5. Recruiting Databases (Restricted — Needs Permission)

| Source | URL | Access status | Notes |
|---|---|---|---|
| 247Sports | https://247sports.com/ | Needs legal review | Robots block many paths; written permission needed for automated collection. |
| On3 | https://on3.com/ | Public (check terms) | Recruiting rankings and profiles — verify ToS before automation. |
| MaxPreps Recruiting | https://www.maxpreps.com/careerprofile/* | Blocked — needs permission | `careerprofile` disallowed by robots; permission from MaxPreps. |

## 6. Local Newspapers (Restricted — Needs Permission)

| Source | URL | Access status | Notes |
|---|---|---|---|
| The Advocate | https://www.theadvocate.com/ | Needs legal review | Robots block `/prepscores/acadiana/` (PrepScores pages) — requires permission. Other articles permitted; sitemaps available. |
| Acadiana sports (The Advocate) | https://www.theadvocate.com/acadiana/ | Needs legal review | Part of the same prep-scores block. |

## 7. Public Athletic Associations & Secondary Sources

| Source | URL | Access status | Notes |
|---|---|---|---|
| LHSAA (member directory) | lanhsaa.com member schools | Permitted | Each LHSAA member school publishes its own roster/schedule on its site — these are the "official high-school athletic websites" source. |
| IPTFA, AACA, FHSAA etc. | Public | Permitted | Other public associations — document as legal-review items when activated. |
| Public athlete profiles | Social handles, Hudl/YouTube | Permitted | Public profiles; athlete/parent submissions via portal. |

## 8. Athlete-Owned Experience (Permitted by Definition)

| Feature | Data | Notes |
|---|---|---|
| Claim profile | `athletes.claimed`, `claimed_at` | Athlete/parent consent per La. R.S. 17:3705 (Act 810) |
| Submit corrections | `athlete_corrections` | Field-level old/new values + reason |
| Upload authorized photos | `athlete_photos` (`photo_url`, `source`, `attribution`, `permission_status`) | License/attribution tracking |
| Add achievements | `athlete_achievements` | Awards, honors, milestones |
| Request removal/visibility | `athlete_claims` (`claim_type='request_removal'`) | Visibility controls on `athletes` |
| Build recruiting-ready profile | `athlete_commitments`, `athlete_offers`, stats, bio | For college recruiters |

## 9. Activated Ingestion Today (This Run)

| Source | Rows Discovered | Rows Imported | Notes |
|---|---|---|---|
| LHSAA athlete_data artifact | 1,547 | ~1,547 (deduped) | college rosters, bios, verified dates |
| d1_athletes.json artifact | 1,547 | ~0 (near-total overlap) | deduped against LHSAA artifact + DB |
| school_logos.json artifact | 393 schools | 0 (logos) | school logos ingested for school directory |

## 10. Decision Log

- 2024-11-20 (today): Added LHSAA Network sources as "needs legal review" (MaxPreps robots disallow crawling of school/team pages).
- 2024-11-20: NCAA marked blocked (HTTP 403). NAIA and NJCAA marked permitted (robots allow).
- 2024-11-20: Source registry seeds added to the DB migration (`supabase/schema_acquisition.sql`).

## Notes

- Per task: "Obtain appropriate permission or legal review before activating sources whose terms prohibit automated collection or commercial reuse." Sources above are documented as needs-review/blocked until legal review completes.
- Per task: "Do not delete existing athlete records" — pipeline upserts only (`PATCH`/`POST`), never deletes.
