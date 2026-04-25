'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AgentsListe() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    async function fetchAgents() {
      const { data } = await supabase.from('agents').select('*');
      setAgents(data || []);
    }
    fetchAgents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Agents ({agents.length})</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Email</th><th>Nom</th><th>Prénom</th><th>Spécialité</th><th>Salaire</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(a => (
            <tr key={a.id}>
              <td>{a.email}</td>
              <td>{a.nom}</td>
              <td>{a.prenom}</td>
              <td>{a.specialite}</td>
              <td>€{a.salaire_brut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
