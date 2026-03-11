"use client";

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db/dexie';

export function OfflineBanner() {
    const isOnline = useOnlineStatus();

    const [pendingSync, setPendingSync] = useState(0);

    useEffect(() => {
        // Check pending syncs periodically
        const interval = setInterval(async () => {
            try {
                const count = await db.syncQueue.count();
                setPendingSync(count);
            } catch {
                // Handle offline db error
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    if (isOnline && pendingSync === 0) return null;

    return (
        <div className={`w-full text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 ${isOnline ? 'bg-teal text-background' : 'bg-danger text-foreground'}`}>
            {isOnline ? (
                <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Online — Syncing {pendingSync} pending items...</span>
                </>
            ) : (
                <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Offline Mode — {pendingSync} operations pending sync</span>
                </>
            )}
        </div>
    );
}
