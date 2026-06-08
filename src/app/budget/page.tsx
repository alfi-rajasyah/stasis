'use client';

import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Wallet, TrendingUp, AlertTriangle, CircleCheck, Pencil } from 'lucide-react';

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
      <div className="container mx-auto px-6 py-8 pb-20 space-y-4 max-w-2xl">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass animate-pulse">
            <CardHeader><div className="h-5 bg-muted rounded w-1/3" /></CardHeader>
            <CardContent><div className="h-8 bg-muted rounded w-1/2" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 pb-20 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
        <span className="text-sm text-muted-foreground font-medium">{budget?.month}</span>
      </div>

      {/* Income Summary */}
      <Card className="glass border-l-[3px] border-l-emerald-500 transition-shadow duration-200 hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Income</CardTitle>
          <Wallet size={18} className="text-emerald-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">{formatIDR(totalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total income this month</p>
        </CardContent>
      </Card>

      {/* Warning / Success Banner */}
      {totalAllocated > totalIncome && totalIncome > 0 && (
        <div className="glass border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">Budget Exceeded</p>
            <p className="text-sm text-muted-foreground">
              Allocated {formatIDR(totalAllocated)} of {formatIDR(totalIncome)}. Reduce by {formatIDR(totalAllocated - totalIncome)}.
            </p>
          </div>
        </div>
      )}
      {remaining >= 0 && totalIncome > 0 && (
        <div className="glass border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <CircleCheck size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIDR(remaining)} remaining</p>
            <p className="text-sm text-muted-foreground">After all allocations this month</p>
          </div>
        </div>
      )}

      {/* Category Allocations */}
      <Card className="glass transition-shadow duration-200 hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Allocations</CardTitle>
          <TrendingUp size={18} className="text-blue-600" />
        </CardHeader>
        <CardContent className="space-y-5">
          {budget?.categories.map((cat) => {
            const pct = totalIncome > 0 ? Math.min(100, Math.round((cat.allocated / totalIncome) * 100)) : 0;
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-sm">{cat.name}</span>
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
                        className="w-28 h-8 text-sm text-right"
                        autoFocus
                        min={0}
                        disabled={setAllocation.isPending}
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingId(cat.id); setEditValue(String(cat.allocated)); }}
                        className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors duration-200 cursor-pointer group"
                      >
                        {formatIDR(cat.allocated)}
                        <Pencil size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                </div>
                <Progress value={pct} className="h-1.5 [&>div]:bg-blue-600" />
                <p className="text-[11px] text-muted-foreground text-right">{pct}% of income</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
