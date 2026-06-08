"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2">
      <WifiOff size={14} className="text-amber-400" />
      <span className="text-xs text-amber-400 font-medium">
        You&apos;re offline. Changes sync when connected.
      </span>
    </div>
  );
}
