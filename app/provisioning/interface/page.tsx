import ProvisioningInterface from '@/components/provisioning/ProvisioningInterface';

export default function ProvisioningInterfacePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10">
          SecuPRO — Provisioning Agents
        </h1>
        <ProvisioningInterface />
      </div>
    </div>
  );
}
