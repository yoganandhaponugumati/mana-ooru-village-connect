# ManaOoru — India's Digital Village Operating System
### Complete Product Review, Architecture, and Roadmap
*Prepared against the live codebase (`mana-ooru-village-connect`, TanStack Start + React 19 + Supabase) and live deployment.*

---

## 0. Reality Check (read this first)

The original brief asks for the equivalent of a funded startup's first 6–12 months of work: 60+ modules, full RLS schema, 17 distinct roles, a business model, a 1→100,000 village growth plan, and 100 individually-scoped improvements. That is real, valuable work — and it's scoped here honestly rather than padded with generic filler:

- **What's fully real and usable now:** the audit, the architecture decisions, the database schema additions (already migrated into your actual `supabase/migrations/` folder), the security model, and the prioritized backlog.
- **What's directional, not literal:** the "700,000 villages" business/growth numbers are planning assumptions for you to pressure-test with real users, not verified projections.
- **What still needs building, module by module:** UI for schemes/blood-donors/polls (schema now exists — see §5), and the remaining ~45 lower-priority modules. Trying to hand-wave working code for 60 modules in one pass would produce unusable scaffolding — better to build them for real, one at a time, off this backlog.

---

## 1. Product Review

### 1.1 Current Strengths
- Real Supabase auth (email/password, Google OAuth, email magic link, phone OTP), RLS-secured from day one — not a demo/mock backend.
- Clean 3-tier role model (`super_admin` / `village_admin` / `citizen`) with a DB trigger (`protect_profile_role_changes`) that stops users from self-promoting their own role — a real privilege-escalation guard most village apps skip.
- Working core modules: Workers, Land, Marketplace, Services, Problems/Complaints (with photo upload), Announcements, Weather, AI Assistant, Profile.
- Telugu-first UX with an actual village cascading-location picker (State → District → Mandal → Village), not a generic country dropdown.
- Design system (`design-system.tsx`) with reusable `SurfaceCard`, `SectionHeader`, `FeatureIcon` — real component discipline, not copy-pasted markup everywhere.

### 1.2 Current Weaknesses
- Trust/consistency gap: marketing copy (hero stats) didn't match real data (fixed in the previous pass — see prior turn).
- No seed/demo data strategy for a pre-launch village — every list looks empty, which reads as "broken" to a first-time visitor rather than "new."
- Several nav destinations point to the wrong page (Agriculture/Government/Health/Education all reuse Schemes/Emergency/Announcements pages).
- No moderation, reporting, or spam controls on any user-generated content (listings, complaints, comments).

### 1.3 Missing Features (from the original module list, prioritized — full list in §7)
Government Schemes UI, Blood Donors, Gram Sabha/Polls, Village Budget tracker (**schema now added**, UI pending), Birth/Death registration, Property records, Tourism, Digital Library, SHGs/Youth Groups/Senior Citizens directories, subscriptions/premium listings, push notifications, offline mode.

### 1.4 UI Problems
- Dark mode used generic shadcn colors, not brand green (**fixed**).
- Category cards used identical placeholder copy (**fixed**).
- No visual distinction between "verified" and "unverified" listings — trust signal missing.

### 1.5 UX Problems
- Phone OTP had no code-entry step — a genuine dead-end flow (**fixed**).
- No onboarding flow explaining what a new, empty village should do first.
- Search (`/search`) has a router type error suggesting the search flow isn't fully wired to real query params yet.

### 1.6 Performance Problems
- `useListingStats()` fires 5 separate Supabase queries in parallel on every homepage load (`Promise.all`) — fine at low volume, but should move to a single Postgres RPC/view once traffic grows, to cut round trips from 5 to 1.
- No pagination cursor on marketplace/workers lists yet — `limit()`-only queries won't scale past a few thousand rows per village.
- No image CDN/resizing pipeline — Supabase Storage serves original uploads directly; large phone photos will slow mobile load times, which matters most for your actual user base.

### 1.7 Security Problems
- Google OAuth and Phone OTP need explicit provider setup in the Supabase dashboard (can't be fixed from code) — verify both are enabled with correct redirect URLs before relying on them.
- No rate limiting on listing creation, complaint submission, or poll voting at the application layer (Supabase has some built-in abuse protection, but repeated fake listings/votes aren't blocked yet).
- No content moderation (profanity, spam link detection) on any free-text field.
- No audit log table — admin actions (role changes, complaint status changes) aren't currently tracked with a who/when record.

### 1.8 Scalability Problems
- Single `listings` table serves Workers, Land, Marketplace, and Services via a `type` discriminator — fine up to tens of thousands of rows, but will need per-type indexes and eventually table partitioning by `village_id` at true multi-district scale.
- No caching layer (Redis) for hot reads like village weather or scheme listings.

### 1.9 Database Problems
- `village-preferences.ts` has TypeScript `any`-indexing on the state/district/mandal lookup object — works at runtime, but typos in village names won't be caught at compile time.
- No `audit_logs` or `activity_logs` table yet (see §5.5 for the design).

### 1.10 Future Problems
- 17-role model from the brief (Sarpanch, Ward Member, NGO, Volunteer, etc.) doesn't map cleanly onto Postgres RLS if implemented as 17 separate roles — recommended architecture below (§2) solves this before it becomes a migration headache.
- Multi-village growth will eventually need a `district_admin` tier between `village_admin` and `super_admin` — the schema's `app_role` enum can add this later without breaking existing RLS policies, but plan the policy updates now rather than retrofitting under load.

---

## 2. Roles: The Real Architecture (not 17 DB roles)

The brief lists 17 roles (Super Admin, District Admin, Mandal Admin, Village Admin, Sarpanch, Ward Member, Farmer, Worker, Business Owner, Teacher, Doctor, Student, Volunteer, NGO, Citizen, Guest). Implementing all 17 as literal Postgres roles/RLS branches creates a combinatorial mess — every policy would need 17-way `CASE` logic.

**Recommended split (already partially built):**

| Concept | Purpose | Where it lives |
|---|---|---|
| **`role`** (permission tier) | Controls *what you can do*: read, write, moderate, administer | `profiles.role` enum: `citizen`, `village_admin`, `super_admin` (add `district_admin` later) |
| **`occupation`** (identity tag) | Controls *what content is relevant to you*: Farmer sees crop prices, Doctor sees health-center tools | `profiles.occupation` — already exists, extend the CHECK constraint list to add Business Owner, NGO, Volunteer, etc. |
| **`badges`** (elected/verified status) | Sarpanch, Ward Member, NGO-verified — a trust signal, not a permission | New lightweight `profile_badges` table: `profile_id`, `badge`, `verified_by`, `verified_at` |

This gives you all 17 "roles" from the brief as a combination of tier + tag + badge, with RLS policies that only ever check 2–3 permission tiers — much easier to secure and reason about at scale. Guest = unauthenticated (`anon` role, already granted read access in your existing migrations).

---

## 3. Module Specifications

Full purpose/features/DB/workflow detail for the highest-priority modules; remaining modules summarized in the table that follows.

### 3.1 Government Schemes *(schema shipped this pass)*
- **Purpose:** Surface state/central schemes relevant to the village; let citizens apply and track status.
- **Tables:** `government_schemes`, `scheme_applications` (see migration `20260708120000_schemes_blood_polls_budget.sql`).
- **Workflow:** Admin publishes scheme → citizen applies → admin reviews (`submitted → under_review → approved/rejected`) → notification fires on status change (reuse existing `notifications` table).
- **Next step:** Build `/schemes` list + application form UI against the new tables (currently `/schemes` route exists but isn't wired to `government_schemes`).

### 3.2 Blood Donors *(schema shipped this pass)*
- **Purpose:** Emergency blood-group lookup by village.
- **Table:** `blood_donors` — public read (life-saving info shouldn't be gated), self/admin write.
- **Next step:** Simple filterable directory page + "I'm available" toggle on the donor's own profile.

### 3.3 Gram Sabha / Village Polls *(schema shipped this pass)*
- **Purpose:** Digitize village meetings and community decisions.
- **Tables:** `village_polls`, `poll_votes` — one vote per citizen per poll, enforced by a DB `UNIQUE` constraint (not just app logic, so it can't be bypassed).
- **Next step:** Poll creation form (admin) + vote UI with live result bar chart (recharts is already a dependency).

### 3.4 Village Budget / Development Tracker *(schema shipped this pass)*
- **Purpose:** Public transparency on allocated vs. spent funds per project.
- **Table:** `village_budget_items`, optionally linked to existing `government_works`.
- **Next step:** Budget dashboard with allocated-vs-spent bar chart per fiscal year.

### 3.5 Marketplace, Workers, Land, Services, Problems, Announcements, Weather, AI Assistant, Profile
Already built and functioning — see §1 for specific fixes already applied and remaining polish items in the backlog (§7).

### 3.6 Remaining Modules (compact spec table)

| Module | Priority | Core Tables Needed | Notes |
|---|---|---|---|
| Birth/Death Registration | High | `civil_registrations` (type, applicant_id, status, certificate_url) | Needs document upload + admin approval workflow, similar pattern to `scheme_applications` |
| Property Records | Medium | `property_records` (owner_id, survey_no, extent, document_url) | Sensitive — needs stricter RLS (owner + admin only, not public) |
| SHGs / Youth Groups / Senior Citizens | Medium | `community_groups`, `group_members` | Directory + membership pattern |
| Digital Library | Medium | `library_resources` (title, subject, file_url, grade_level) | Storage-bucket-backed, public read |
| Tourism / Village Gallery | Low | `gallery_items` (image_url, caption, category) | Simple CMS-style table |
| Lost & Found | Low | Extend `listings.type` with `'lost_found'` | Reuses existing listings infra — cheap to add |
| Crop/Milk/Fertilizer Prices | Medium | `market_prices` (commodity, price, unit, village_id, recorded_at) | Consider sourcing from a government price API rather than manual entry |
| NGO / CSR Portal | Low | `ngo_profiles`, `csr_campaigns` | Needs its own verification workflow before launch |
| Digital Payments (UPI/QR) | High (revenue-critical) | Integrate Razorpay/Cashfree — do **not** build custom payment handling | See §6 business model |
| Push Notifications | High | Web Push via existing `notifications` table + service worker | High leverage, moderate effort |
| Offline Mode | Low | Service worker + IndexedDB cache of last-viewed data | Real engineering investment; defer to Phase 3+ |

---

## 4. UI/UX Redesign Direction

Already applied: brand-consistent dark mode, honest data-driven stats, per-category descriptions, working phone OTP.

**Next visual priorities, in order:**
1. Empty-state illustrations (not just text) for every list that can be zero — turns "looks broken" into "looks new and inviting."
2. A verified badge (checkmark) on listings from `village_admin`-confirmed users, using the badge table from §2.
3. Skeleton loading states on the stats/listings queries (currently likely flashes blank while `useQuery` resolves).
4. Consistent empty/loading/error states as a shared component, not re-implemented per page.

---

## 5. Database

### 5.1 Current Schema (already live)
`profiles`, `user_roles`, `villages`, `listings`, `products`, `jobs`, `complaints`, `complaint_images`, `announcements`, `government_works`, `government_work_images`, `notifications`, `events`, `comments`, `likes`.

### 5.2 Added This Pass
`government_schemes`, `scheme_applications`, `blood_donors`, `village_polls`, `poll_votes`, `village_budget_items` — full RLS, indexes, and grants included in the migration file, following your existing conventions exactly.

### 5.3 Entity Relationships (core)

```
villages 1---* profiles
profiles 1---* listings (owner_id)
profiles 1---* complaints (citizen_id)
profiles 1---* government_schemes (created_by, admin only)
government_schemes 1---* scheme_applications *---1 profiles (applicant)
villages 1---* village_polls 1---* poll_votes *---1 profiles (voter, unique per poll)
villages 1---* village_budget_items *---0..1 government_works
profiles 1---0..1 blood_donors
```

### 5.4 Storage
Existing buckets (`profile-images`, `complaints`, `government-works`, `products`, `events`, `documents`) already cover the new modules — scheme documents and civil-registration certificates can reuse the private `documents` bucket without new bucket policies.

### 5.5 Recommended Next Migration: Audit Logs

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,           -- e.g. 'role_changed', 'complaint_resolved'
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Admin-only SELECT, service_role-only INSERT (write via triggers, not client)
```
This closes the "no audit trail on admin actions" gap flagged in §1.7.

---

## 6. Security

| Control | Status |
|---|---|
| Phone OTP + verification | Fixed this pass |
| Google OAuth | Code-ready; needs provider enabled in Supabase dashboard |
| Row Level Security | Enabled on every table, including new ones |
| Role self-escalation protection | Enforced via DB trigger, not just app logic |
| Rate limiting | **Gap** — add via Supabase Edge Function or a `rate_limits` table keyed by `(user_id, action, window)` |
| Content moderation | **Gap** — start with a simple banned-word filter + admin flag/hide before investing in ML moderation |
| Audit logging | **Gap** — design provided in §5.5 |
| Image validation | Partial — MIME type + size limits exist on storage buckets; add virus/NSFW scanning before public launch if budget allows |

---

## 7. Business Model

Realistic revenue paths for a village platform, ranked by how soon they can actually generate income:

1. **Government partnerships** (fastest path to real revenue): Panchayati Raj departments often have digitization budgets — position ManaOoru as a ready-made Gram Sabha/complaints/budget-transparency tool, not a marketplace.
2. **Premium/verified business listings**: local shops pay a small monthly fee for a "Verified" badge + top placement in Services/Marketplace.
3. **Marketplace commission**: percentage on completed Land/Product transactions once a payment gateway is integrated — needs trust/volume first, so sequence this after #1–2.
4. **CSR partnerships**: NGOs/corporates sponsor specific modules (e.g. "Scholarships powered by X Foundation") — pairs naturally with the NGO Portal module.
5. **Digital certificate processing fee**: small convenience fee for birth/death/property certificate applications routed through the platform (only after that module is legally validated with local authorities — this touches real government records, so get that sign-off before charging for it).

**Not recommended early:** broad advertising — a village audience is small per-node, so ad revenue won't be meaningful until you have real scale across hundreds of villages, and ads erode trust exactly when you need it most (early adoption).

---

## 8. Growth Strategy

| Stage | Focus | What actually needs to be true |
|---|---|---|
| 1 village | Prove it works | Onboard your own village first — you need real complaints, real listings, real Sarpanch buy-in, not synthetic demo data |
| 10 villages | Prove it repeats | Manually onboard via personal/local government contacts; every village needs a local "champion" (often the Ward Member or a tech-comfortable youth) who seeds first content |
| 100 villages | Prove it's operable | You now need `district_admin` tier (§2), self-serve village onboarding, and support process — this is where a support/CSR budget starts mattering |
| 1,000 villages | Prove it's fundable | This is the stage investors/government partners take seriously; needs retention data, not just signup counts |
| 10,000+ villages | Infrastructure phase | Requires the scalability work in §1.8 (partitioning, caching, CDN) — premature before this stage |
| 100,000+ villages | National infrastructure | Realistically requires a government MoU or major distribution partner (telecom, Common Service Centres/CSC network) — not achievable by product growth alone |

Be skeptical of any plan that treats village count as a pure product-growth metric — in practice this kind of platform scales through **local trust and government partnership**, not virality.

---

## 9. Roadmap

- **Phase 1 (MVP — where you are now):** Core listings, auth, complaints, announcements. ✅ Mostly done.
- **Phase 2 (Trust & Transparency):** Schemes, Blood Donors, Polls, Budget tracker (schema done this pass) + verified badges + audit logs.
- **Phase 3 (Community Depth):** SHGs/Youth/Senior groups, Digital Library, Lost & Found, Market prices.
- **Phase 4 (Monetization):** Payment gateway integration, premium listings, government partnership pilot.
- **Phase 5 (Scale Infrastructure):** Caching, CDN, table partitioning, district_admin tier, self-serve village onboarding.

---

## 10. Prioritized Improvement Backlog

Ranked realistically — Priority 1 items are what actually blocks trust or basic function today; lower tiers are genuine value but shouldn't come before the tier above them.

### Tier 1 — Fix before real users arrive (Priority: Critical)
| # | Item | Difficulty | Est. Time | Impact |
|---|---|---|---|---|
| 1 | Verify Google OAuth provider + redirect URLs in Supabase dashboard | Low | 30 min | Unblocks a core sign-in path |
| 2 | Verify Phone/SMS provider enabled in Supabase (code now supports it) | Low | 30 min | Unblocks phone sign-in entirely |
| 3 | Fix Agriculture/Government/Health/Education nav links to real dedicated pages | Medium | 1–2 days | Removes "broken nav" feeling |
| 4 | Seed each new village with a welcome announcement + emergency contacts on creation | Low | 2–3 hrs | Turns "empty" into "new," not "broken" |
| 5 | Add empty-state illustrations across all list views | Low | 1 day | Visual polish, cheap win |
| 6 | Fix `/search` route missing required `search` param (TS error found in audit) | Low | 1–2 hrs | Prevents a runtime crash on that link |
| 7 | Add skeleton loaders to stats/listings queries | Low | 3–4 hrs | Removes blank-flash on load |
| 8 | Basic profanity/spam filter on listings, complaints, comments | Medium | 1–2 days | Baseline moderation before public launch |
| 9 | Rate limit listing/complaint/vote creation | Medium | 1–2 days | Prevents basic abuse |
| 10 | Add `audit_logs` table + triggers on role/status changes (design in §5.5) | Medium | 1 day | Accountability for admin actions |

### Tier 2 — Ship the schema-ready modules (Priority: High)
| # | Item | Difficulty | Est. Time | Impact |
|---|---|---|---|---|
| 11 | Build `/schemes` UI against `government_schemes` + `scheme_applications` | Medium | 2–3 days | Real government-facing feature |
| 12 | Build Blood Donors directory page | Low | 1 day | High goodwill, low effort |
| 13 | Build Gram Sabha polls UI + result charts | Medium | 2–3 days | Strong differentiator vs. generic village sites |
| 14 | Build Village Budget transparency dashboard | Medium | 2 days | Trust-building, government-partnership friendly |
| 15 | Verified badge system (`profile_badges` table + UI) | Medium | 1–2 days | Trust signal across all modules |
| 16 | Web Push notifications (service worker + existing `notifications` table) | Medium | 2–3 days | Re-engagement without native app |
| 17 | Birth/Death registration application flow | High | 3–5 days | High value, needs legal/process validation first |
| 18 | Lost & Found (extend `listings.type`) | Low | 1 day | Cheap, reuses existing infra |
| 19 | Crop/Milk/Fertilizer price board | Medium | 2 days | Consider government API source, not manual entry |
| 20 | Digital Library (storage-backed resource list) | Low | 1–2 days | Straightforward CMS pattern |

### Tier 3 — Community & monetization foundation (Priority: Medium)
| # | Item | Difficulty | Est. Time | Impact |
|---|---|---|---|---|
| 21 | SHG / Youth Group / Senior Citizen directories | Medium | 2–3 days | Community depth |
| 22 | Property records module (strict RLS — owner+admin only) | High | 3–4 days | Sensitive data, needs careful design |
| 23 | Payment gateway integration (Razorpay/Cashfree) | High | 1–2 weeks | Unlocks commission + premium listing revenue |
| 24 | Premium/verified business listing tier | Medium | 3–4 days | First real revenue feature |
| 25 | Tourism / Village Gallery | Low | 1–2 days | Low priority but cheap |
| 26 | NGO/CSR portal with verification workflow | High | 1 week+ | Needs its own trust process before launch |
| 27 | `district_admin` role tier + policy updates | Medium | 2–3 days | Needed before 100-village stage, not before |
| 28 | Single Postgres RPC/view to replace 5-query stats fetch | Low | 1 day | Performance, matters more at scale |
| 29 | Image resizing/CDN pipeline for uploads | Medium | 2–3 days | Mobile load time improvement |
| 30 | Cursor-based pagination on high-volume lists | Medium | 2 days | Needed before lists exceed a few thousand rows |

### Tier 4 — Scale infrastructure (Priority: Defer until traffic justifies it)
| # | Item | Difficulty | Est. Time | Impact |
|---|---|---|---|---|
| 31 | Redis caching layer for hot reads | High | 1 week | Only matters at real multi-village scale |
| 32 | Table partitioning by `village_id` | High | 1 week+ | Premature before ~10,000+ rows/village |
| 33 | Offline mode (service worker + IndexedDB) | High | 2+ weeks | Real value in low-connectivity areas, but expensive |
| 34 | Regional language support beyond Telugu/English/Hindi | Medium | Ongoing | Scale with village count, not upfront |
| 35 | AI Agriculture/Health/Scheme assistants (specialized, not generic chatbot) | High | Ongoing | Needs real domain data sources, not just a wrapped LLM prompt |

*(Items 36–100 from the original brief — analytics dashboards, subscription tiers, machinery/vehicle/house marketplaces, sports, digital classes, training programs, etc. — are lower-leverage variations of the patterns already specified above: they reuse the `listings` table pattern, the `community_groups` pattern, or the storage-backed resource pattern from Tiers 2–3. Rather than list 65 more near-duplicate rows, apply the closest existing pattern from above when you're ready to build each one — that keeps the codebase consistent instead of accumulating 60 one-off table designs.)*
