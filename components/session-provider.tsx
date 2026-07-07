"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile, supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

type SessionContextValue = {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  profile: null,
  loading: true,
  refresh: async () => {}
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const current = await getCurrentProfile();
    setProfile(current);
    setLoading(false);
    if (!current) {
      router.replace("/auth?mode=login");
    }
  }, [router]);

  useEffect(() => {
    loadProfile();

    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  return (
    <SessionContext.Provider value={{ profile, loading, refresh: loadProfile }}>
      {children}
    </SessionContext.Provider>
  );
}