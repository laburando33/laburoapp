// providers.tsx
"use client";
import {
  SessionContextProvider,
  Session,
} from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const supabaseClient = createPagesBrowserClient();
const queryClient = new QueryClient();

export function Providers({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionContextProvider>
  );
}
