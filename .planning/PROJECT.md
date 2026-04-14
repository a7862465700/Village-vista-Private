# Village Vista Website

## Overview
Conversion-optimized land sales website for Vista Village Land Company LLC, selling seller-financed vacant land in Hot Springs Village, Arkansas. Modeled after FablePets.com's proven conversion funnel structure.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: PayPal SDK (with Venmo, card support)
- **Email**: Nodemailer (SMTP)
- **Media**: ElevenLabs (TTS), Gemini AI (copy), FFmpeg + Sharp (video/image)
- **Deployment**: Netlify
- **Domain**: hotspringsland.com

## Architecture
- All pages are `'use client'` components
- Single Supabase client in `lib/supabase.ts`
- Property photos stored in Supabase Storage bucket
- PayPal SDK loaded from CDN (not npm)
- Image optimization disabled (Supabase URLs direct)

## Key Routes
| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero, trust bar, testimonials, featured lots, brand narrative, community gallery, financing, how it works, newsletter, CTA |
| `/properties` | Property grid with available/pending separation |
| `/properties/[id]` | Detail page — stacked photos, sticky sidebar with accordions, FAQ |
| `/checkout/[id]` | 4-step: buyer info → sign agreement → PayPal payment → confirmation |
| `/admin` | Password-protected admin dashboard |
| `/map` | (PLANNED) Interactive property map explorer |

## Database Tables
- `properties` — listings with photos[], videos[], selling_points[], lat/lng, status, financing terms
- `leads` — checkout form submissions with signature data, PayPal order ID
- `newsletter_subscribers` — email capture from homepage signup
- `loans` — finance tracking (shared with LandFlow CRM)

## Design System
- **Colors**: green (#2C4A35), ivory (#F5EDD6), gold (#C9A055), earth (#8B5E3C)
- **Fonts**: Cormorant Garamond (serif headings), Jost (sans body)
- **Border radius**: 4px (rounded) consistently across buttons and cards
- **Animations**: Subtle fadeUp, crossfade transitions

## Business Context
- Owner: Richard Alberty, Vista Village Land Co
- Properties in Hot Springs Village, AR (Garland County)
- Owner financing: $500-$1500 down, 10-12% APR, 60-month terms
- $100 reservation deposit via PayPal
- Digital contract signing with font selection
- Borrower portal via Hickory Street Finance

## Current State (as of 2026-04-10)
### Completed
- Homepage rebuild (FablePets conversion funnel structure)
- Property detail page rebuild (stacked photos, sticky sidebar, FAQ)
- Rounded corners across all components
- Trust bar, testimonial carousel, community gallery
- How It Works section on homepage
- Newsletter backend wired to Supabase
- PayPal SDK upgraded (Venmo + cards enabled)
- Checkout trust badges + enhanced progress indicator
- Property card acreage badges (replaced photo count)

### Remaining Work (This Milestone)
- Property card redesign (hover photo carousel, large acreage badge, amenity icons, simplified text)
- PropertyCardHome matching refresh
- Interactive map explorer (/map page with Leaflet)
- Leaflet integration (install + build map component)
