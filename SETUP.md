# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- Google AI API key

## Step-by-Step Setup

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** → Sign-in method → Google
4. Enable **Firestore Database** → Create database in production mode
5. Go to Project Settings → General → Your apps
6. Copy the Firebase configuration

### 2. Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated API key

### 3. Environment Configuration

Create `.env.local` in the project root:

```env
# Firebase Configuration (from step 1)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google AI (from step 2)
GOOGLE_API_KEY=AIza...

# Genkit Configuration
GENKIT_ENV=dev
```

### 4. Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002)

## Troubleshooting

### localStorage errors
- Make sure you're using the latest code with the server polyfills
- Restart the development server after adding environment variables

### Firebase errors
- Verify all Firebase configuration values are correct
- Check that Authentication and Firestore are enabled in Firebase Console
- Ensure your domain is added to authorized domains in Firebase Authentication settings

### AI Command Helper not working
- Verify `GOOGLE_API_KEY` is set in `.env.local`
- Check the Genkit dev server logs: `npm run genkit:dev`
- Ensure you have API quota available in Google AI Studio

## Next Steps

1. Sign in with Google to enable filesystem persistence
2. Navigate to Experiment 2 to try the virtual terminal
3. Use the AI Command Helper for contextual hints
4. Explore the different command categories in the sidebar

## Development

To work on AI flows:
```bash
npm run genkit:watch
```

This starts the Genkit development UI at [http://localhost:4000](http://localhost:4000)
