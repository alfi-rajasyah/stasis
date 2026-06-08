'use client';

import { trpc } from '@/trpc/client';
import { formatIDR } from '@/utils/format';
import { useState } from 'react';
import {
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  Landmark,
  Zap,
  Receipt,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ───────────────────────────────────────────

function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'USD') return '$' + amount.toLocaleString('en-US');
  return formatIDR(amount);
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function subStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'paused':
      return 'bg-amber-500/10 text-amber-400';
    case 'cancelled':
      return 'bg-white/[0.04] text-white/40';
    default:
      return 'bg-white/[0.04] text-white/40';
  }
}

const billStatusConfig: Record<string, { bg: string; label: string }> = {
  paid: { bg: 'bg-emerald-500/10 text-emerald-400', label: 'Paid' },
  due_soon: { bg: 'bg-amber-500/10 text-amber-400', label: 'Due Soon' },
  overdue: { bg: 'bg-red-500/10 text-red-400', label: 'Overdue' },
  pending: { bg: 'bg-white/[0.04] text-white/40', label: 'Pending' },
};

const TABS = [
  { id: 'subscriptions', label: 'Subscriptions', icon: Zap },
  { id: 'bills', label: 'Bills', icon: Receipt },
  { id: 'debts', label: 'Debts', icon: Landmark },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Page ──────────────────────────────────────────────

export default function TrackersPage() {
  const [activeTab, setActiveTab] = useState<TabId>('subscriptions');
  const utils = trpc.useUtils();

  // ── Queries ──

  const { data: subs, isLoading: subsLoading } = trpc.subscriptions.list.useQuery();
  const { data: bills, isLoading: billsLoading } = trpc.recurringBills.list.useQuery();
  const { data: debts, isLoading: debtsLoading } = trpc.debts.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  // ── Mutations ──

  const subPay = trpc.subscriptions.pay.useMutation({
    onSuccess: () => {
      utils.subscriptions.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  const subCancel = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      utils.subscriptions.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  const subAdd = trpc.subscriptions.add.useMutation({
    onSuccess: () => {
      utils.subscriptions.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      setShowAddSub(false);
      resetSubForm();
    },
  });

  const billToggle = trpc.recurringBills.togglePaid.useMutation({
    onSuccess: () => {
      utils.recurringBills.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  const billAdd = trpc.recurringBills.add.useMutation({
    onSuccess: () => {
      utils.recurringBills.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      setShowAddBill(false);
      resetBillForm();
    },
  });

  const debtPay = trpc.debts.pay.useMutation({
    onSuccess: () => {
      utils.debts.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  const debtAdd = trpc.debts.add.useMutation({
    onSuccess: () => {
      utils.debts.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      setShowAddDebt(false);
      resetDebtForm();
    },
  });

  const deleteSub = trpc.subscriptions.delete.useMutation({
    onSuccess: () => {
      utils.subscriptions.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  const deleteBill = trpc.recurringBills.delete.useMutation({
    onSuccess: () => {
      utils.recurringBills.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  const deleteDebt = trpc.debts.delete.useMutation({
    onSuccess: () => {
      utils.debts.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  // ── Subscriptions dialog state ──

  const [showAddSub, setShowAddSub] = useState(false);
  const [subForm, setSubForm] = useState({
    name: '',
    amount: '',
    currency: 'IDR' as 'IDR' | 'USD',
    billingCycle: 'monthly' as 'monthly' | 'yearly' | 'quarterly',
    nextBillingDate: '',
    categoryId: '',
  });

  function resetSubForm() {
    setSubForm({
      name: '',
      amount: '',
      currency: 'IDR',
      billingCycle: 'monthly',
      nextBillingDate: '',
      categoryId: '',
    });
  }

  function handleSubSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subForm.name || !subForm.amount || !subForm.nextBillingDate || !subForm.categoryId) return;
    subAdd.mutate({
      name: subForm.name,
      amount: Math.round(parseFloat(subForm.amount)),
      currency: subForm.currency,
      billingCycle: subForm.billingCycle,
      nextBillingDate: subForm.nextBillingDate,
      categoryId: subForm.categoryId,
    });
  }

  // ── Bills dialog state ──

  const [showAddBill, setShowAddBill] = useState(false);
  const [billForm, setBillForm] = useState({
    name: '',
    defaultAmount: '',
    dueDay: '',
    categoryId: '',
  });

  function resetBillForm() {
    setBillForm({ name: '', defaultAmount: '', dueDay: '', categoryId: '' });
  }

  function handleBillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!billForm.name || !billForm.defaultAmount || !billForm.dueDay || !billForm.categoryId) return;
    billAdd.mutate({
      name: billForm.name,
      defaultAmount: Math.round(parseFloat(billForm.defaultAmount)),
      dueDay: parseInt(billForm.dueDay, 10),
      categoryId: billForm.categoryId,
    });
  }

  // ── Debts dialog state ──

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [debtForm, setDebtForm] = useState({
    name: '',
    creditor: '',
    principalAmount: '',
    interestRate: '',
    monthlyPayment: '',
    startDate: '',
    categoryId: '',
  });

  function resetDebtForm() {
    setDebtForm({
      name: '',
      creditor: '',
      principalAmount: '',
      interestRate: '',
      monthlyPayment: '',
      startDate: '',
      categoryId: '',
    });
  }

  function handleDebtSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !debtForm.name ||
      !debtForm.creditor ||
      !debtForm.principalAmount ||
      !debtForm.monthlyPayment ||
      !debtForm.startDate ||
      !debtForm.categoryId
    ) return;
    debtAdd.mutate({
      name: debtForm.name,
      creditor: debtForm.creditor,
      principalAmount: Math.round(parseFloat(debtForm.principalAmount)),
      interestRate: parseFloat(debtForm.interestRate) || 0,
      monthlyPayment: Math.round(parseFloat(debtForm.monthlyPayment)),
      startDate: debtForm.startDate,
      categoryId: debtForm.categoryId,
    });
  }

  // ── Loading ──

  const isLoading = subsLoading || billsLoading || debtsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5">
        <div className="pt-2 pb-4">
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-7 w-28 bg-white/10 rounded mt-3 animate-pulse" />
        </div>
        <div className="h-9 bg-white/[0.02] rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-6 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // ── Computed ──

  const monthlyBurn =
    subs
      ?.filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        if (s.billingCycle === 'yearly') return sum + Math.round(s.amount / 12);
        if (s.billingCycle === 'quarterly') return sum + Math.round(s.amount / 3);
        return sum + s.amount;
      }, 0) ?? 0;

  // ───── Render ────────────────────────────────────────

  return (
    <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5">
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Trackers</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Trackers</h1>
      </div>

      {/* Sub-tabs */}
      <div className="flex justify-center gap-1 bg-white/[0.02] rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-all cursor-pointer',
                activeTab === tab.id ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/60'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Subscriptions Tab ── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4 animate-fade-in">
          {/* Monthly Burn */}
          <div className="rounded-2xl bg-emerald-500/[0.04] ring-1 ring-emerald-500/[0.08] p-5 space-y-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Monthly Burn</p>
            <p className="text-3xl font-light tracking-tighter text-emerald-400">
              {formatCurrency(monthlyBurn, 'IDR')}
            </p>
            <p className="text-xs text-white/30">Active subscriptions this month</p>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddSub(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm px-4 py-3 hover:bg-white/[0.08] transition-all cursor-pointer text-white/60 hover:text-white"
          >
            <Plus size={16} />
            Add Subscription
          </button>

          {/* List */}
          {(!subs || subs.length === 0) ? (
            <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-3">
              <CreditCard size={36} className="mx-auto text-white/20" />
              <p className="text-sm text-white/40">No subscriptions yet. Add your first one.</p>
            </div>
          ) : (
            subs.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-4 space-y-3"
              >
                {/* Row 1: name + status */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/80">{sub.name}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[11px] font-medium px-2.5 py-0.5 rounded-full',
                        subStatusColor(sub.status)
                      )}
                    >
                      {sub.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${sub.name}?`)) deleteSub.mutate({ id: sub.id }); }}
                      className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Row 2: amount + cycle */}
                <p className="text-xl font-light tracking-tighter text-white/90">
                  {formatCurrency(sub.amount, sub.currency)}
                  <span className="text-xs font-normal text-white/40 ml-1">
                    /{sub.billingCycle}
                  </span>
                </p>

                {/* Row 3: next billing */}
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Calendar size={12} />
                  Next: {formatDate(sub.nextBillingDate as unknown as string)}
                </div>

                {/* Row 4: actions */}
                {sub.status === 'active' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => subPay.mutate({ subscriptionId: sub.id })}
                      disabled={subPay.isPending && subPay.variables?.subscriptionId === sub.id}
                      className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/[0.12] text-emerald-400 text-sm px-4 py-1.5 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {subPay.isPending && subPay.variables?.subscriptionId === sub.id ? 'Paying...' : 'Pay'}
                    </button>
                    <button
                      onClick={() => subCancel.mutate({ subscriptionId: sub.id })}
                      disabled={subCancel.isPending && subCancel.variables?.subscriptionId === sub.id}
                      className="rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-white/60 text-sm px-4 py-1.5 hover:bg-white/[0.08] transition-all cursor-pointer disabled:opacity-40"
                    >
                      {subCancel.isPending && subCancel.variables?.subscriptionId === sub.id ? '...' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Bills Tab ── */}
      {activeTab === 'bills' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add Button */}
          <button
            onClick={() => setShowAddBill(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm px-4 py-3 hover:bg-white/[0.08] transition-all cursor-pointer text-white/60 hover:text-white"
          >
            <Plus size={16} />
            Add Bill
          </button>

          {/* List */}
          {(!bills || bills.length === 0) ? (
            <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-3">
              <Receipt size={36} className="mx-auto text-white/20" />
              <p className="text-sm text-white/40">No bills yet. Add your first one.</p>
            </div>
          ) : (
            bills.map((bill) => {
              const statusCfg = billStatusConfig[bill.status] ?? billStatusConfig.pending;
              return (
                <button
                  key={bill.id}
                  onClick={() => billToggle.mutate({ billId: bill.id })}
                  disabled={billToggle.isPending && billToggle.variables?.billId === bill.id}
                  className="w-full text-left rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-4 space-y-3 hover:bg-white/[0.05] transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white/80">{bill.name}</p>
                    <div className="flex items-center gap-2">
                      {bill.status === 'paid' ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : (
                        <XCircle size={16} className="text-white/20" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${bill.name}?`)) deleteBill.mutate({ id: bill.id }); }}
                        className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-light tracking-tighter text-white/90">
                      {formatCurrency(bill.defaultAmount, 'IDR')}
                    </p>
                    <span
                      className={cn(
                        'text-[11px] font-medium px-2.5 py-0.5 rounded-full',
                        statusCfg.bg
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Calendar size={12} />
                    Due day: {bill.dueDay}
                    {bill.payment?.paidDate && (
                      <>
                        <span className="text-white/20 mx-1">·</span>
                        Paid {formatDate(bill.payment.paidDate as unknown as string)}
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* ── Debts Tab ── */}
      {activeTab === 'debts' && (
        <div className="space-y-4 animate-fade-in">
          {/* Add Button */}
          <button
            onClick={() => setShowAddDebt(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm px-4 py-3 hover:bg-white/[0.08] transition-all cursor-pointer text-white/60 hover:text-white"
          >
            <Plus size={16} />
            Add Debt
          </button>

          {/* List */}
          {(!debts || debts.length === 0) ? (
            <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-3">
              <Landmark size={36} className="mx-auto text-white/20" />
              <p className="text-sm text-white/40">No debts yet. Add your first one.</p>
            </div>
          ) : (
            debts.map((debt) => (
              <div
                key={debt.id}
                className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-4"
              >
                {/* Name + creditor */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{debt.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{debt.creditor}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${debt.name}?`)) deleteDebt.mutate({ id: debt.id }); }}
                    className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Remaining amount */}
                <p className="text-2xl font-light tracking-tighter text-white/90">
                  {formatCurrency(debt.remainingAmount, 'IDR')}
                  <span className="text-xs font-normal text-white/40 ml-1">remaining</span>
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${debt.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-white/30">
                    <span>{debt.progressPercent}% paid</span>
                    <span>of {formatCurrency(debt.principalAmount, 'IDR')}</span>
                  </div>
                </div>

                {/* Monthly + months remaining */}
                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={12} />
                    {formatCurrency(debt.monthlyPayment, 'IDR')}/mo
                  </div>
                  {debt.monthsRemaining !== null && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {debt.monthsRemaining} month{debt.monthsRemaining !== 1 ? 's' : ''} left
                    </div>
                  )}
                </div>

                {/* Pay button */}
                <button
                  onClick={() => debtPay.mutate({ debtId: debt.id, amount: debt.monthlyPayment })}
                  disabled={debtPay.isPending && debtPay.variables?.debtId === debt.id}
                  className="w-full rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/[0.12] text-emerald-400 text-sm px-4 py-2 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  {debtPay.isPending && debtPay.variables?.debtId === debt.id
                    ? 'Paying...'
                    : `Pay ${formatCurrency(debt.monthlyPayment, 'IDR')}`}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ════ Add Subscription Modal ════ */}
      {showAddSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddSub(false)}
          />
          <div className="relative rounded-2xl bg-[#09090B] ring-1 ring-white/[0.08] p-6 w-[calc(100%-2rem)] max-w-sm space-y-4">
            <p className="text-sm font-medium text-white/80">Add Subscription</p>
            <form onSubmit={handleSubSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs text-white/40 mb-1 block">Name</label>
                <input
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  placeholder="Netflix, Spotify..."
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              {/* Amount */}
              <div>
                <label className="text-xs text-white/40 mb-1 block">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={subForm.amount}
                  onChange={(e) => setSubForm({ ...subForm, amount: e.target.value })}
                  placeholder="150000"
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              {/* Currency + Cycle row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Currency</label>
                  <select
                    value={subForm.currency}
                    onChange={(e) => setSubForm({ ...subForm, currency: e.target.value as 'IDR' | 'USD' })}
                    className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all appearance-none"
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Billing</label>
                  <select
                    value={subForm.billingCycle}
                    onChange={(e) =>
                      setSubForm({
                        ...subForm,
                        billingCycle: e.target.value as 'monthly' | 'yearly' | 'quarterly',
                      })
                    }
                    className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all appearance-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              {/* Next billing */}
              <div>
                <label className="text-xs text-white/40 mb-1 block">Next Billing Date</label>
                <input
                  type="date"
                  value={subForm.nextBillingDate}
                  onChange={(e) => setSubForm({ ...subForm, nextBillingDate: e.target.value })}
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              {/* Category */}
              <div>
                <label className="text-xs text-white/40 mb-1 block">Category</label>
                <select
                  value={subForm.categoryId}
                  onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all appearance-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSub(false)}
                  className="flex-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm text-white/60 px-4 py-2 hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subAdd.isPending}
                  className="flex-1 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/[0.12] text-emerald-400 text-sm px-4 py-2 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  {subAdd.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ Add Bill Modal ════ */}
      {showAddBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddBill(false)}
          />
          <div className="relative rounded-2xl bg-[#09090B] ring-1 ring-white/[0.08] p-6 w-[calc(100%-2rem)] max-w-sm space-y-4">
            <p className="text-sm font-medium text-white/80">Add Bill</p>
            <form onSubmit={handleBillSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Name</label>
                <input
                  value={billForm.name}
                  onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
                  placeholder="Electricity, Rent..."
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={billForm.defaultAmount}
                  onChange={(e) => setBillForm({ ...billForm, defaultAmount: e.target.value })}
                  placeholder="500000"
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Due Day (1-31)</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={billForm.dueDay}
                  onChange={(e) => setBillForm({ ...billForm, dueDay: e.target.value })}
                  placeholder="15"
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Category</label>
                <select
                  value={billForm.categoryId}
                  onChange={(e) => setBillForm({ ...billForm, categoryId: e.target.value })}
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all appearance-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBill(false)}
                  className="flex-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm text-white/60 px-4 py-2 hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={billAdd.isPending}
                  className="flex-1 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/[0.12] text-emerald-400 text-sm px-4 py-2 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  {billAdd.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ Add Debt Modal ════ */}
      {showAddDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddDebt(false)}
          />
          <div className="relative rounded-2xl bg-[#09090B] ring-1 ring-white/[0.08] p-6 w-[calc(100%-2rem)] max-w-sm space-y-4 max-h-[85vh] overflow-y-auto">
            <p className="text-sm font-medium text-white/80">Add Debt</p>
            <form onSubmit={handleDebtSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Name</label>
                <input
                  value={debtForm.name}
                  onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                  placeholder="Car Loan, Student Loan..."
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Creditor</label>
                <input
                  value={debtForm.creditor}
                  onChange={(e) => setDebtForm({ ...debtForm, creditor: e.target.value })}
                  placeholder="Bank Name, Institution..."
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Principal</label>
                  <input
                    type="number"
                    min={1}
                    value={debtForm.principalAmount}
                    onChange={(e) => setDebtForm({ ...debtForm, principalAmount: e.target.value })}
                    placeholder="50000000"
                    className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">Interest %</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={debtForm.interestRate}
                    onChange={(e) => setDebtForm({ ...debtForm, interestRate: e.target.value })}
                    placeholder="5"
                    className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Monthly Payment</label>
                <input
                  type="number"
                  min={1}
                  value={debtForm.monthlyPayment}
                  onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: e.target.value })}
                  placeholder="2000000"
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={debtForm.startDate}
                  onChange={(e) => setDebtForm({ ...debtForm, startDate: e.target.value })}
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Category</label>
                <select
                  value={debtForm.categoryId}
                  onChange={(e) => setDebtForm({ ...debtForm, categoryId: e.target.value })}
                  className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all appearance-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDebt(false)}
                  className="flex-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm text-white/60 px-4 py-2 hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={debtAdd.isPending}
                  className="flex-1 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/[0.12] text-emerald-400 text-sm px-4 py-2 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  {debtAdd.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
