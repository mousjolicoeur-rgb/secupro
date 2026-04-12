"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

// L.icon() déplacé à l'intérieur du composant (voir ci-dessous)
// → évite l'exécution au niveau module avant que le DOM soit prêt

export default function MapRadar() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const center: [number, number] = [48.8566, 2.3522];

  // Garde anti-crash : on attend que le composant soit réellement
  // attaché au DOM avant de laisser Leaflet appeler addEventListener
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchActiveAgents = async () => {
      const { data } = await supabase
        .from("vacations")
        .select("*")
        .eq("statut", "confirmed");
      if (data) setAgents(data);
    };

    fetchActiveAgents();

    const channel = supabase
      .channel("realtime-vacations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vacations" },
        (payload) => {
          setAgents((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // L.icon() instancié ici : le module Leaflet est déjà chargé côté client,
  // le container DOM existe, pas de risque de null.addEventListener
  const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  if (!isMounted) {
    return (
      <div className="h-[450px] w-full bg-white/5 animate-pulse rounded-[2.5rem]" />
    );
  }

  return (
    <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-white/10">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
        />
        {agents.map((agent) => (
          <Marker
            key={agent.id}
            position={[agent.latitude || 48.8566, agent.longitude || 2.3522]}
            icon={icon}
          >
            <Popup>
              <div className="text-black">
                <strong>Agent:</strong> {agent.user_id}
                <br />
                <strong>Site:</strong> {agent.site}
                <br />
                <strong>Statut:</strong> En service ✅
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
