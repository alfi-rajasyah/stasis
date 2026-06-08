'use client';

import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Wallet, TrendingUp, CircleCheck, AlertTriangle, Landmark, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = trpc.dashboard.getSummary.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 pb-20 space-y-5">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass animate-pulse">
            <CardHeader><div className="h-5 bg-muted rounded w-1/3" /></CardHeader>
            <CardContent><div className="h-8 bg-muted rounded w-1/2" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const income = data?.income ?? 0;
  const committed = data?.committed ?? 0;
  const free = data?.free ?? 0;
  const committedPercent = data?.committedPercent;
  const month = data?.month ?? '';

  return (
    <div className="container mx-auto px-6 py-8 pb-20 space-y-6 max-w-2xl">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{month}</h1>
        <span className="text-sm text-muted-foreground font-medium">Monthly Overview</span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4">
        {/* Income Card */}
        <Card className="glass border-l-[3px] border-l-emerald-500 transition-shadow duration-200 hover:shadow-md cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Income</CardTitle>
            <Wallet size={18} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{formatIDR(income)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total monthly income</p>
          </CardContent>
        </Card>

        {/* Committed Card */}
        <Card className="glass border-l-[3px] border-l-blue-600 transition-shadow duration-200 hover:shadow-md cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Committed</CardTitle>
            <TrendingUp size={18} className="text-blue-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold tracking-tight">{formatIDR(committed)}</p>
            <Progress value={committedPercent ?? 0} className="h-2 [&>div]:bg-blue-600" />
            <p className="text-xs text-muted-foreground">
              {committedPercent !== null ? `${committedPercent}% of income` : '—% of income'}
            </p>
          </CardContent>
        </Card>

        {/* Free Cash Card */}
        <Card className={`glass border-l-[3px] transition-shadow duration-200 hover:shadow-md cursor-pointer ${free > 0 ? 'border-l-emerald-500' : 'border-l-destructive'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Free Cash</CardTitle>
            <CircleCheck size={18} className={free > 0 ? 'text-emerald-500' : 'text-destructive'} />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold tracking-tight ${free <= 0 ? 'text-destructive' : ''}`}>
              {formatIDR(free)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Remaining after commitments</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Dues */}
      <Card className="glass transition-shadow duration-200 hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</CardTitle>
          <AlertTriangle size={18} className="text-amber-500" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming dues. Add subscriptions and bills in Trackers (Sprint 2).
          </p>
        </CardContent>
      </Card>

      {/* Debt Progress */}
      <Card className="glass transition-shadow duration-200 hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Debts</CardTitle>
          <Landmark size={18} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active debts. Add debts in Trackers (Sprint 2).
          </p>
        </CardContent>
      </Card>

      {/* Floating AI Button */}
      <Link
        href="/chat"
        className="fixed bottom-24 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        <Sparkles size={22} />
      </Link>
    </div>
  );
}
