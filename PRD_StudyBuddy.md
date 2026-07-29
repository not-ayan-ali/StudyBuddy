# Product Requirements Document
## StudyBuddy — AI Study Planner for Matric & Inter Students

**Author:** [Your Name]
**Date:** July 2026
**Status:** Draft v1
**Project type:** College project (solo, 4–5 day build, "vibecoded")

---

## 1. Problem Statement

Matric (grades 9–10) and Inter (grades 11–12) students in Pakistan typically juggle 6–8 subjects with board-exam pressure, but have no structured way to plan study time, get quick help when stuck on a concept, or find reliable subject-wise resources in one place. Most rely on scattered YouTube videos, WhatsApp groups, and guesswork about how to allocate time before exams.

**Core insight:** Students don't lack content — they lack a *plan* and a *place to ask questions* without waiting for a tutor.

---

## 2. Goals

| Goal | Why it matters for this project |
|---|---|
| Demonstrate a working AI-personalized study planner | This is your headline feature — the thing that makes it "AI-integrated" and not just a to-do list app |
| Demonstrate an AI doubt-solving chat | Shows conversational AI integration, a second distinct use of the LLM |
| Provide a curated resources tab | Rounds out the app, low technical risk, easy to populate quickly |
| Ship a demoable build in 4–5 days | Non-negotiable constraint — every feature decision is filtered through this |

**Non-goal for this version:** building a real multi-user backend with accounts, payments, teacher dashboards, or content licensing deals. This is a functional prototype/demo, not a startup MVP.

---

## 3. Target Users

- **Primary:** Matric (9th/10th) and Inter (11th/12th, pre-medical/pre-engineering/commerce) students in Pakistan preparing for board exams.
- **Secondary (implied, not built for in v1):** parents/teachers monitoring progress — explicitly out of scope for the 5-day build.

---

## 4. Scope: The Three Core Features

### 4.1 AI Study Plan Generator (Onboarding-Driven Daily Timetable)

**What it does:** On first login, the student goes through a short onboarding questionnaire. Their answers are sent to the AI, which generates a personalized *daily* study timetable — one that fits around their real-life fixed commitments, not just a syllabus countdown.

**Onboarding questions (asked once, right after login):**
- **Class/grade** (Matric 9th / Matric 10th / Inter 11th / Inter 12th) — new field, see note below
- College/school timings (start time, end time)
- Subjects being studied (multi-select from Matric/Inter subject list)
- Tuition/academy timings, if any (subject + start/end time, can add multiple)
- **Plan cadence: Daily / Weekly / Monthly** (simple 3-option toggle — see note below)
- Optional extras: any other fixed commitments (e.g., sports, Quran class), self-rated weak subjects, preferred study hours (morning person vs night owl)

> **Note on this addition:** the 13 Stitch screens don't currently have a field capturing the student's exact class/grade — Step 2 only captures subjects. Since content now needs to be AI-tailored by class (see below), one small addition is needed: a class selector (simple 4-option chip row) added to the top of Onboarding Step 2, above the existing subject checklist. This is the one deliberate exception to "don't change any screen" — everything else stays exactly as designed. If you'd rather place this differently (e.g., its own screen, or folded into Step 1), let me know and I'll adjust the instructions.

## 4b. Class-Driven AI Content (cross-cutting requirement)

Every AI-generated piece of content in the app — the study plan, the tutor's answers, and the resources list — must be scoped to the student's selected class/grade from onboarding, not generic Matric/Inter content. Concretely:
- The **plan generator** prompt includes the class so scheduling language and subject depth match that grade
- The **tutor** system instruction includes the class so explanations are pitched at the right level (a 9th grader and a 12th grader asking about "energy" need different depth)
- The **resources generator** uses the class to scope search-grounded results to grade-appropriate material

**Design note on offering all three cadences (Daily/Weekly/Monthly):**
Build this as **one engine, one JSON schema**, not three separate features — otherwise it easily triples your build time.
- Same AI prompt + same onboarding data feed all three; the only thing that changes is a `duration_days` parameter and level of detail.
- **Daily & Weekly** use the same fine-grained schema (time-block per subject per day) — daily is just `duration_days: 1`, weekly is `duration_days: 7`. Build this first; it's your core, most-demoed cadence.
- **Monthly** deliberately uses a *coarser* schema (a subject-focus summary per week, not per time-block) — a full month of fine-grained time-blocks is too large an output for the AI to keep reliable/structured. Framing it this way is both more realistic to build and arguably more useful (nobody actually plans day-by-day a month out).
- Student picks cadence once in onboarding via a simple toggle; "Delete Plan / Start Over" lets them regenerate with a different cadence any time.

**Plan generation:**
- Onboarding answers (including chosen cadence) are formatted into a prompt sent to the AI
- AI returns a structured schedule matching the chosen cadence's schema (fine-grained time-blocks for daily/weekly, weekly-summary blocks for monthly)
- Output format should be structured JSON (time slot → subject/activity, or week → subject focus for monthly) so the app can render it as a clean timetable, not just a wall of AI text

**Main page:**
- The generated plan is the first thing the student sees on the home/main screen after onboarding — a scrollable daily timetable (e.g., 4:00–5:00 PM: Physics revision, 5:00–5:30: break, 5:30–6:30: Chemistry, etc.)
- Student can mark blocks/tasks complete

**Delete & restart:**
- A clear "Delete Plan" or "Start Over" action on the main page wipes the current plan and onboarding answers, sending the student back through the onboarding questionnaire to generate a fresh plan
- Useful when a student's schedule changes (new tuition timing, exam approaching, etc.)

**MVP simplification:** you don't need real subject syllabi for this version — the AI is scheduling *time blocks* around fixed commitments, not detailing exact chapters. That's actually less work than my original draft and fits your 5-day timeline better. If time allows on Day 3–4, you can enrich blocks with suggested topics per subject.

### 4.2 AI Tutor / Doubt-Solving Chat
**What it does:** A chat screen where students type a question ("explain Newton's third law") and get an explanation back, ideally scoped to their grade level.

- Simple chat UI (message bubbles, text input)
- System prompt constrains the AI to explain at Matric/Inter level, in simple language, with examples
- No need for voice, image upload, or math OCR in v1 — text-only

## 4a. Design System (finalized — do not redesign)

UI/UX is already fully designed in Google Stitch: 13 screens covering Login, all 5 onboarding steps, Home (loading/error/weekly-daily/monthly), Tutor, and Resources (populated/empty), under a system called **"Scholarly Tactile"** — a dark graphite/ink academic-planner aesthetic (ochre primary accent, sage for success, ink-blue for secondary, Literata + Source Sans 3 + Caveat typography). These screens are treated as final ground truth. Nothing about their layout, spacing, or visual design should be changed during the build — only translated into React Native components and populated with real Matric/Inter content in place of Stitch's placeholder university copy.

### 4.4 Resources Tab (revised — AI-driven, not static)
**What it does:** Unlike a hardcoded resource list, this tab generates its content via AI, scoped to the student's actual class/grade and chosen subjects from onboarding — so a 9th grader studying Biology sees different, level-appropriate resources than a 12th grader studying the same subject.

- Uses the Gemini API with Google Search grounding enabled, so returned resources are real, sourced links rather than the model inventing titles/URLs from memory
- Generated once per onboarding (or on manual refresh), then **cached locally** (AsyncStorage) so the tab still works offline or on a bad connection during the demo — it doesn't re-call the API on every tab visit
- Uses the existing populated/empty screen designs; loading and error states reuse the Home screen's existing loading/error card components rather than new screens (see note above — no new screens were designed for this)

---

## 5. Out of Scope (explicitly, so you don't scope-creep mid-build)

- **Real backend authentication** (no password reset, no email verification, no server-side user database). "Login" in this app is a lightweight local flow — e.g., student enters a name, taps "Continue," and that triggers onboarding. Everything is stored on-device.
- Multi-device sync
- Payment/premium tiers
- Teacher/parent dashboards
- Voice input, handwriting/image-based doubt solving
- Push notifications/reminders (nice-to-have if time allows on day 5, not core)
- Support for every subject/board — pick 2–3 subjects for one board as your demo slice

---

## 6. Recommended Tech Stack (assumption — override if your course requires otherwise)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React Native + Expo | Fastest path to a real Android/iOS app for a solo dev; huge community + AI coding tools handle it well |
| Local storage | AsyncStorage or SQLite (expo-sqlite) | No backend needed — everything lives on-device, avoids auth/server complexity entirely |
| AI | Anthropic Claude API (or OpenAI) called directly from the app or via a tiny serverless function | Two use cases: (1) generate structured JSON study plan, (2) chat completion for tutor |
| Backend (if any) | None, or a single serverless function (Vercel/Supabase Edge Function) to hide your API key | Avoid building a full backend in 5 days — hiding the API key is the only real reason you'd need one |
| Resources data | Local JSON file bundled with the app | No CMS needed for a static curated list |

---

## 7. Suggested 5-Day Build Plan

| Day | Focus |
|---|---|
| Day 1 | Project setup (Expo init, navigation, basic screens/tabs), simple local "login" name screen, Resources tab UI + static data (lowest risk, builds momentum) |
| Day 2 | Onboarding questionnaire UI (college timings, subjects, tuition timings, cadence toggle, extras) → wire up AI call that returns weekly (fine-grained) JSON timetable — build this cadence first |
| Day 3 | Main page: render the timetable from AI output, mark-complete checkboxes, local storage persistence, "Delete Plan / Start Over" flow back to onboarding. If time allows, add daily (reuse weekly schema, `duration_days: 1`) and monthly (coarser weekly-summary schema) as the other two cadence options |
| Day 4 | AI Tutor chat: chat UI, API integration, system prompt tuning for grade-appropriate answers |
| Day 5 | Polish pass: app icon/splash, empty states, error handling for API failures, test on a real device, prep demo script/slides |

---

## 8. Success Criteria for the Demo

- App installs and runs on an actual Android/iOS device (not just simulator)
- A student can go through onboarding (college timings, subjects, tuition timings, cadence choice) and see a real AI-generated timetable appear on the main page
- At minimum, Weekly cadence works end-to-end; Daily and Monthly are stretch goals if time allows (see Day 3)
- "Delete Plan / Start Over" actually clears the plan and re-triggers onboarding
- The AI tutor answers at least 3–4 sample doubt questions in a clearly grade-appropriate way
- Resources tab has real, working content for at least 2 subjects
- You can explain, in the PRD/demo, what you'd build next with more time (this shows product thinking to your instructor)

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| AI API costs/rate limits during demo | Use a cheap/fast model, cache responses where possible, test ahead of time |
| Running out of time on the "hardest" feature (AI tutor or plan generator) | Build Resources tab first (guaranteed win), tackle riskier AI features with 2+ days of buffer |
| Scope creep (adding accounts, more subjects, notifications) | Refer back to Section 5 (Out of Scope) every time you're tempted |

---

## Open Questions For You To Decide

1. Which specific board/subjects will you hardcode for the plan generator demo? (e.g., Federal Board Matric: Physics, Chemistry, Math)
2. Do you have an Anthropic/OpenAI API key ready, or do we need to sort that first?
3. Any specific instructor requirements (rubric items) this PRD needs to explicitly address?
