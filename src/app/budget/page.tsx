'use client';

import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CircleCheck, Pencil, PieChart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BudgetPage() {
  const { data: budget, isLoading: budgetLoading } = trpc.budget.getAll.useQuery();
  const { data: incomeData } = trpc.income.list.useQuery();
  const utils = trpc.useUtils();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const setAllocation = trpc.budget.set.useMutation({
    onSuccess: () => {
      utils.budget.getAll.invalidate();
      utils.dashboard.getSummary.invalidate();
      setEditingId(null);
      toast.success('Budget updated');
    },
    onError: () => {
      setEditingId(null);
    },
  });

  const deleteAllocation = trpc.budget.delete.useMutation({
    onSuccess: () => {
      utils.budget.getAll.invalidate();
      utils.dashboard.getSummary.invalidate();
      toast.success('Allocation removed');
    },
  });

  const handleSave = (categoryId: string) => {
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount < 0) return;
    setAllocation.mutate({ categoryId, allocatedAmount: amount });
  };

  const totalIncome = incomeData?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const totalAllocated = budget?.totalAllocated ?? 0;
  const remaining = totalIncome - totalAllocated;

  if (budgetLoading) {
    return (
      <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5 animate-fade-in">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-8 bg-white/10 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{budget?.month}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Budget</h1>
      </div>

      {/* Income Summary */}
      <div className="rounded-2xl bg-emerald-500/[0.04] ring-1 ring-emerald-500/[0.08] p-5 space-y-2">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Income</p>
        <p className="text-3xl font-light tracking-tighter">{formatIDR(totalIncome)}</p>
        <p className="text-xs text-white/30">Total income this month</p>
      </div>

      {/* Warning / Success Banner */}
      {totalAllocated > totalIncome && totalIncome > 0 && (
        <div className="rounded-2xl bg-red-500/[0.04] ring-1 ring-red-500/[0.08] p-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-400 text-sm">Budget Exceeded</p>
            <p className="text-sm text-white/40 mt-1">
              Allocated {formatIDR(totalAllocated)} of {formatIDR(totalIncome)}. Reduce by{' '}
              {formatIDR(totalAllocated - totalIncome)}.
            </p>
          </div>
        </div>
      )}
      {remaining >= 0 && totalIncome > 0 && (
        <div className="rounded-2xl bg-emerald-500/[0.04] ring-1 ring-emerald-500/[0.08] p-5 flex items-start gap-3">
          <CircleCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-400 text-sm">{formatIDR(remaining)} remaining</p>
            <p className="text-sm text-white/40 mt-1">After all allocations this month</p>
          </div>
        </div>
      )}

      {/* Allocations */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-6">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Allocations</p>
        {!budget?.categories?.length ? (
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-3">
            <PieChart size={36} className="mx-auto text-white/20" />
            <p className="text-sm text-white/40">
              No categories set.{' '}
              <Link href="/settings" className="text-emerald-400 hover:text-emerald-300 underline">
                Add categories in Settings
              </Link>
              .
            </p>
          </div>
        ) : (
          budget?.categories
            .filter((cat, index, self) => self.findIndex(c => c.name === cat.name) === index)
            .map((cat) => {
            const pct = totalIncome > 0 ? Math.min(100, Math.round((cat.allocated / totalIncome) * 100)) : 0;
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium text-white/80">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === cat.id ? (
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSave(cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(cat.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-28 h-8 text-sm text-right bg-white/[0.04] border-white/[0.08]"
                        autoFocus
                        min={0}
                        disabled={setAllocation.isPending}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditValue(String(cat.allocated));
                          }}
                          className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-emerald-400 transition-colors duration-200 cursor-pointer group"
                        >
                          {formatIDR(cat.allocated)}
                          <Pencil size={12} className="text-white/20 group-hover:text-emerald-400/60 transition-colors" />
                        </button>
                        <button
                          onClick={() => deleteAllocation.mutate({ categoryId: cat.id })}
                          className="text-white/20 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                          disabled={deleteAllocation.isPending}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/30 text-right">{pct}% of income</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
