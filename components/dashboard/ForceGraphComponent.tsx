'use client';
import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false }) as any;

type Node = { id: string; name: string; type: 'agent' | 'contract'; status?: string; x?: number; y?: number };
type Link = { source: string; target: string; type: string };
type Props = { data: { nodes: Node[]; links: Link[] } };

export default function ForceGraphComponent({ data }: Props) {
  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-300);
      fgRef.current.d3Force('link').distance(100);
    }
  }, [data]);

  const handleNodeClick = (node: Node) => {
    console.log('Nœud cliqué:', node);
    fgRef.current?.centerAt(node.x, node.y, 500);
    fgRef.current?.zoom(3, 500);
  };

  const getNodeColor = (node: Node) => {
    if (node.type === 'agent') return node.status === 'actif' ? '#10b981' : '#ef4444';
    return '#3b82f6';
  };

  const getNodeSize = (node: Node) => (node.type === 'agent' ? 15 : 10);

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--color-background-primary)', borderRadius: '8px' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeColor={getNodeColor}
        nodeVal={getNodeSize}
        nodeLabel={(node: any) => `${node.id} (${node.type})`}
        linkColor={() => 'rgba(0,0,0,0.2)'}
        linkWidth={1}
        onNodeClick={(node: any) => handleNodeClick(node as Node)}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D) => {
          const size = getNodeSize(node as Node);
          ctx.fillStyle = getNodeColor(node as Node);
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = 'var(--color-text-primary)';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((node.id as string).substring(0, 3), node.x, node.y);
        }}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = getNodeSize(node as Node);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
    </div>
  );
}
