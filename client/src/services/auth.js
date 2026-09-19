import api, { isDemoMode } from "./api";

const TOKEN_KEY = "medsimplify_auth_token";
const USER_KEY = "medsimplify_user";

const demoUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@medsimplify.ai",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = () => getStoredUser();
export const getAuthToken = () => getToken();
export const isAuthenticated = () => Boolean(getToken());

export const login = async (email, password) => {
  if (isDemoMode) {
    if (email.trim().toLowerCase() !== "demo@medsimplify.ai" || password !== "demo1234") {
      throw new Error("Demo Mode login: use demo@medsimplify.ai / demo1234.");
    }
    saveSession("demo-session", demoUser);
    return demoUser;
  }

  const response = await api.post("/auth/login", { email, password });
  saveSession(response.data.token, response.data.user);
  return response.data.user;
};

export const register = async (name, email, password) => {
  if (isDemoMode) {
    const user = { ...demoUser, name: name.trim(), email: email.trim().toLowerCase() };
    saveSession("demo-session", user);
    return user;
  }

  const response = await api.post("/auth/register", { name, email, password });
  saveSession(response.data.token, response.data.user);
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
