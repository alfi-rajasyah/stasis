'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { Plus, Tag, Globe, Cpu, Info, Trash2, Download } from 'lucide-react';
import { Swipeable } from '@/components/swipeable';

export default function SettingsPage() {
  const { data: categories } = trpc.categories.list.useQuery();
  const addCategory = trpc.categories.add.useMutation();
  const deleteCat = trpc.categories.delete.useMutation();
  const utils = trpc.useUtils();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newColor, setNewColor] = useState('#10B981');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCategory.mutateAsync({ name: newName, type: newType, color: newColor });
    utils.categories.list.invalidate();
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="mx-auto max-w-md px-5 py-8 pb-28 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="pt-2 pb-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Preferences</h1>
      </div>

      {/* Categories */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Tag size={18} className="text-white/40" />
            <h2 className="text-sm font-medium text-white/60">Categories</h2>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="p-1.5 rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-white/40 hover:text-white/60 transition-all cursor-pointer">
            <Plus size={16} />
          </button>
        </div>

        {showAdd && (
          <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.04]">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name"
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none" />
            <div className="flex items-center gap-2">
              <select value={newType} onChange={e => setNewType(e.target.value as any)}
                className="bg-white/[0.04] ring-1 ring-white/[0.06] rounded-lg px-3 py-2 text-sm text-white/60 outline-none">
                <option value="EXPENSE" className="bg-[#141417]">Expense</option>
                <option value="INCOME" className="bg-[#141417]">Income</option>
              </select>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-0" />
              <button onClick={handleAdd}
                className="rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 px-4 py-2 text-sm font-medium hover:bg-emerald-500/20 transition-all cursor-pointer">
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {categories?.map(cat => (
            <Swipeable key={cat.id} onDelete={async () => {
              try {
                await deleteCat.mutateAsync({ id: cat.id });
                utils.categories.list.invalidate();
              } catch (e: any) {
                alert(e.message);
              }
            }}>
              <div className="flex items-center gap-3 py-2 px-1 bg-[#141417] rounded-2xl">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-white/70 flex-1">{cat.name}</span>
                <span className="text-xs text-white/30 uppercase">{cat.type}</span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm(`Delete "${cat.name}"?`)) return;
                    try {
                      await deleteCat.mutateAsync({ id: cat.id });
                      utils.categories.list.invalidate();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Swipeable>
          ))}
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

      {/* AI Model */}
      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-5">
        <div className="flex items-center gap-2.5">
          <Cpu size={18} className="text-white/40" />
          <h2 className="text-sm font-medium text-white/60">AI Provider</h2>
        </div>
        <p className="text-sm text-white/50 mt-3 pl-8">DeepSeek V3 (default)</p>
        <p className="text-xs text-white/30 mt-1 pl-8">Supports DeepSeek, OpenAI, and Anthropic. Set keys in .env</p>
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
    </div>
  );
}
