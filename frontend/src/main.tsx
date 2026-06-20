import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { ClerkProvider } from "@clerk/react";
import { Toaster } from "sonner";
import QueryProvider from "./context/query-provider.tsx";
import "./index.css";
import App from "./App.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in your .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryProvider>
        <NuqsAdapter>
          <App />
        </NuqsAdapter>
        <Toaster />
      </QueryProvider>
    </ClerkProvider>
  </StrictMode>
);