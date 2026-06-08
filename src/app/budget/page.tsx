'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

export default function BudgetPage() {
  const { data: budget, isLoading: budgetLoading } = trpc.budget.getAll.useQuery();
  const { data: incomeData } = trpc.income.list.useQuery();
  const utils = trpc.useUtils();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const setAllocation = trpc.budget.set.useMutation({
    onSuccess: () => {
      utils.budget.getAll.invalidate();
      utils.dashboard.getSummary.invalidate();
      setEditingId(null);
      setEditValue('');
      setEditError(null);
    },
    onError: (err) => {
      setEditError(err.message);
    },
  });

  const handleSave = (categoryId: string) => {
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount < 0) {
      setEditError('Amount must be a non-negative number');
      return;
    }
    setEditError(null);
    setAllocation.mutate({ categoryId, allocatedAmount: amount });
  };

  const totalIncome = incomeData?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const totalAllocated = budget?.totalAllocated ?? 0;
  const remaining = totalIncome - totalAllocated;

  if (budgetLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-20 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 space-y-6">
      {/* Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatIDR(totalIncome)}</p>
          <p className="text-sm text-muted-foreground">Total income this month</p>
        </CardContent>
      </Card>

      {/* Warning Banner */}
      {totalAllocated > totalIncome && totalIncome > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4">
          <p className="font-semibold">⚠️ Allocations exceed income</p>
          <p className="text-sm">
            You've allocated {formatIDR(totalAllocated)} but only have{' '}
            {formatIDR(totalIncome)}. Reduce by{' '}
            {formatIDR(totalAllocated - totalIncome)}.
          </p>
        </div>
      )}
      {remaining >= 0 && totalIncome > 0 && (
        <div className="bg-success/10 border border-success/30 text-success rounded-xl p-4">
          <p className="font-semibold">✅ {formatIDR(remaining)} remaining</p>
          <p className="text-sm">After all allocations this month</p>
        </div>
      )}

      {/* Category Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Allocations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Edit error banner */}
          {editError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
              {editError}
            </div>
          )}

          {budget?.categories.map((cat) => {
            const pct =
              totalIncome > 0
                ? Math.min(100, Math.round((cat.allocated / totalIncome) * 100))
                : 0;
            const isEditing = editingId === cat.id;
            const isSaving = setAllocation.isPending && isEditing;
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          setEditError(null);
                        }}
                        onBlur={() => handleSave(cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(cat.id);
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditValue('');
                            setEditError(null);
                          }
                        }}
                        className="w-32 h-8 text-sm text-right"
                        autoFocus
                        min={0}
                        disabled={isSaving}
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditValue(String(cat.allocated));
                          setEditError(null);
                        }}
                        className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer"
                      >
                        {formatIDR(cat.allocated)}
                      </button>
                    )}
                    {isSaving && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                  </div>
                </div>
                <Progress value={pct} />
                <p className="text-xs text-muted-foreground text-right">
                  {pct}% of income
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
