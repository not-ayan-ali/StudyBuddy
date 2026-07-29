# StudyBuddy — Simple Build Guide
### Follow this like a recipe. You don't need to know how to code.

This guide turns your finished designs into a real, working phone app. Every step below tells you exactly what to type, click, or copy — you're not writing code yourself, you're giving clear instructions to an AI coding tool (OpenCode) that writes the code for you.

**The one idea to hold onto the whole way through:** almost everything a student sees in this app — their study plan, the tutor's answers, the study resources — is written by AI in real time, based on the class they picked and the subjects they chose. Nothing is a fixed, pre-written list. You'll see this repeated in every relevant step below so it's never accidentally built as a hardcoded list.

---

## Part 1 — Words used in this guide

You don't need to memorize these, just glance here if a word feels unfamiliar.

- **Prompt** — a message you type to the AI coding tool telling it what to build.
- **OpenCode** — the app/tool where you'll paste prompts and it writes the code.
- **API key** — a private password-like code that lets your app talk to Google's Gemini AI. Yours is a Gemini key.
- **Screen / frame** — one page of the app (like "Login screen" or "Home screen").
- **`code.html`** — a file inside your Stitch download that describes what one screen should look like. You'll paste its contents into OpenCode as a visual reference.
- **Test the app** — actually opening the app on your phone or a simulator and tapping through it, to make sure the step you just did really works, before moving to the next step.
- **Cache / cached** — saving something on the phone so the app doesn't have to ask the AI again every single time.

---

## Part 2 — Before you start (do this once)

1. Make sure Node.js is installed on your computer. (If you're not sure, ask your AI coding tool: "Is Node.js installed on this computer? If not, tell me how to install it.")
2. Get a **Gemini API key**: go to `aistudio.google.com/app/apikey` in your browser, sign in with a Google account, and click to create a key. Copy it somewhere safe (like a notes app) — you'll need to paste it in once, later.
3. **Never paste your API key directly into app code.** In Part 4 below, you'll ask OpenCode to store it safely instead.
4. Open your project folder in OpenCode. This is where you'll type every prompt in this guide.
5. Unzip your `stitch_custom_app_blueprint.zip` file somewhere you can find it. You now have **15 folders** inside it — one per screen — each with a `code.html` file. You'll paste these into prompts as you go.

---

## Part 3 — Your app's design is already done

You already designed every screen using Google Stitch — a system called **"Scholarly Tactile"** (a dark, warm, notebook-like look with an ochre/gold accent color). You don't need to design anything else. Every prompt below tells OpenCode to build a screen that matches one of your existing designs exactly — it should never invent a new look.

Here's the exact color list, for reference (you won't need to type this yourself — it's already baked into the prompts below):

```
Background: #17130f | Cards: #231f1b and #2e2925
Main text: #eae1db | Secondary text: #d4c4b7
Primary accent (ochre): #f2be8c | Success (sage): #bccbb1 | Info (ink blue): #b0ccdb
Error (red): #ffb4ab
Fonts: Literata (headings), Source Sans 3 (body text), Caveat (small handwritten notes)
```

Your 15 screens, and what each one is for:

| Screen folder | What it's for |
|---|---|
| `studybuddy_login` | Login screen |
| `onboarding_school_hours` | Onboarding step 1 — school timings |
| `onboarding_grounded_style` | Onboarding step 2 — class/grade + subjects |
| `onboarding_tuition_classes` | Onboarding step 3 — tuition timings |
| `onboarding_planning_frequency` | Onboarding step 4 — how often to plan (daily/weekly/monthly) |
| `onboarding_final_setup` | Onboarding step 5 — extra info + "Generate my plan" button |
| `studybuddy_plan_loading` | Home screen while the AI is building the study plan |
| `studybuddy_generation_failed` | Home screen if the AI plan couldn't be built |
| `studybuddy_home_grounded_style` | Home screen — daily/weekly plan, once it's ready |
| `studybuddy_home_monthly_view` | Home screen — monthly plan, once it's ready |
| `ai_tutor_grounded_style` | The chat screen where students ask questions |
| `study_resources_grounded_style` | Resources tab, once the AI has found resources |
| `studybuddy_resources_empty_state` | Resources tab, when a filter finds nothing |
| `load_rsources` | Resources tab while the AI is finding resources |
| `error_resources` | Resources tab if the AI couldn't find resources |

**A small note on 3 screenshot images:** three folders (`ai_tutor_grounded_style`, `onboarding_grounded_style`, `study_resources_grounded_style`) have a preview picture that failed to save properly in Stitch — but the actual design instructions inside each `code.html` file are complete and fine, so this doesn't stop you from building anything below.

---

## Part 4 — Day 1: The basic app + login + resources look

### Step 1.1 — Create the app skeleton
Copy everything in the box below and paste it as one message into OpenCode:

```
Create a new React Native app using Expo (managed workflow) called "StudyBuddy".
Set up navigation with a bottom tab bar with 3 tabs: Home, Tutor, Resources.

Before those tabs, set up a Login screen, then a 5-step Onboarding flow.
Flow: Login -> (if no saved onboarding answers) Onboarding -> Home tabs.
Login -> (if onboarding answers are already saved) go straight to Home tabs.

Use AsyncStorage (@react-native-async-storage/async-storage) to save
everything on the phone itself — no accounts, no server, no password login.

Set up folders: /screens, /components, /services, /data, /theme.
Put a file /theme/tokens.js with these exact color values so every
screen can reuse them:
background/surface-dim #17130f, surface-container #231f1b,
surface-container-high #2e2925, on-surface #eae1db,
on-surface-variant #d4c4b7, outline-variant #50453b,
primary (ochre) #f2be8c, on-primary #482904, secondary (sage) #bccbb1,
tertiary (ink blue) #b0ccdb, error #ffb4ab, error-container #93000a.

Install and set up Google Fonts: Literata, Source Sans 3, and Caveat,
using @expo-google-fonts. Also set up NativeWind if it works with this
Expo version.

Set up a safe way to store a Gemini API key using an environment variable
(EXPO_PUBLIC_GEMINI_API_KEY) — do not write the key directly into any file.
```

**Now test it:** run the app (ask OpenCode how, if unsure — usually `npx expo start`). You should see a blank Login screen and nothing should crash. Don't move on until this works.

### Step 1.2 — Store your Gemini key
Ask OpenCode: *"Set up a `.env` file for me and tell me exactly what line to add for my Gemini API key, using the name EXPO_PUBLIC_GEMINI_API_KEY."* Then follow whatever it tells you — paste your actual key only into that `.env` file, nowhere else.

### Step 1.3 — Build the Login screen
```
Build the Login screen for StudyBuddy, matching studybuddy_login/code.html
(paste that file's contents in before this prompt), using the Scholarly
Tactile design system from /theme/tokens.js: a "StudyBuddy" heading in
Literata, a subtitle, one underlined "your name" text box, a short quote
line, and an ochre "Continue" button.

When Continue is tapped: save the name to AsyncStorage as "studentName".
Then check if "onboardingData" is already saved:
- If yes, go straight to the Home tabs
- If no, go to Onboarding step 1
```
**Test it:** type a name, tap Continue, and confirm it takes you to Onboarding step 1 (since you haven't set anything up yet).

### Step 1.4 — Build the Resources tab (just the look, for now)
```
Build the Resources screen matching study_resources_grounded_style/code.html
(paste that file's contents in before this prompt) for when resources exist,
and studybuddy_resources_empty_state/code.html (paste that too) for when a
filter finds nothing.

Include: filter chips at the top (All / by subject), resource cards with a
colored tag showing type (video/notes/past-paper), title, and subject name,
and tapping a card should open its link.

For right now, show 2-3 made-up placeholder resources so you can see it
render. Reminder for later: this placeholder data gets replaced entirely by
real AI-generated content in Step 3.4 below — the real app never uses a
fixed list.
```
**Test it:** open the Resources tab, confirm the placeholder cards show up, filters work, and tapping one opens a link.

---

## Part 5 — Day 2: Onboarding questions + the AI study plan

### Step 2.1 — Build all 5 onboarding steps
```
Build a 5-step Onboarding flow for StudyBuddy. Each step is its own screen,
with a step indicator at the top ("STEP 0X / 05"), a Back button and a
Next button. Build them in this order, matching each design exactly (I'll
paste each one's file before this prompt):

STEP 1 — School hours (paste onboarding_school_hours/code.html):
Two time pickers: when school starts, when it ends.

STEP 2 — Class and subjects (paste onboarding_grounded_style/code.html):
First, add a row of 4 selectable options at the very top of this screen:
"Matric 9th", "Matric 10th", "Inter 11th", "Inter 12th" — pick the same
selected/unselected style used elsewhere in the design (ochre border when
picked). Below that, unchanged from the design: a checklist of subjects
(Physics, Chemistry, Mathematics, Biology, English, Urdu, Computer Science,
Pakistan Studies, Islamiyat) where the student can tick more than one.
Don't let them press Next until they've picked a class AND at least one
subject.

STEP 3 — Tuition timings (paste onboarding_tuition_classes/code.html):
Optional. A "+ Add tuition" button adds a row with a subject, a start
time, and an end time, plus a way to remove that row. Can be left empty.

STEP 4 — How often to plan (paste onboarding_planning_frequency/code.html):
Three cards to choose from: Daily, Weekly (marked as recommended, picked
by default), Monthly. Only one can be picked.

STEP 5 — Extra info + finish (paste onboarding_final_setup/code.html):
Optional: pick any subjects that feel hard right now, and pick a preferred
study time (Morning/Evening/Night). The final button should say "Generate
my plan" instead of "Next".

When Step 5's button is tapped, save everything as one saved answer called
"onboardingData", shaped like this:
{ studentClass: "9th" or "10th" or "11th" or "12th",
  schoolStart, schoolEnd, subjects: [...],
  tuitions: [{subject, start, end}, ...],
  cadence: "daily" or "weekly" or "monthly",
  weakSubjects: [...], preferredTime }
Then go to the Home tab.
```
**Test it:** go through all 5 steps, including adding then removing a tuition row, and finish. Ask OpenCode to print out what got saved, and check it matches the shape above.

### Step 2.2 — Make the AI actually build the study plan
```
Create a file /services/aiService.js with a function called
generateStudyPlan(onboardingData) that does this:

1. Puts together a request to Google's Gemini AI (model "gemini-2.0-flash")
   using everything from onboardingData — the student's class, school
   timings, subjects, tuition timings, how often to plan, and weak subjects.
   The student's class must change how the plan is written — a 9th grader
   and a 12th grader studying the same subject should get different depth.
2. Sends this request to:
   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=API_KEY
   using the API key saved in Step 1.2 — never typed directly into this file.
3. Turns on Gemini's built-in "answer in JSON" mode by adding
   generationConfig: { responseMimeType: "application/json" } to the request.
4. Tells the AI to reply in this exact shape:

For "daily" or "weekly":
{ "cadence": "weekly", "days": [ { "day": "Monday", "blocks": [
  { "start": "16:00", "end": "17:00", "subject": "Physics", "activity": "Revise Chapter 3" } ] } ] }

For "monthly":
{ "cadence": "monthly", "weeks": [ { "week": 1, "dateRange": "Oct 02 — Oct 08",
  "focus": [ { "subject": "Physics", "note": "Cover mechanics chapters" } ] } ] }

5. Reads the AI's answer and turns it into a usable object. If that fails,
   try one more time before giving up.
6. Saves the finished plan on the phone as "currentPlan", and gives it back
   so the app can show it.

If anything goes wrong (no internet, bad response), this function should
clearly say so rather than crashing, so the app can show a friendly message.
```
**Test it:** ask OpenCode to try this function with a made-up example onboarding answer and show you the result. Check it looks like real, sensible JSON before moving on — this is the single most important step to get right.

---

## Part 6 — Day 3: Showing the plan, and making Resources AI-driven

### Step 3.1 — Loading and error screens for the Home tab
```
Build these two states for the Home screen:

LOADING (paste studybuddy_plan_loading/code.html): shown while the AI is
still building the plan. Keep the greeting at the top, and show a card in
the middle saying "Building your plan…" with a short reassuring line
underneath.

ERROR (paste studybuddy_generation_failed/code.html): shown if the plan
couldn't be built. Keep the greeting at the top, show a card saying
"Couldn't build your plan", reassure the student their answers are safe,
and add a "Retry" button that tries again.
```

### Step 3.2 — Showing the finished plan
```
Build these two states for the Home screen:

DAILY/WEEKLY (paste studybuddy_home_grounded_style/code.html): a greeting,
a row of days to pick from, a progress card, then the plan for the
selected day — each item shows its time, subject, and activity, with a
checkbox to mark it done (save this on the phone too, so it's remembered).

MONTHLY (paste studybuddy_home_monthly_view/code.html): a greeting, then
one card per week showing that week's focus subjects — no checkboxes here.

When this screen first opens:
- If there's no saved plan yet, show the loading screen from Step 3.1,
  call generateStudyPlan() using the saved onboarding answers, then show
  whichever finished view matches the chosen "how often to plan" choice.
- If building the plan fails, show the error screen from Step 3.1.
- If a plan is already saved, just show it — no need to ask the AI again.
```
**Test it:** confirm the plan appears correctly, checked boxes stay checked after closing and reopening the app, and you can trigger the error screen by temporarily breaking the API key.

### Step 3.3 — Delete and start over
```
Add a "Delete plan / start over" text link at the bottom of the Home
screen, matching its placement in studybuddy_home_monthly_view/code.html.
When tapped, ask "Are you sure?" and if confirmed, erase the saved plan
and onboarding answers, then send the student back to Onboarding step 1.
```
**Test it:** confirm this fully resets the app and sends you back through all 5 onboarding steps.

### Step 3.4 — Make the Resources tab fully AI-driven
```
Add a function generateResources(studentClass, subjects) to aiService.js:

1. Calls Gemini (model "gemini-2.0-flash") with its Google Search
   grounding feature turned on (add tools: [{ googleSearch: {} }] to the
   request), so it returns real, actually-existing links instead of made
   up ones.
2. Asks for 8-12 study resources (a mix of videos, notes, and past-paper
   style practice) that fit the given class and subjects, in this shape:
   { "resources": [ { "id", "subject", "type": "video" or "notes" or
   "past-paper", "title", "url" } ] }
3. Saves the result on the phone as "cachedResources" together with which
   class/subjects it was made for, so the app doesn't have to ask again
   every time the student opens the tab.

Update the Resources screen:
- On open, check if there's already a saved "cachedResources" that matches
  the student's current class and subjects. If so, show it immediately —
  no waiting, no new request.
- If not, show the loading screen matching load_rsources/code.html (paste
  that file's contents in before this prompt) while generateResources()
  runs, then save and show the result.
- If it fails, show the screen matching error_resources/code.html (paste
  that file's contents in before this prompt), with a "Retry" button.
- Completely remove the placeholder resources from Step 1.4 — from now on,
  resources only ever come from this AI function or the saved cache.
- Add a small "Refresh" button somewhere on this screen that clears the
  cache and asks the AI again, for when a student changes their subjects.
```
**Test it:** the first time you open Resources, you should see the loading screen, then real class/subject-matched results appear. Break the API key on purpose to confirm the error screen and its Retry button work. Reopen the app and confirm resources show up instantly from the saved cache, without a new request.

---

## Part 7 — Day 4: The AI Tutor chat

### Step 4.1 — Build the chat screen
```
Build the Tutor screen, matching ai_tutor_grounded_style/code.html (paste
that file's contents in before this prompt): student messages on the
right, AI messages on the left with a small icon and timestamp, a text box
and send button fixed at the bottom, and a "typing…" indicator while
waiting for a reply. Chat history doesn't need to be saved between app
restarts.
```

### Step 4.2 — Make the tutor actually answer using AI
```
Add a function askTutor(question, studentClass) to aiService.js, where
studentClass comes from the saved onboarding answers (like "10th" or
"12th") — never a made-up generic value. Call Gemini the same way as
before but WITHOUT the JSON mode this time (a plain written answer, not
data). Tell it to:
- Explain things at the level of that exact class — a 9th grader and a
  12th grader should get different depth of explanation, not one
  one-size-fits-all answer
- Use simple words and everyday examples
- Keep answers short — a few sentences to a short paragraph, not an essay
- If asked something unrelated to schoolwork, gently steer back to studies

Connect this to the send button: each message the student sends should
get a real AI answer back. If it fails, show a friendly "couldn't get an
answer, try again" message instead of crashing.
```
**Test it:** ask 3-4 real questions (e.g. "explain Newton's third law") and check the answers feel right for the class picked during onboarding.

---

## Part 8 — Day 5: Final polish

### Step 5.1 — Double-check every loading/error state
```
Go through the whole app and confirm every place that asks the AI for
something has a proper loading state and error state already wired up:
Home (plan), Resources (Step 3.4), and Tutor (a friendly error message on
failure). Also add a simple app icon and splash screen using the Scholarly
Tactile background and ochre colors — placeholder text is fine.
```

### Step 5.2 — Test on a real phone
Using Expo Go (not just a computer simulator), go through the whole app for real: Login → all 5 onboarding steps → Home (watch the plan get built) → check off a task → Tutor chat → Resources (watch it load) → Delete/start over. Confirm nothing crashes.

### Step 5.3 — Get ready to present
Not a prompt — just prepare, in your own words, a 2-3 minute walkthrough for your instructor covering:
1. The problem this app solves (unstructured study time around real school/tuition schedules)
2. A live demo: onboarding → the AI-built plan → the AI tutor answering a question → AI-found resources
3. What you'd add with more time

---

## Part 9 — What "done" looks like

- The app installs and opens on a real phone
- A student can pick their class, finish onboarding, and see a real plan the AI built for them
- The AI tutor gives answers that actually match the student's class
- The Resources tab shows real, AI-found material for the student's actual subjects — not a fixed list — and still works instantly on a second visit thanks to the saved cache
- Deleting the plan and starting over actually works
- Loading and error screens show up properly instead of the app looking frozen or broken

---

## Part 10 — If something doesn't work

- Don't just paste the same prompt again — copy the actual error message you see and ask OpenCode to fix that specific problem.
- If the AI's study plan keeps failing to load properly, make Step 2.2's instructions even stricter: tell OpenCode to add "reply with only JSON, no extra words before or after it" to the request.
- If you're running low on time near Day 4-5 and something like the Monthly plan option isn't working, it's fine to drop it — the Weekly plan working well matters far more than every option working.
