'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ClipboardList, MessageSquare, Settings } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', Icon: LayoutDashboard },
  { href: '/budget', label: 'Budget', Icon: Wallet },
  { href: '/trackers', label: 'Trackers', Icon: ClipboardList },
  { href: '/chat', label: 'Chat', Icon: MessageSquare },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl saturate-150 border-t border-white/[0.04] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto h-[72px] px-2">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive ? '' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {isActive ? (
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
              ) : (
                <Icon size={20} strokeWidth={1.5} />
              )}
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-emerald-400' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
