import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// GitHub Pages serves this project from https://<user>.github.io/Vue/, so the
// production build needs every asset URL and router base prefixed with /Vue/.
// Dev and preview stay at the root unless BASE_PATH says otherwise.
const BASE = process.env.BASE_PATH ?? "/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? BASE : "/",
  plugins: [vue()],
  server: {
    // Bind 0.0.0.0 instead of the default localhost-only ([::1]). Port forwarding
    // and other devices on the LAN connect over IPv4, which an IPv6-only bind refuses.
    host: true,
    // Vite 5.4.12+ rejects requests whose Host header it does not recognise. Quick
    // tunnels get a random *.trycloudflare.com name, so allow that suffix rather
    // than disabling the check outright.
    allowedHosts: [".trycloudflare.com"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
