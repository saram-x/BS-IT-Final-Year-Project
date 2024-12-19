import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { shadesOfPurple } from "@clerk/themes";

// Get Clerk authentication key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Validate required environment variable exists
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Render main application with authentication provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
      }}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
// milestone 1: Improved company card consistency and hover behavior

// milestone 4: Improved landing page responsive spacing and hierarchy

// milestone 17: Cleaned up duplicated logic in job and company views

// milestone 30: Improved company card consistency and hover behavior
