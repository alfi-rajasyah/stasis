import { ClipboardList } from 'lucide-react';

export default function TrackersPage() {
  return (
    <div className="container mx-auto px-6 py-8 pb-20 max-w-2xl">
      <div className="glass rounded-xl border p-12 text-center space-y-4">
        <ClipboardList size={40} className="mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Trackers</h1>
        <p className="text-muted-foreground">Coming in Sprint 2</p>
      </div>
    </div>
  );
}
