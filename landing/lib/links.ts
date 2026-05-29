// The deployed DClaw Waste app. Override at build time with NEXT_PUBLIC_APP_URL.
// The landing site is marketing-only — login/register live on the app, not here.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://frontend-one-inky-81.vercel.app";

export const LOGIN_URL = `${APP_URL}/login`;
export const REGISTER_URL = `${APP_URL}/register`;
