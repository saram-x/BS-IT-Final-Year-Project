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
// milestone: Cleaned up route protection and auth checks

// milestone 0: Refined recruiter dashboard actions and confirmation prompts

// milestone 18: Updated bookmark actions and saved-list counters

// milestone 28: Finished final UX polish and release readiness pass

// milestone 29: Refined recruiter dashboard actions and confirmation prompts
