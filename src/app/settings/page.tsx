'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-8 pb-28 space-y-5">
      <div className="pt-2 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Settings</h1>
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1">Sprint 4</p>
      </div>

      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-4">
        <Settings size={40} className="mx-auto text-white/20" />
        <p className="text-lg font-medium text-white/60">Coming in Sprint 4</p>
        <p className="text-sm text-white/30">App preferences &amp; account settings on the way</p>
      </div>
    </div>
  );
}
