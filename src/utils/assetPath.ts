// Prepend Vite's base URL to any public asset path.
// In dev: base is "/", in production (GH Pages): base is "/website-talentron/"
// Usage: assetPath("/assets/logos/logo.png") → "/website-talentron/assets/logos/logo.png"
const BASE = import.meta.env.BASE_URL;

export function assetPath(path: string): string {
  // Remove leading slash from path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE}${cleanPath}`;
}
