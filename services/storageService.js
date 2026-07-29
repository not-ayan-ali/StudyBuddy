import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STUDENT_NAME: 'studentName',
  ONBOARDING_DATA: 'onboardingData',
  CURRENT_PLAN: 'currentPlan',
  PLAN_COMPLETION: 'planCompletion',
  CACHED_RESOURCES: 'cachedResources',
  CHAT_HISTORY: 'tutorChatHistory',
};

export async function saveStudentName(name) {
  await AsyncStorage.setItem(KEYS.STUDENT_NAME, name);
}

export async function getStudentName() {
  return AsyncStorage.getItem(KEYS.STUDENT_NAME);
}

export async function saveOnboardingData(data) {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DATA, JSON.stringify(data));
}

export async function getOnboardingData() {
  const raw = await AsyncStorage.getItem(KEYS.ONBOARDING_DATA);
  return raw ? JSON.parse(raw) : null;
}

export async function saveCurrentPlan(plan) {
  await AsyncStorage.setItem(KEYS.CURRENT_PLAN, JSON.stringify(plan));
}

export async function getCurrentPlan() {
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_PLAN);
  return raw ? JSON.parse(raw) : null;
}

export async function savePlanCompletion(completion) {
  await AsyncStorage.setItem(KEYS.PLAN_COMPLETION, JSON.stringify(completion));
}

export async function getPlanCompletion() {
  const raw = await AsyncStorage.getItem(KEYS.PLAN_COMPLETION);
  return raw ? JSON.parse(raw) : {};
}

export async function saveCachedResources(data) {
  await AsyncStorage.setItem(KEYS.CACHED_RESOURCES, JSON.stringify(data));
}

export async function getCachedResources() {
  const raw = await AsyncStorage.getItem(KEYS.CACHED_RESOURCES);
  return raw ? JSON.parse(raw) : null;
}

export async function saveChatHistory(messages) {
  await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
}

export async function getChatHistory() {
  const raw = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
