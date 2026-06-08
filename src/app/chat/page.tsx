'use client';

import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-8 pb-28 space-y-5">
      <div className="pt-2 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight mt-1">AI Chat</h1>
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1">Sprint 3</p>
      </div>

      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-4">
        <MessageSquare size={40} className="mx-auto text-white/20" />
        <p className="text-lg font-medium text-white/60">Coming in Sprint 3</p>
        <p className="text-sm text-white/30">AI-powered financial insights on the way</p>
      </div>
    </div>
  );
}
