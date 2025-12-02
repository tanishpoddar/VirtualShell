# SRM OS Virtual Labs

An interactive, web-based platform for learning Operating Systems concepts through hands-on experimentation.

## Features

- **Virtual Linux Terminal**: Browser-based terminal with 30+ Linux commands
- **Persistent Filesystem**: Client-side filesystem that persists across sessions
- **AI Command Helper**: Contextual hints powered by Google Gemini
- **Firebase Integration**: User authentication and state persistence
- **Multiple Experiments**: Structured learning modules (currently Experiment 2 is implemented)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration from [Firebase Console](https://console.firebase.google.com/)
   - Add your Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to [http://localhost:9002](http://localhost:9002)

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

## Tech Stack

- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Genkit with Gemini 2.5 Flash
- **Language**: TypeScript

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Core utilities (filesystem, commands)
├── ai/               # Genkit AI flows
└── hooks/            # Custom React hooks
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
