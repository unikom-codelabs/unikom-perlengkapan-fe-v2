const requireEnv = (key) => {
  const value = import.meta.env[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `[config] Environment variable ${key} belum diset. ` +
        `Salin .env.example menjadi .env lalu isi nilainya.`,
    );
  }
  return value.trim();
};

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = stripTrailingSlash(requireEnv("VITE_API_BASE_URL"));

export const STORAGE_BASE_URL = `${stripTrailingSlash(
  requireEnv("VITE_STORAGE_BASE_URL"),
)}/`;

if (import.meta.env.PROD && API_BASE_URL.startsWith("http://")) {
  console.warn(
    "[config] API_BASE_URL memakai http:// pada build production. " +
      "Gunakan https:// begitu backend siap.",
  );
}
