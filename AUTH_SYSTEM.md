# ManaOoru — Production Auth System (4-Role Architecture)

## Role Architecture

| Role           | Enum Value      | Dashboard    | Description                                          |
| -------------- | --------------- | ------------ | ---------------------------------------------------- |
| Platform Admin | `super_admin`   | `/dashboard` | Full platform access, manages all villages and users |
| Village Admin  | `village_admin` | `/dashboard` | Manages one assigned village                         |
| Dealer         | `dealer`        | `/dashboard` | Registered business owner, requires approval         |
| Citizen        | `citizen`       | `/timeline`  | Default role for all new signups                     |

## What changed in the 4-role upgrade

| Feature                      | Status                                                       | Where                                         |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| **4 app roles**              | `super_admin`, `village_admin`, `dealer`, `citizen`          | `app_role` enum, `profiles.role` column       |
| **Dealer registration**      | Citizens apply → pending → admin approves                    | `routes/dealer-registration.tsx`              |
| **Dealer approval workflow** | Village Admin / Platform Admin approve/reject/suspend        | `components/DealerApprovalList.tsx`           |
| **Village isolation**        | Village Admin can only access their assigned village         | SQL `same_village_as_caller()` function + RLS |
| **Designation field**        | Sarpanch, VRO, Secretary, etc. for Village Admins            | `profiles.designation` column                 |
| **Dealer profile fields**    | shop_name, dealer_category, shop_address, etc.               | `profiles` table columns                      |
| **Role protection**          | Only super_admin can change roles; auto-approval audit trail | `protect_profile_role_changes()` trigger      |
| Google Login                 | Already working                                              | `lib/supabase/auth.ts`                        |
| Phone OTP                    | Complete                                                     | `routes/auth.tsx`                             |
| Session persistence          | Production-grade                                             | `integrations/supabase/client.ts`             |
| Protected routes             | Extended with dealer approval gate                           | `components/ProtectedRoute.tsx`               |
| Role-based routing           | 4 distinct dashboard sections                                | `routes/dashboard.tsx`                        |
| Profile completion           | Unchanged                                                    | `routes/complete-profile.tsx`                 |
| Email verification           | Unchanged                                                    | `routes/profile.tsx`, `lib/auth.tsx`          |
| Username uniqueness          | Unchanged                                                    | migration + `lib/supabase/auth.ts`            |
| Account deletion             | Unchanged                                                    | `lib/api/account.functions.ts`                |

---

## Database Schema — New Columns on `profiles`

```sql
designation         TEXT     -- Village Admin title (Sarpanch, VRO, etc.)
dealer_status       TEXT     -- pending | approved | suspended | rejected
dealer_category     TEXT     -- Grocery, Medical Shop, Fertilizer Shop, etc.
shop_name           TEXT     -- Business name
shop_description    TEXT     -- What they sell / services offered
shop_address        TEXT     -- Physical address
approved_by         UUID     -- Who approved the dealer
approved_at         TIMESTAMPTZ  -- When approved
```

## SQL Helper Functions

| Function                             | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `current_user_role()`                | Returns the caller's `app_role`                |
| `is_super_admin()`                   | True if Platform Admin                         |
| `is_admin()`                         | True if Platform Admin OR Village Admin        |
| `caller_village_id()`                | Returns the caller's village_id                |
| `same_village_as_caller(village_id)` | Village isolation check (super_admin bypasses) |
| `is_approved_dealer()`               | True if dealer with approved status            |
| `has_role(user_id, role)`            | Check if a specific user has a specific role   |

## RLS Policy Summary

All policies enforce:

1. **Super Admin** bypasses everything
2. **Village Admin** is scoped to their village via `same_village_as_caller()`
3. **Dealer** can manage own shop/products only when approved
4. **Citizen** can read public data, submit complaints, manage own profile

## Dealer Workflow

```
Citizen opens /dealer-registration
    → Fills shop name, category, description, address
    → Submits → dealer_status = 'pending'

Village Admin/Platform Admin sees pending in dashboard
    → Approve → role = 'dealer', dealer_status = 'approved'
    → Reject → dealer_status = 'rejected'

Approved Dealer can:
    → Manage shop profile
    → Upload products
    → Publish offers
    → View shop analytics

Suspended/Rejected Dealer sees:
    → Status gate page via ProtectedRoute dealerMustBeApproved
```

## Login Flow

```
User → Sign Up / Login
    → Email/Password, Google OAuth, Phone OTP, Magic Link
    → Profile Created Automatically (handle_new_user trigger)
    → Role = 'citizen' (always, on signup)
    → Profile Completion Check
    → Redirect by role:
        super_admin → /dashboard (Platform Dashboard)
        village_admin → /dashboard (Village Dashboard)
        dealer → /dashboard (Dealer Dashboard)
        citizen → /timeline (Citizen Timeline)
```

## Setup Required

### 1. Run the new migration

```
supabase/migrations/20260713220000_four_role_auth_system.sql
```

### 2. Promote your first Platform Admin

After running the migration, manually set a user as super_admin in Supabase:

```sql
UPDATE public.profiles
SET role = 'super_admin', account_type = 'app_admin'
WHERE email = 'your-admin@email.com';
```

### 3. Existing env vars still required

```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# For account deletion (server-side only):
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## Security Guarantees

- **Role escalation prevention**: `protect_profile_role_changes()` trigger prevents non-super_admin users from changing their own role, account_type, or designation
- **Dealer status protection**: Only super_admin or same-village village_admin can change dealer_status
- **Village isolation**: Village Admin RLS policies use `same_village_as_caller()` — cannot access other villages
- **Signup safety**: `handle_new_user()` always sets role = 'citizen', ignoring any client-side metadata
- **Approval audit trail**: `approved_by` and `approved_at` auto-populated when dealer is approved
