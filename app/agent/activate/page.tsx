"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Check-in désactivé — redirection directe vers la Fiche Identité Tactique
export default function ActivatePage() {
  const router = useRouter();
  useEffect(() => { router.replace("/agent/profil"); }, [router]);
  return null;
}
