'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ClipboardList, MessageSquare, Settings } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/budget', label: 'Budget', Icon: Wallet },
  { href: '/trackers', label: 'Trackers', Icon: ClipboardList },
  { href: '/chat', label: 'AI Chat', Icon: MessageSquare },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t px-2 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-h-[52px] py-1.5 px-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
