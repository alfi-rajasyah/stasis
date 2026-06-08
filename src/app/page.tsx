'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = trpc.dashboard.getSummary.useQuery();
  const [insight, setInsight] = useState<string | null>(null);

  const income = data?.income ?? 0;
  const committed = data?.committed ?? 0;
  const free = data?.free ?? 0;
  const committedPercent = data?.committedPercent;
  const upcomingDues = data?.upcomingDues ?? [];
  const debts = data?.debts ?? [];

  useEffect(() => {
    if (!data) return;
    const tips: string[] = [];
    if (committedPercent && committedPercent > 50) {
      tips.push(`${committedPercent}% of your income is committed. Consider reviewing subscriptions.`);
    }
    if (free > 0) {
      tips.push(`You have ${formatIDR(free)} free this month.`);
    }
    if (debts.length > 0) {
      const d = debts[0];
      if (d.monthsRemaining) {
        tips.push(`"${d.name}" will be paid off in ~${d.monthsRemaining} months.`);
      }
    }
    setInsight(tips.length > 0 ? tips[Math.floor(Math.random() * tips.length)] : null);
  }, [data, committedPercent, free, debts]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 animate-pulse space-y-3">
            <div className="h-4 bg-white/[0.06] rounded w-1/3" />
            <div className="h-8 bg-white/[0.06] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md px-5 py-8 pb-28 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{data?.month}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Overview</h1>
      </div>

      {/* Income Card */}
      <div className="rounded-2xl bg-emerald-500/[0.04] ring-1 ring-emerald-500/[0.08] p-5 space-y-2">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Income</p>
        <p className="text-4xl font-light tracking-tighter">{formatIDR(income)}</p>
        <p className="text-xs text-white/30">Total monthly income</p>
      </div>

      {/* Committed Card */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Committed</p>
          <p className="text-xs font-medium text-white/40">{committedPercent !== null ? `${committedPercent}%` : '—'}</p>
        </div>
        <p className="text-4xl font-light tracking-tighter">{formatIDR(committed)}</p>
        <div className="h-1 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-white/20 transition-all duration-500"
            style={{ width: `${committedPercent ?? 0}%` }}
          />
        </div>
      </div>

      {/* Free Cash Card */}
      <div
        className={`rounded-2xl ring-1 p-5 space-y-2 ${
          free > 0
            ? 'bg-emerald-500/[0.04] ring-emerald-500/[0.08]'
            : 'bg-red-500/[0.04] ring-red-500/[0.08]'
        }`}
      >
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Free to Spend</p>
        <p className={`text-4xl font-light tracking-tighter ${free <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {formatIDR(free)}
        </p>
        <p className="text-xs text-white/30">After commitments</p>
      </div>

      {/* Upcoming */}
      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-5">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Upcoming</p>
        {upcomingDues.length > 0 ? (
          <div className="space-y-2">
            {upcomingDues.slice(0, 5).map((due: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white/70 truncate mr-2">{due.name}</span>
                <span className="text-white/50 flex-shrink-0">
                  {due.type === 'subscription' ? formatIDR(due.amount) : formatIDR(due.amount)} · {new Date(due.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30">No upcoming dues this week</p>
        )}
      </div>

      {/* Debts */}
      <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-5">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Debts</p>
        {debts.length > 0 ? (
          <div className="space-y-3">
            {debts.map((debt: any) => (
              <div key={debt.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{debt.name}</span>
                  <span className="text-white/50">{formatIDR(debt.remainingAmount)}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${debt.progressPercent}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>{debt.progressPercent}% paid</span>
                  {debt.monthsRemaining && <span>~{debt.monthsRemaining} months left</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30">No active debts</p>
        )}
      </div>

      {/* AI Insights */}
      {insight && (
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-5">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/60 leading-relaxed">{insight}</p>
          </div>
        </div>
      )}

      {/* Floating AI */}
      <Link
        href="/chat"
        className="fixed bottom-24 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.06] backdrop-blur-md ring-1 ring-white/[0.06] hover:bg-white/[0.10] transition-all duration-200 cursor-pointer"
      >
        <Sparkles size={20} className="text-emerald-400" />
      </Link>
    </div>
  );
}
