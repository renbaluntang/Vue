import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
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
});
