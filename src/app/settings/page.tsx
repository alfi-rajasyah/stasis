import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-6 py-8 pb-20 max-w-2xl">
      <div className="glass rounded-xl border p-12 text-center space-y-4">
        <Settings size={40} className="mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Coming in Sprint 4</p>
      </div>
    </div>
  );
}
