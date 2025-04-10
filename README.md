# Digital Pilot Logbook

A modern web application for pilots to track, manage, and analyze their flight hours and experience digitally. This is a work in progress, please keep a secure copy of your flights.

## Features

- **Digital Logbook**: Record and track all your flights in one place
- **Dashboard**: Visualize your flying statistics and progress
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices (with PWA support in future version)
- **Firebase Authentication**: Secure user accounts
- **Cloud Storage**: All your data securely stored in Firestore
- **Export Options**: Generate reports and export your logbook data (support in future version)

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Firebase (Firestore & Authentication)

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Firebase account

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

3. Set up your Firebase project:
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with email/password provider
   - Create a Firestore database
   - Generate your Firebase configuration

4. Create a `.env.local` file in the root directory with your Firebase configuration:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Firebase Setup Guide

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics if desired

2. **Set up Authentication**:
   - In your Firebase project, go to "Authentication"
   - Click "Get started"
   - Enable the Email/Password provider
   - Optionally, set up additional providers like Google, Microsoft, etc.

3. **Create Firestore Database**:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose production or test mode (you can change this later)
   - Select a location for your database

4. **Get Firebase Configuration**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click the web app icon (</>) to register a new web app if you haven't already
   - Copy the configuration object that appears

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
│   ├── firebase.ts      # Firebase configuration
│   └── ...
├── schemes/               # TypeScript type definitions
├── public/              # Static assets
├── .env.local           # Environment variables
└── ...
```

## License

No license has been decided for now as this is a very early work in progress.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)
