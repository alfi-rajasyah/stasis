'use client';

import { trpc } from '@/trpc/client';
import { useState, useEffect } from 'react';
import { Plus, Tag, Globe, Cpu, Info, Trash2, PackageOpen, Pencil, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Swipeable } from '@/components/swipeable';
import { formatIDR } from '@/utils/format';
import { Modal } from '@/components/modal';

function CategoryRow({ cat }: { cat: { id: string; name: string; color: string; type: string } }) {
  const { data: usage } = trpc.categories.getUsage.useQuery({ id: cat.id });
  const deleteCat = trpc.categories.delete.useMutation();
  const utils = trpc.useUtils();

  const badgeParts: string[] = [];
  if (usage?.subscriptions) badgeParts.push(`${usage.subscriptions} sub`);
  if (usage?.bills) badgeParts.push(`${usage.bills} bill${usage.bills !== 1 ? 's' : ''}`);
  if (usage?.debts) badgeParts.push(`${usage.debts} debt${usage.debts !== 1 ? 's' : ''}`);
  if (usage?.income) badgeParts.push(`${usage.income} inc`);
  if (usage?.budget) badgeParts.push(`${usage.budget} budg`);
  const badgeText = badgeParts.join(', ');

  return (
    <Swipeable onDelete={async () => {
      try {
        await deleteCat.mutateAsync({ id: cat.id });
        utils.categories.list.invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'An error occurred');
      }
    }}>
      <div className="flex items-center gap-3 py-2 px-1 bg-[#141417] rounded-2xl">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
        <span className="text-sm text-white/70 flex-1">{cat.name}</span>
        {badgeText && (
          <span className="text-[10px] text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {badgeText}
          </span>
        )}
        <span className="text-xs text-white/30 uppercase">{cat.type}</span>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (!confirm(`Delete "${cat.name}"?`)) return;
            try {
              await deleteCat.mutateAsync({ id: cat.id });
              utils.categories.list.invalidate();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'An error occurred');
            }
          }}
          className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Swipeable>
  );
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function IncomeRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: { id: string; source: string; categoryId: string; category: { id: string; name: string; color: string; type: string }; amount: number; month: string };
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Swipeable onDelete={onDelete}>
      <div className="flex items-center gap-3 py-2 px-1 bg-[#141417] rounded-2xl">
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-medium text-white/80">{entry.source}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.category.color }} />
            <span className="text-xs text-white/40">{entry.category.name}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-emerald-400">{formatIDR(entry.amount)}</p>
          <p className="text-xs text-white/30">{formatMonth(entry.month)}</p>
        </div>
        <button onClick={onEdit}
          className="p-1 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all">
          <Pencil size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </Swipeable>
  );
}

export default function SettingsPage() {
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const addCategory = trpc.categories.add.useMutation();
  const utils = trpc.useUtils();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newColor, setNewColor] = useState('#10B981');
  const [showAdd, setShowAdd] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // ── AI Provider state ──
  const [aiModel, setAiModel] = useState('');
  const [aiSaving, setAiSaving] = useState(false);
  const { data: aiConfig } = trpc.ai.getConfig.useQuery();
  const setAiSetting = trpc.ai.setSetting.useMutation();
  const aiUtils = trpc.useUtils();

  useEffect(() => {
    if (aiConfig) setAiModel(aiConfig.saved.model);
  }, [aiConfig]);

  async function handleAiSave() {
    setAiSaving(true);
    try {
      await setAiSetting.mutateAsync({ key: 'ai_model', value: aiModel });
      aiUtils.ai.getConfig.invalidate();
      toast.success('Model preference saved');
    } catch {
      toast.error('Failed to save');
    } finally { setAiSaving(false); }
  }

  // ── Income state ──
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<{
    id: string;
    source: string;
    categoryId: string;
    amount: number;
    month: string;
  } | null>(null);
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeCategoryId, setIncomeCategoryId] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeMonth, setIncomeMonth] = useState('');

  function resetIncomeForm() {
    setIncomeSource('');
    setIncomeCategoryId('');
    setIncomeAmount('');
    setIncomeMonth('');
  }

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCategory.mutateAsync({ name: newName, type: newType, color: newColor });
    utils.categories.list.invalidate();
    setNewName('');
    setShowAdd(false);
  };

  // ── Income mutations ──
  const { data: incomeEntries } = trpc.income.list.useQuery();
  const incomeAdd = trpc.income.add.useMutation({
    onSuccess: () => {
      toast.success('Income added');
      utils.income.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      resetIncomeForm();
      setShowAddIncome(false);
    },
  });
  const incomeUpdate = trpc.income.update.useMutation({
    onSuccess: () => {
      toast.success('Income updated');
      utils.income.list.invalidate();
      utils.dashboard.getSummary.invalidate();
      resetIncomeForm();
      setEditingIncome(null);
    },
  });
  const incomeDelete = trpc.income.delete.useMutation({
    onSuccess: () => {
      utils.income.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
  });

  function handleIncomeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incomeSource || !incomeCategoryId || !incomeAmount) return;
    const amount = Math.round(parseFloat(incomeAmount));
    if (editingIncome) {
      incomeUpdate.mutate({
        id: editingIncome.id,
        source: incomeSource,
        categoryId: incomeCategoryId,
        amount,
        ...(incomeMonth && { month: incomeMonth }),
      });
    } else {
      incomeAdd.mutate({
        source: incomeSource,
        categoryId: incomeCategoryId,
        amount,
        ...(incomeMonth && { month: incomeMonth }),
      });
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Preferences</h1>
      </div>

      {/* Income */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet size={18} className="text-white/40" />
            <h2 className="text-sm font-medium text-white/60">Income</h2>
          </div>
          <button onClick={() => { resetIncomeForm(); setEditingIncome(null); setShowAddIncome(true); }}
            className="p-1.5 rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-white/40 hover:text-white/60 transition-all cursor-pointer">
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          {!incomeEntries || incomeEntries.length === 0 ? (
            <p className="text-xs text-white/30 py-2 text-center">No income entries this month</p>
          ) : (
            incomeEntries.map(entry => (
              <IncomeRow
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingIncome(entry);
                  setIncomeSource(entry.source);
                  setIncomeCategoryId(entry.categoryId);
                  setIncomeAmount(String(entry.amount));
                  setIncomeMonth(entry.month);
                }}
                onDelete={() => {
                  if (confirm(`Delete income "${entry.source}"?`)) {
                    incomeDelete.mutate({ id: entry.id });
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Currency */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5">
        <div className="flex items-center gap-2.5">
          <Globe size={18} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/60">Currency</h2>
        </div>
        <p className="text-sm text-emerald-400 font-medium mt-3 pl-8">Indonesian Rupiah (IDR)</p>
        <p className="text-xs text-white/30 mt-1 pl-8">All amounts displayed in Rupiah with dot separators</p>
      </div>

      {/* Categories */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setCategoriesOpen(!categoriesOpen)} className="flex items-center gap-2.5 cursor-pointer w-full text-left">
            <Tag size={18} className="text-white/40" />
            <h2 className="text-sm font-medium text-white/60 flex-1">Categories</h2>
            {categoriesOpen ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
          </button>
          {categoriesOpen && (
            <button onClick={() => setShowAdd(!showAdd)}
              className="p-1.5 rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-white/40 hover:text-white/60 transition-all cursor-pointer">
              <Plus size={16} />
            </button>
          )}
        </div>

        {categoriesOpen && (
          <>
        {showAdd && (
          <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04]">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name"
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none" />
            <div className="flex items-center gap-2">
              <select value={newType} onChange={e => setNewType(e.target.value as 'INCOME' | 'EXPENSE')}
                className="bg-white/[0.04] ring-1 ring-white/[0.06] rounded-lg px-3 py-2 text-sm text-white/60 outline-none">
                <option value="EXPENSE" className="bg-[#141417]">Expense</option>
                <option value="INCOME" className="bg-[#141417]">Income</option>
              </select>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-0" />
              <button onClick={handleAdd} disabled={addCategory.isPending}
                className="rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 px-4 py-2 text-sm font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {addCategory.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories && categories.length === 0 ? (
          <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04] p-8 text-center space-y-3">
            <PackageOpen size={32} className="mx-auto text-white/20" />
            <p className="text-sm text-white/40">No categories yet. Add your first one.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {categories?.map(cat => (
              <CategoryRow key={cat.id} cat={cat} />
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* AI Provider */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Cpu size={18} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/60">AI Provider</h2>
        </div>

        <div>
          <label className="text-xs text-white/40 mb-1 block pl-8">Model</label>
          <input
            value={aiModel}
            onChange={e => setAiModel(e.target.value)}
            placeholder={aiConfig?.defaults.model ?? 'deepseek-chat'}
            className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
          />
        </div>

        <p className="text-xs text-white/30 pl-8">Base URL and API key are configured via .env</p>

        <div className="pl-8">
          <button
            onClick={handleAiSave}
            disabled={aiSaving}
            className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 px-4 py-2 text-sm font-medium hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5">
        <div className="flex items-center gap-2.5">
          <Info size={18} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/60">About</h2>
        </div>
        <p className="text-sm text-white/50 mt-3 pl-8">Stasis v1.0</p>
        <p className="text-xs text-white/30 mt-1 pl-8">Personal Finance Manager. Self-hosted. AI-powered.</p>
      </div>

      {/* Income Add/Edit Modal */}
      <Modal
        open={showAddIncome || editingIncome !== null}
        onClose={() => { setShowAddIncome(false); setEditingIncome(null); resetIncomeForm(); }}
        title={editingIncome ? 'Edit Income Entry' : 'Add Income Entry'}
      >
        <form onSubmit={handleIncomeSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Source</label>
            <input value={incomeSource} onChange={e => setIncomeSource(e.target.value)}
              placeholder="Salary, Freelance..."
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all" required />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Category</label>
            <select value={incomeCategoryId} onChange={e => setIncomeCategoryId(e.target.value)}
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all appearance-none" required>
              <option value="">Select category</option>
              {categories?.filter(c => c.type === 'INCOME').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Amount</label>
            <input type="number" min={1} value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)}
              placeholder="5000000"
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all" required />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Month</label>
            <input type="month" value={incomeMonth} onChange={e => setIncomeMonth(e.target.value)}
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:ring-white/[0.12] transition-all" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setShowAddIncome(false); setEditingIncome(null); resetIncomeForm(); }}
              className="flex-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] text-sm text-white/60 px-4 py-2 hover:bg-white/[0.08] transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={incomeAdd.isPending || incomeUpdate.isPending}
              className="flex-1 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/[0.12] text-emerald-400 text-sm px-4 py-2 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40">
              {incomeAdd.isPending || incomeUpdate.isPending ? 'Saving...' : editingIncome ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
