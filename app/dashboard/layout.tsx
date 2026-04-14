"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/login");
    });
  }, [router]);

  return <>{children}</>;
}
