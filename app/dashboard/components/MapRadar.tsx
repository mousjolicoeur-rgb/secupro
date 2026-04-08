"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapRadar() {
  const [agents, setAgents] = useState<any[]>([]); // La liste de tes agents
  const center: [number, number] = [48.8566, 2.3522]; // Paris par défaut

  useEffect(() => {
    // 1. CHARGER LES AGENTS DÉJÀ CONNECTÉS
    const fetchActiveAgents = async () => {
      const { data } = await supabase
        .from('vacations')
        .select('*')
        .eq('statut', 'confirmed'); // On ne prend que ceux qui travaillent
      if (data) setAgents(data);
    };

    fetchActiveAgents();

    // 2. ÉCOUTER LE TERRAIN EN TEMPS RÉEL (LE RADAR) 🛰️
    const channel = supabase
      .channel('realtime-vacations')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'vacations' }, 
        (payload) => {
          // DES QU'UN AGENT POINTE, IL APPARAÎT SUR LA CARTE !
          setAgents((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-white/10">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        {agents.map((agent) => (
          <Marker 
            key={agent.id} 
            // 📍 ON UTILISE LES VRAIES COORDONNÉES ENVOYÉES PAR L'AGENT !
            position={[agent.latitude || 48.8566, agent.longitude || 2.3522]} 
            icon={icon}
          >
            <Popup>
              <div className="text-black">
                <strong>Agent:</strong> {agent.user_id}<br/>
                <strong>Site:</strong> {agent.site}<br/>
                <strong>Statut:</strong> En service ✅
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}