# StudyBuddy

**StudyBuddy** is an AI-powered study planner and tutor application designed specifically for Matric (9th-10th) and Inter (11th-12th) students in Pakistan. It helps students manage their academic workload by creating personalized study plans based on their actual commitments, providing an AI tutor for instant doubt-solving, and offering curated, class-appropriate study resources.

---

## 🚀 Key Features

*   **AI Study Planner**: Generates a personalized daily, weekly, or monthly study timetable based on your school hours, tuition timings, and other commitments.
*   **AI Tutor**: An interactive chat interface that provides grade-appropriate explanations for academic doubts, ensuring you don't get stuck on complex concepts.
*   **Curated Resources**: AI-driven resource discovery that provides relevant, class-appropriate links and material for your subjects.
*   **Offline-Ready**: Plans and resources are cached locally using `AsyncStorage`, ensuring functionality even with poor internet connectivity.

---

## 🛠️ Tech Stack

*   **Frontend**: React Native + Expo
*   **AI Integration**: Google Gemini API (for structured JSON planning and doubt-solving)
*   **Local Storage**: `AsyncStorage`
*   **UI/Design**: "Scholarly Tactile" aesthetic (Dark graphite, ochre accents)

---

## 🏗️ Getting Started

### Prerequisites

- Node.js (v20+)
- Expo CLI (`npx expo`)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```

---

## 📂 Project Structure

- `App.js`: Main application entry point and navigation setup.
- `screens/`: Contains all UI screens (Home, Onboarding, Tutor, Resources).
- `components/`: Reusable UI components (including the animated loading icons).
- `services/`: AI API integration and logic.
- `data/`: Curated resources and local data handlers.
- `assets/`: App images, icons, and fonts.
