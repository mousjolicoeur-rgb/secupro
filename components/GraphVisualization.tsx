'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type GraphExport = {
  nodes: { key: string; attributes: Record<string, any> }[];
  edges: { key: string; source: string; target: string; attributes: Record<string, any> }[];
};

export default function GraphVisualization() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/graph')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: GraphExport) => {
        setGraphData({
          nodes: data.nodes.map(n => ({ id: n.key, ...n.attributes })),
          links: data.edges.map(e => ({ source: e.source, target: e.target, ...e.attributes })),
        });
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500 p-4">Erreur : {error}</p>;

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc', borderRadius: 8 }}>
      {graphData ? (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeAutoColorBy="status"
          linkLabel="type"
          width={800}
          height={600}
        />
      ) : (
        <p className="p-4 text-gray-500">Chargement du graphe...</p>
      )}
    </div>
  );
}
