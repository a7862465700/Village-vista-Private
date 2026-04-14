# Session Notes — April 10, 2026

## What Was Done

### 1. Backup Coverage
- **landFlow CRM** — Already on GitHub (`landflow-crm`), has uncommitted changes to push
- **Village Vista** — Initialized git repo, pushed to GitHub as `Village-Vista-Private` (private). Large media files (videos, audio, images) excluded via `.gitignore` — OneDrive only
- **Hickory Street / Borrower Portal** — Already on GitHub (`borrower-portal`)
- Created `BACKUP-STATUS.md` with full inventory

### 2. Installed Python & Node.js on AX8_Max
- Python 3.12.10 via winget
- Node.js 24.14.1 LTS via winget
- npm 11.11.0
- `docx` npm package installed locally in Village Vist folder

### 3. Loan Servicing Agreement (Word Doc)
- Created `Hickory-Street-Finance-Note-Buyer-Servicing-Agreement.docx` — professional Word document
- Also saved as `.md` version
- Modeled after Del Toro Loan Servicing agreement structure
- Key provisions: 30-day termination by either party, release of liability, hold harmless/indemnification, portal access
- Generated via `generate-agreement.js` (can re-run if needed)

### 4. Electronic Servicing Agreement — Portal Integration
Implemented the full e-signature onboarding flow for note buyers in the borrower portal:

#### Files Created
| File | Purpose |
|------|---------|
| `supabase/migrations/008_servicing_agreements.sql` | Database table with RLS |
| `app/api/buyer/sign-agreement/route.ts` | POST endpoint to record signatures |
| `app/(buyer)/buyer/agreement/page.tsx` | Full agreement review & e-sign page |

#### Files Modified
| File | Change |
|------|--------|
| `app/(buyer)/layout.tsx` | Added agreement gate — redirects unsigned buyers to `/buyer/agreement` |

#### How It Works
1. Note buyer logs in via OTP email
2. Middleware routes them to `/buyer/*`
3. Layout checks `servicing_agreements` table for signed agreement
4. If unsigned → redirect to `/buyer/agreement`
5. Agreement page shows:
   - Lender info from LandFlow CRM (`nb_name`, `nb_email`, `nb_business`, `nb_address`, `inv_contact`)
   - Parcel ID, legal description, property address, county, state
   - Full scrollable agreement text (15 sections)
6. Must scroll to bottom before signing
7. Types full legal name as e-signature + checkbox agreement
8. Recorded with: timestamp, IP address, user agent (digital security)
9. After signing → redirected to buyer dashboard

#### Database
- Table: `servicing_agreements` (applied to Supabase project `rcidwqyrrfrthujymncn`)
- RLS: buyers read own, admins read all, buyers insert own
- Unique constraint: one agreement per buyer per loan

### Supabase Project
- Project ID: `rcidwqyrrfrthujymncn`
- Shared between LandFlow CRM and Borrower Portal

## TODO for Next Session
- [ ] Push landFlow uncommitted changes to GitHub
- [ ] Verify `village-vista/` and `village-vista-v2/` sub-projects have GitHub remotes
- [ ] Test the agreement flow end-to-end with a real note buyer login
- [ ] Fill in Fee Schedule (Exhibit B) with actual pricing
- [ ] Fill in governing state in Section 13.0
- [ ] Consider creating standalone `Hickory Street Finance` folder on primary computer
- [ ] Back up video files to external drive (OneDrive-only risk)
- [ ] Word doc is locked on this machine — review on other computer and finalize
