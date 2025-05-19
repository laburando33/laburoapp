// providers.tsx
"use client";
import {
  SessionContextProvider,
  Session,
} from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabaseClient = createPagesBrowserClient();

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
      {children}
    </SessionContextProvider>
  );
}
