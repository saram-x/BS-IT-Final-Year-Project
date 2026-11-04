import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Vite configuration with React plugin and path aliases
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Set up @ alias for src directory imports
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy API calls to Express backend server
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})