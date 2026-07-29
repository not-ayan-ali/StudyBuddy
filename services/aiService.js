import { saveCurrentPlan } from './storageService';
import { getCuratedResources } from '../data/curatedResources';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_API_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function getGeminiKey() {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY;
}

function getGroqKey() {
  return process.env.EXPO_PUBLIC_GROQ_API_KEY;
}

async function callGemini(prompt, jsonMode = false, extraBody = {}) {
  const key = getGeminiKey();
  if (!key) throw new Error('Gemini API key not configured');

  const url = `${GEMINI_API_BASE}?key=${key}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...extraBody,
  };

  if (jsonMode) {
    body.generationConfig = { responseMimeType: 'application/json' };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}

async function callGroq(prompt, jsonMode = false) {
  const key = getGroqKey();
  if (!key) throw new Error('Groq API key not configured');

  const messages = [
    { role: 'system', content: 'You are a helpful study planner assistant.' },
    { role: 'user', content: prompt },
  ];

  const body = {
    model: GROQ_MODEL,
    messages,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq API');
  return text;
}

async function callAI(prompt, jsonMode = false) {
  if (getGeminiKey()) {
    try {
      return await callGemini(prompt, jsonMode);
    } catch (e) {
      console.warn('Gemini failed, falling back to Groq:', e.message);
    }
  }
  if (!getGroqKey()) {
    throw new Error('No API key configured. Set EXPO_PUBLIC_GEMINI_API_KEY or EXPO_PUBLIC_GROQ_API_KEY in your .env file.');
  }
  return callGroq(prompt, jsonMode);
}

export async function generateStudyPlan(onboardingData) {
  if (!onboardingData) {
    return { error: true, message: 'No onboarding data provided.' };
  }

  const { studentClass: rawClass, schoolStart, schoolEnd, subjects, tuitions, cadence, weakSubjects, preferredTime } = onboardingData;
  const studentClass = normalizeClass(rawClass);

  const tuitionDesc = tuitions?.length
    ? tuitions.map(t => `${t.subject}: ${t.start} - ${t.end}`).join(', ')
    : 'none';

  let schemaExample;
  let instructions;

  if (cadence === 'monthly') {
    schemaExample = JSON.stringify({
      cadence: 'monthly',
      weeks: [{ week: 1, dateRange: 'Oct 02 — Oct 08', focus: [{ subject: 'Physics', note: 'Cover mechanics chapters' }] }],
    }, null, 2);
    instructions = 'Return a monthly plan with one entry per week showing focus subjects and notes.';
  } else {
    schemaExample = JSON.stringify({
      cadence: cadence === 'daily' ? 'daily' : 'weekly',
      days: [{ day: 'Monday', blocks: [{ start: '16:00', end: '17:00', subject: 'Physics', activity: 'Revise Chapter 3' }] }],
    }, null, 2);
    instructions = cadence === 'daily'
      ? 'Return a plan for one day with time-blocked study sessions.'
      : 'Return a weekly plan with each day having time-blocked study sessions.';
  }

  const prompt = [
    `You are a study planner for a ${studentClass} student.`,
    `School hours: ${schoolStart} to ${schoolEnd}.`,
    `Subjects: ${subjects.join(', ')}.`,
    `Tuition classes: ${tuitionDesc}.`,
    `Weak subjects: ${weakSubjects?.length ? weakSubjects.join(', ') : 'none'}.`,
    `Preferred study time: ${preferredTime || 'not specified'}.`,
    `Plan cadence: ${cadence}.`,
    instructions,
    `The student is in ${studentClass}, so adjust the depth and language accordingly.`,
    `CRITICAL: Do NOT schedule any study sessions during school hours or tuition classes. These are busy times.`,
    `IMPORTANT: Ensure all times in your JSON output (like "start" and "end" for blocks) are in 24-hour format (HH:MM), e.g. "14:00" or "08:00", regardless of the user's input format. Do NOT output AM/PM in the JSON.`,
    `Reply with JSON only in this shape: ${schemaExample}`,
  ].join('\n');

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callAI(prompt, true);
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const plan = JSON.parse(cleaned);
      await saveCurrentPlan(plan);
      return plan;
    } catch (err) {
      lastError = err;
    }
  }
  return { error: true, message: `Could not create study plan. ${lastError.message}` };
}

function parseJsonResponse(raw) {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

function normalizeClass(raw) {
  if (!raw) return '';
  const cleaned = raw.replace(/^(Matric |Inter )/, '');
  const num = parseInt(cleaned);
  if (!isNaN(num) && num >= 9 && num <= 12) return num + 'th';
  return cleaned;
}

function getClassUrls(n) {
  const urls = [];
  if (n >= 9 && n <= 12) {
    urls.push(`https://www.freeilm.com/${n}th-class-notes/`);
    urls.push(`https://www.freeilm.com/class-${n}-test-papers/`);
    urls.push(`https://www.ilmkidunya.com/past_papers/${n}th-past-papers.aspx`);
  }
  if (n === 9 || n === 10) {
    urls.push(`https://www.freeilm.com/${n}th-class-past-papers/`);
    urls.push(`https://freeilm.pk/${n}th-class/notes/`);
    urls.push(`https://freeilm.pk/${n}th-class/past-papers/`);
    urls.push(`https://web.bisemultan.edu.pk/past-papers-${n}th/`);
  }
  if (n === 11 || n === 12) {
    const year = n === 11 ? '1st-year' : '2nd-year';
    const part = n === 11 ? 'part-i' : 'part-ii';
    urls.push(`https://web.bisemultan.edu.pk/past-papers-${part}/`);
    urls.push(`https://freeilm.pk/${year}/`);
    urls.push(`https://freeilm.pk/${year}/past-papers/`);
  }
  return urls;
}

export async function generateResources(studentClass, subjects) {
  const cls = normalizeClass(studentClass);
  const curated = getCuratedResources(cls, subjects);
  if (curated.length >= 6) {
    return curated;
  }

  const clsNum = parseInt(cls);
  const trustedUrls = getClassUrls(clsNum);
  const urlLines = trustedUrls.map(u => `- ${u}`).join('\n');

  const prompt = [
    `You are a study resource curator for a ${cls} student in Pakistan studying ${subjects.join(', ')}.`,
    'You MUST ONLY return the exact URLs provided below. NEVER invent, guess, modify, or construct your own URLs.',
    'List of approved URLs:',
    urlLines,
    '',
    'CRITICAL INSTRUCTIONS:',
    '1. The "url" field in your response MUST exactly match one of the approved URLs above, character for character.',
    '2. DO NOT add any extra text, path segments, or query parameters to the URL.',
    '3. DO NOT return broken links. Stick purely to the approved URLs.',
    '4. Make sure all information is accurate and correct.',
    'Reply with JSON only:',
    '{ "resources": [{ "id": "1", "subject": "Physics", "type": "notes", "title": "title", "url": "exact URL from list" }] }',
    `Subjects: ${subjects.join(', ')}. Types: notes, past-paper, video.`,
  ].join('\n');

  let lastError;
  if (getGeminiKey()) {
    try {
      const raw = await callGemini(prompt, true, { tools: [{ googleSearch: {} }] });
      const ai = parseJsonResponse(raw).resources || [];
      const combined = [...curated, ...ai];
      const seen = new Set();
      return combined.filter(r => { const k = r.url; if (seen.has(k)) return false; seen.add(k); return true; });
    } catch (e) {
      lastError = e;
    }
  }

  if (curated.length > 0) return curated;
  if (getGroqKey()) {
    try {
      const raw = await callGroq(prompt, true);
      return parseJsonResponse(raw).resources || [];
    } catch (e) {
      lastError = e;
    }
  }
  if (curated.length > 0) return curated;
  throw new Error(lastError?.message || 'No API keys configured and no curated resources available.');
}

export async function askTutor(question, studentClass) {
  const cls = normalizeClass(studentClass);
  const prompt = [
    `You are a tutor helping a ${cls} student.`,
    'Explain things at the level of that exact class. Use simple words and everyday examples.',
    'Keep answers short — a few sentences to a short paragraph, not an essay.',
    'If asked something unrelated to schoolwork, gently steer back to studies.',
    '',
    `Student's question: ${question}`,
  ].join('\n');

  return callAI(prompt);
}
