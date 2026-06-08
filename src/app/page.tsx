'use client';

import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function DashboardPage() {
  const { data, isLoading } = trpc.dashboard.getSummary.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-20 space-y-4">
        {[1, 2, 3].map((i) => (
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

  const income = data?.income ?? 0;
  const committed = data?.committed ?? 0;
  const free = data?.free ?? 0;
  const committedPercent = data?.committedPercent;

  return (
    <div className="container mx-auto px-4 py-8 pb-20 space-y-6">
      {/* Month Header */}
      <h1 className="text-2xl font-bold">{data?.month ?? 'Loading...'}</h1>

      {/* Income Card */}
      <Card className="border-l-4 border-l-[#22C55E]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">💰 Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatIDR(income)}</p>
          <p className="text-xs text-muted-foreground">Total monthly income</p>
        </CardContent>
      </Card>

      {/* Committed Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">📊 Committed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold">{formatIDR(committed)}</p>
          <Progress value={committedPercent ?? 0} className="h-2.5" />
          <p className="text-xs text-muted-foreground">
            {committedPercent !== null
              ? `${committedPercent}% of income`
              : '—% of income'}
          </p>
        </CardContent>
      </Card>

      {/* Free Cash Card */}
      <Card
        className={`border-l-4 ${free > 0 ? 'border-l-[#22C55E]' : 'border-l-[#EF4444]'}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">✅ Free Cash</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${free > 0 ? '' : 'text-destructive'}`}
          >
            {formatIDR(free)}
          </p>
          <p className="text-xs text-muted-foreground">
            Remaining after commitments
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Dues Section */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No upcoming dues. Add subscriptions and bills in Trackers (Sprint 2).
          </p>
        </CardContent>
      </Card>

      {/* Debt Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>📉 Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No active debts. Add debts in Trackers (Sprint 2).
          </p>
        </CardContent>
      </Card>

      {/* Floating AI Button */}
      <Link
        href="/chat"
        className="fixed bottom-20 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      >
        🤖
      </Link>
    </div>
  );
}
