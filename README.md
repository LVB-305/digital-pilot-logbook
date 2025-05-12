# Digital Pilot Logbook

A modern web application for pilots to track, manage, and analyze their flight hours and experience digitally. This is a work in progress, please keep a secure copy of your flights.

## Features

- **Digital Logbook**: Record and track all your flights in one place
- **Dashboard**: Visualize your flying statistics and progress
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices (with PWA support in future version)
- **Supabase Authentication**: Secure user accounts
- **Cloud Storage**: All your data securely stored in Supabase
- **Export Options**: Generate reports and export your logbook data (support in future version)

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase (Database & Authentication)

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/digital-pilot-logbook.git
cd digital-pilot-logbook
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your Supabase project:
   - Create a new project in the [Supabase Dashboard](https://app.supabase.com)
   - Get your project URL and anon key from the project settings
   - Set up Authentication with the providers you want to use
   - Run the database migrations

4. Create a `.env.local` file in the root directory with your Supabase configuration:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
digital-pilot-logbook/
├── app/                 # Next.js app directory
│   ├── (auth)/          # Authentication pages
│   └── ...
├── components/          # React components
│   ├── ui/              # shadcn UI components
│   └── ...
├── lib/                 # Utility functions
│   ├── supabase.ts      # Supabase configuration
│   └── ...
├── schemes/            # TypeScript type definitions
├── public/             # Static assets
├── .env.local          # Environment variables
└── ...
```

## License

No license has been decided for now as this is a very early work in progress.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
