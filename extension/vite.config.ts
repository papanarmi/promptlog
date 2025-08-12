import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "node:path"
import { copyFileSync } from "node:fs"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, ".."), "")
  return {
    plugins: [
      react(),
      {
        name: "copy-manifest",
        writeBundle() {
          try {
            copyFileSync(
              resolve(__dirname, "manifest.json"),
              resolve(__dirname, "../dist-extension/manifest.json"),
            )
          } catch {}
        },
      },
    ],
    build: {
    outDir: resolve(__dirname, "../dist-extension"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.tsx"),
        popup: resolve(__dirname, "src/popup/index.html"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js"
          if (chunk.name === "content") return "content.js"
          return "assets/[name].js"
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "../src"),
        "@/ui": resolve(__dirname, "../src/ui"),
      },
    },
    define: {
      "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      "process.env.VITE_WEB_APP_URL": JSON.stringify(env.VITE_WEB_APP_URL || "http://localhost:5173"),
    },
  }
})


