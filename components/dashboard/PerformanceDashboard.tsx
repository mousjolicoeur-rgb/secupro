'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, AlertCircle, Network } from 'lucide-react';
import ForceGraphComponent from './ForceGraphComponent';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type AgentMetric = { name: string; status: string; contracts: number; performance: number; count: number };
type ContractItem = { name: string; value: number };
type PerformanceItem = { day: string; score: number; missions: number };
type GraphData = { nodes: { id: string; name: string; type: string }[]; links: { source: string; target: string; type: string }[] };

export default function PerformanceDashboard() {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetric[]>([]);
  const [contractData, setContractData] = useState<ContractItem[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceItem[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/performance-metrics');
      const data = await response.json();
      setAgentMetrics(data.agentMetrics);
      setContractData(data.contractData);
      setPerformanceData(data.performanceData);
      setGraphData(data.graphData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  const totalAgents = agentMetrics.length;
  const activeAgents = agentMetrics.filter(a => a.status === 'actif').length;
  const totalRevenue = contractData.reduce((sum, c) => sum + c.value, 0);
  const avgPerformance = performanceData.length
    ? (performanceData.reduce((sum, p) => sum + p.score, 0) / performanceData.length).toFixed(1)
    : '0';

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard SecuPRO</h1>
          <p className="text-slate-600 dark:text-slate-400">Suivi en temps réel des performances</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard icon={Users} label="Agents actifs" value={activeAgents} total={totalAgents} color="blue" />
          <KPICard icon={Briefcase} label="Contrats signés" value={contractData.length} color="green" />
          <KPICard icon={TrendingUp} label="Revenu total" value={`€${(totalRevenue / 1000).toFixed(1)}K`} color="amber" />
          <KPICard icon={AlertCircle} label="Performance moyenne" value={`${avgPerformance}%`} color="purple" />
        </div>

        {/* Force Graph */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Network className="w-5 h-5" />
            Réseau agents - contrats
          </h2>
          {graphData.nodes.length > 0 && <ForceGraphComponent data={graphData as any} />}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance (7 derniers jours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score moyen" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="missions" stroke="#10b981" name="Missions" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Distribution des agents</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={agentMetrics} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                  {agentMetrics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top contrats</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contractData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Montant (€)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table des agents */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Liste des agents</h2>
          <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-900 hover:scrollbar-thumb-orange-400">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Contrats</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Performance</th>
                </tr>
              </thead>
              <tbody>
                {agentMetrics.map((agent, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">{agent.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${agent.status === 'actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">{agent.contracts}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${agent.performance}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

type KPICardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  total?: number;
  color: 'blue' | 'green' | 'amber' | 'purple';
};

function KPICard({ icon: Icon, label, value, total, color }: KPICardProps) {
  const colorClass = {
    blue:   'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700',
    green:  'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700',
    amber:  'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700',
    purple: 'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClass[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {total !== undefined && <p className="text-xs opacity-60 mt-1">sur {total}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
}
