"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMissionSignal } from "@/services/signalService";
import {
  hasCompletedAgentLead,
  getEntrepriseId,
  getAgentDisplayName,
  LS_ENTREPRISE_NOM,
} from "@/lib/agentSession";

export default function MissionPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [nom, setNom] = useState("");

  useEffect(() => {
    if (!hasCompletedAgentLead()) {
      router.replace("/");
      return;
    }
    const eid = getEntrepriseId();
    if (!eid) {
      router.replace("/agent/activate");
      return;
    }
    setNom(localStorage.getItem(LS_ENTREPRISE_NOM) || "Inconnue");
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0A1F2F] flex flex-col items-center justify-center">
        <p className="text-[#00D1FF] animate-pulse font-bold tracking-widest uppercase">
          Initialisation…
        </p>
      </div>
    );
  }

  const alerterPC = () => {
    const eid = getEntrepriseId();
    if (!eid) {
      router.replace("/agent/activate");
      return;
    }
    if (!hasCompletedAgentLead()) {
      router.replace("/");
      return;
    }
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const id = getEntrepriseId();
        if (!id) {
          router.replace("/agent/activate");
          return;
        }

        const nameFromSession = getAgentDisplayName() || "Agent";
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const reportData = [
          {
            description: "Alerte manuelle",
            type: "alarm",
            agent_name: nameFromSession,
            latitude: lat,
            longitude: lng,
          },
        ];
        console.log("Sending data:", reportData);
        const result = await sendMissionSignal({
          latitude: lat,
          longitude: lng,
          agent_name: nameFromSession,
        });

        if (!result.ok) {
          if (!getEntrepriseId()) {
            router.replace("/agent/activate");
            return;
          }
          if (!hasCompletedAgentLead()) {
            router.replace("/");
            return;
          }
          alert(
            `Erreur d’envoi du signal (Supabase):\n\n${result.message}`
          );
          return;
        }
        router.push("/dashboard");
      },
      () => {
        alert(
          "Activez la géolocalisation pour envoyer la position avec l’alerte."
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1F2F] text-white p-6 flex flex-col items-center justify-center">
      <p className="text-gray-400 mb-2">
        ENTREPRISE : <span className="text-[#00D1FF]">{nom}</span>
      </p>

      <button
        type="button"
        onClick={alerterPC}
        className="w-64 h-64 bg-red-600 rounded-full border-8 border-red-900 shadow-[0_0_50px_rgba(255,0,0,0.4)] active:scale-90 transition-all flex flex-col items-center justify-center"
      >
        <span className="text-6xl mb-2">🚨</span>
        <span className="font-black text-xl">ALERTE PC</span>
      </button>

      <p className="mt-10 text-xs text-gray-500 italic text-center">
        Votre position GPS est transmise en temps réel <br /> au Dashboard de{" "}
        {nom}.
      </p>
    </div>
  );
}
