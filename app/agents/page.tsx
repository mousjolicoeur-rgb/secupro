import DownloadTemplate from '@/components/dashboard/DownloadTemplate';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-12">
          SecuPRO - Gestion Agents
        </h1>
        <DownloadTemplate />
      </div>
    </div>
  );
}
