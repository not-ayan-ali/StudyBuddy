# StudyBuddy

An AI-powered study planner and tutor app for Matric and Inter students in Pakistan. Built with React Native (Expo).

## Features

- **AI Study Plan Generator** – Personalized daily/weekly/monthly timetables based on your schedule, subjects, and preferences
- **AI Tutor** – Ask questions and get grade-appropriate explanations powered by Gemini & Groq AI
- **Curated Resources** – Subject-wise learning resources scoped to your class and board
- **Dark Academic Theme** – "Scholarly Tactile" design with Literata, Source Sans 3, and Caveat typography

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native + Expo SDK 57 |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| Styling | NativeWind (Tailwind CSS) |
| AI | Google Gemini API + Groq API |
| Storage | AsyncStorage (on-device, no backend) |
| Build | EAS Build / Local Gradle |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for local APK build)
- API keys: [Gemini](https://aistudio.google.com/app/apikey) and [Groq](https://console.groq.com/keys)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file and add your API keys
cp .env.example .env
```

Edit `.env` with your API keys:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key
```

### Run

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on Web
npm run web
```

### Build APK

```bash
# Local build (requires Android SDK)
cd android
./gradlew assembleRelease

# Or via EAS Build
eas build -p android --profile preview
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## Project Structure

```
StudyBuddy/
├── App.js                  # Root component with navigation
├── screens/                # Screen components
│   ├── LoginScreen.js
│   ├── OnboardingStep1-5.js
│   ├── HomeScreen.js
│   ├── TutorScreen.js
│   ├── ResourcesScreen.js
│   └── ProfileScreen.js
├── components/             # Reusable UI components
├── services/               # API and storage services
│   ├── aiService.js        # Gemini/Groq integration
│   └── storageService.js   # AsyncStorage wrapper
├── theme/                  # Design tokens
│   └── tokens.js
├── data/                   # Static data
├── assets/                 # Images, fonts, icons
└── android/                # Native Android project
```

## Design

The app follows a "Scholarly Tactile" design system:
- **Dark graphite/ink** background palette
- **Ochre** primary accent (#D4A853)
- **Sage** for success states
- **Ink-blue** secondary
- Typography: Literata (headings), Source Sans 3 (body), Caveat (accents)

## License

Private — college project by M Ayyan Ali
