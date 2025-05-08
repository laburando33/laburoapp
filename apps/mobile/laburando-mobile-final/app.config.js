// apps/mobile/app.config.js
export default {
  name: "laburando",
  slug: "laburando",
  version: "1.0.0",
  scheme: "laburando", // 🔥 importante para linking
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  userInterfaceStyle: "light",
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },};
