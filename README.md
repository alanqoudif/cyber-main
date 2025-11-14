# CyberMirror 2.0

A comprehensive educational platform for phishing simulation and security awareness training built with Next.js, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure login/signup with Supabase Auth
- **Admin Dashboard**: Manage campaigns, users, and view detailed reports
- **User Dashboard**: Track interactions, view risk scores, and access learning materials
- **Phishing Simulator**: Create educational phishing links with realistic templates (Instagram, Google, Facebook, LinkedIn, Twitter)
- **Campaign Management**: Create and manage phishing simulation campaigns
- **Email System**: Send educational phishing emails with tracking
- **Landing Pages**: Dynamic landing pages for each campaign with event tracking
- **Risk Scoring**: Automatic risk score calculation based on user interactions
- **Event Tracking**: Comprehensive tracking of opens, clicks, reports, and ignores
- **Threat Map**: Visual 3D globe showing threat patterns and activities
- **Learning Module**: Educational lessons about phishing and security best practices
- **CSV Export**: Export reports and event data

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Nodemailer
- **3D Visualization**: Three.js, React Three Fiber

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cyber-main
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM="CyberMirror <no-reply@cybermirror.local>"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations:
The database schema is already set up in Supabase. Run the SQL migrations in the `supabase/sql/` directory:
- `0001_schema.sql` - Base schema
- `0002_rls.sql` - Row Level Security policies
- `0003_functions.sql` - Database functions
- `0004_phishing_links.sql` - Phishing links and submissions tables

You can run these migrations via the Supabase dashboard or CLI.

5. Seed the database (optional):
```bash
npm run seed
```

This will create:
- Admin user: `admin@cybermirror.local` / `admin123`
- Regular user: `user@cybermirror.local` / `user123`
- Sample campaign with recipients

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages (user & admin)
│   ├── campaigns/      # Campaign management pages
│   ├── lp/            # Landing pages for campaigns
│   ├── learn/         # Learning module
│   └── api/           # API routes
├── components/
│   ├── admin/         # Admin-specific components
│   ├── campaigns/     # Campaign components
│   ├── layout/        # Layout components
│   └── ui/            # Reusable UI components
├── lib/
│   ├── supabase/      # Supabase client utilities
│   ├── email/         # Email templates and transporter
│   ├── auth.ts        # Authentication helpers
│   └── risk-score.ts  # Risk scoring algorithm
└── scripts/
    └── seed.ts        # Database seeding script
```

## Key Features Explained

### Phishing Simulator

The Phishing Simulator allows users to create educational phishing links with realistic templates:
- **Create Phishing Links**: Generate unique phishing links with customizable templates
- **Multiple Templates**: Choose from Instagram, Google, Facebook, LinkedIn, Twitter, or Generic templates
- **Real-time Tracking**: View submissions in real-time, including usernames, passwords, emails, and IP addresses
- **Educational Warnings**: After submitting data, users see an educational warning explaining how phishing works
- **Link Management**: Manage all your phishing links from the dashboard, view statistics, and delete links

### Risk Scoring

The platform uses a simple risk scoring algorithm:
- **CLICK**: +5 points (high risk)
- **OPEN**: +1 point (low risk)
- **REPORT**: -4 points (good behavior)
- **IGNORE**: 0 points (neutral)

Scores are calculated automatically when events are tracked and stored per user/campaign.

### Event Tracking

Events are tracked automatically when:
- A landing page is opened (OPEN)
- A link is clicked (CLICK)
- A phishing attempt is reported (REPORT)
- An email is ignored (IGNORE)

Each event includes metadata such as IP address, user agent, and timestamp.

### Email System

The platform uses Nodemailer to send phishing simulation emails. For local development, you can use Mailpit or a local SMTP server. Configure SMTP settings in your `.env.local` file.

## Security Considerations

- Row Level Security (RLS) is enabled on all database tables
- Users can only view their own data (unless admin)
- Admins have full access to manage campaigns and view reports
- IP addresses are anonymized in reports
- No sensitive real data should be used in testing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed the database with test data

### Database Schema

The database includes the following tables:
- `users` - User profiles (extends Supabase Auth)
- `campaigns` - Phishing simulation campaigns
- `recipients` - Email recipients for campaigns
- `events` - Tracked user interactions
- `risk_scores` - Calculated risk scores per user/campaign
- `phishing_links` - Phishing links created by users
- `phishing_submissions` - Data submitted through phishing links (for educational purposes)

## License

This project is part of a university graduation project and is for educational purposes.

## Support

For issues or questions, please contact the development team.
