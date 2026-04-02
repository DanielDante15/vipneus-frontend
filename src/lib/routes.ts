/** Full path for login (respects Vite `base` / `import.meta.env.BASE_URL`). */
export function getLoginHref(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base ? `${base}/login` : "/login";
}
