# Personal Health Guide PWA

A mobile-first Progressive Web App for personal wellness tracking, including fitness, nutrition, and skincare routines.

## Features

- **Authentication**: Email/password login with Supabase Auth
- **Onboarding**: Multi-step wizard to set up your profile
- **Daily Dashboard**: View today's workout, skin routine, and nutrition snapshot
- **Exercise**: Workout plans with active workout mode and rest timer
- **Nutrition**: Food logging with AI-powered photo analysis
- **Skin Care**: AM/PM routine checklists
- **Progress**: Track photos, measurements, and charts

## Tech Stack

- Next.js 14+ with TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth, Database, Storage)
- next-pwa
- recharts

## Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## PWA

The app is configured as a PWA. Install it on mobile by adding to home screen.
