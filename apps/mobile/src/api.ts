import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'cookly.auth.token';

export type ApiRecipe = {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  emoji: string;
  description: string;
  ingredients: string[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export async function fetchRecipes() {
  const response = await request<{ data: ApiRecipe[] }>('/recipes');
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  await AsyncStorage.setItem(TOKEN_KEY, response.token);
  return response.user;
}

export async function register(name: string, email: string, password: string) {
  const response = await request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
    method: 'POST', body: JSON.stringify({ name, email, password }),
  });
  await AsyncStorage.setItem(TOKEN_KEY, response.token);
  return response.user;
}

export async function fetchFavorites() {
  const response = await request<{ data: ApiRecipe[] }>('/favorites');
  return response.data;
}

export async function setFavorite(recipeId: string, saved: boolean) {
  await request(`/favorites/${recipeId}`, { method: saved ? 'POST' : 'DELETE' });
}

export async function logout() { await AsyncStorage.removeItem(TOKEN_KEY); }

export async function hasSession() { return Boolean(await AsyncStorage.getItem(TOKEN_KEY)); }
