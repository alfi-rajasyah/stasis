'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { Swipeable } from '@/components/swipeable';

import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [model, setModel] = useState('deepseek-chat');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversations } = trpc.ai.conversations.useQuery();
  const createConv = trpc.ai.createConversation.useMutation();
  const { data: activeConv } = trpc.ai.conversation.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );
  const addMsg = trpc.ai.addMessages.useMutation();
  const deleteConv = trpc.ai.deleteConversation.useMutation();
  const { data: modelSetting } = trpc.ai.getSetting.useQuery({ key: 'ai_model' });
  const setModelSetting = trpc.ai.setSetting.useMutation();
  const utils = trpc.useUtils();

  // Sync messages from backend when switching conversations
  useEffect(() => {
    if (activeConv?.messages) {
      setMessages(activeConv.messages);
    }
  }, [activeConv]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load persisted model preference
  useEffect(() => {
    if (modelSetting?.value) {
      setModel(modelSetting.value);
    }
  }, [modelSetting]);

  const startNew = async () => {
    const conv = await createConv.mutateAsync();
    setConversationId(conv.id);
    setMessages([]);
    utils.ai.conversations.invalidate();
    toast.success('New conversation started');
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userContent = input;
    const userMsg: Message = { role: 'user', content: userContent };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
        }
      }

      // Save messages to backend after stream completes
      if (conversationId && assistantContent) {
        await addMsg.mutateAsync({
          conversationId,
          messages: [
            { role: 'user', content: userContent },
            { role: 'assistant', content: assistantContent },
          ],
        });
        utils.ai.conversations.invalidate();
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setLoading(false);
      utils.dashboard.getSummary.invalidate();
      utils.subscriptions.list.invalidate();
      utils.recurringBills.list.invalidate();
      utils.debts.list.invalidate();
    }
  };

  // --- No conversation selected — show conversation list ---
  if (!conversationId) {
    return (
      <div className="mx-auto max-w-md px-5 py-8 pb-28 animate-fade-in">
        <div className="pt-2 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">AI Chat</h1>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1">
            Assistant
          </p>
        </div>

        {/* Empty state */}
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-12 text-center space-y-4 mb-4">
          <Sparkles size={40} className="mx-auto text-emerald-400" />
          <p className="text-lg font-medium text-white/80">Ask Stasis anything</p>
          <p className="text-sm text-white/40">
            Add data, get insights, or ask questions about your finances
          </p>
          <button
            onClick={startNew}
            disabled={createConv.isPending}
            className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 px-6 py-2.5 text-sm font-medium hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createConv.isPending ? 'Creating...' : 'Start Chat'}
          </button>
        </div>

        {/* Previous conversations */}
        {conversations && conversations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/30 uppercase tracking-wider px-1">
              Recent
            </p>
            {conversations.map(c => (
              <Swipeable
                key={c.id}
                onDelete={async () => {
                  await deleteConv.mutateAsync({ conversationId: c.id });
                  if (c.id === conversationId) {
                    setConversationId(null);
                    setMessages([]);
                  }
                  utils.ai.conversations.invalidate();
                  toast.success('Conversation deleted');
                }}
              >
                <button
                  onClick={() => setConversationId(c.id)}
                  className="w-full rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.04] p-4 text-left hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <p className="text-sm text-white/60">
                    {c.title || 'New conversation'}
                  </p>
                  <p className="text-xs text-white/20 mt-1">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </button>
              </Swipeable>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Active conversation - chat view ---
  return (
    <div className="mx-auto max-w-md h-dvh flex flex-col pb-28 animate-fade-in">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.04] shrink-0">
        <button
          onClick={() => {
            setConversationId(null);
            setMessages([]);
          }}
          className="text-white/40 hover:text-white/60 transition-all cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-medium text-white/60">AI Assistant</h2>
        <div className="flex items-center gap-2">
          <input
            value={model}
            onChange={e => {
              setModel(e.target.value);
              setModelSetting.mutate({ key: 'ai_model', value: e.target.value });
            }}
            placeholder="deepseek-chat"
            className="w-28 bg-white/[0.04] ring-1 ring-white/[0.06] rounded-lg px-2 py-1 text-xs text-white/80 placeholder:text-white/20 outline-none focus:ring-white/[0.12] transition-all"
          />
          <button onClick={startNew} disabled={createConv.isPending} className="text-white/40 hover:text-white/60 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            <Plus size={20}/>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-anchor-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-50'
                  : 'bg-white/[0.03] ring-1 ring-white/[0.05] text-white/80'
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex gap-1 items-center h-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </span>
              ) : msg.content)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex items-center gap-2 bg-white/[0.03] ring-1 ring-white/[0.06] rounded-2xl px-4 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything or add data..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30 transition-all cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
