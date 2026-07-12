const TOKEN_KEY = "token";
const STORAGE_MODE_KEY = "token_storage_mode";

const decodeJwtPayload = (token) => {
  try {
    const parts = String(token).split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") {
    return true;
  }

  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const bufferSeconds = 30;

  return nowInSeconds >= payload.exp - bufferSeconds;
};

export const isValidTokenFormat = (token) =>
  typeof token === "string" && token.trim().length > 0;

const getStorage = () => {
  try {
    const mode = localStorage.getItem(STORAGE_MODE_KEY);
    return mode === "session" ? sessionStorage : localStorage;
  } catch {
    return localStorage;
  }
};

export const saveToken = (token, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const mode = rememberMe ? "persistent" : "session";

  localStorage.setItem(STORAGE_MODE_KEY, mode);

  if (rememberMe) {
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  storage.setItem(TOKEN_KEY, token);
};

export const loadToken = () => {
  const storage = getStorage();
  return storage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORAGE_MODE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
