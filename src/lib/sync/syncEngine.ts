import { db, Transaction, Product, SyncQueue } from '../db/dexie';
import { supabase } from '../db/supabase';

export class SyncEngine {
    static async processQueue() {
        // drain syncQueue -> Supabase 
        const queueItems = await db.syncQueue.orderBy('id').toArray();

        for (const item of queueItems) {
            if (!item.id) continue;

            try {
                if (item.operation === 'insert') {
                    const { error } = await supabase.from(item.table).insert(item.payload);
                    if (error) throw error;
                } else if (item.operation === 'update') {
                    // Update logic (assuming payload contains id)
                    const payloadAny = item.payload as any;
                    if (payloadAny.id) {
                        const { error } = await supabase.from(item.table).update(item.payload).eq('id', payloadAny.id);
                        if (error) throw error;
                    }
                } else if (item.operation === 'delete') {
                    // Delete logic
                    const payloadAny = item.payload as any;
                    if (payloadAny.id) {
                        const { error } = await supabase.from(item.table).delete().eq('id', payloadAny.id);
                        if (error) throw error;
                    }
                }

                // Remove from queue upon success
                await db.syncQueue.delete(item.id);

                // Mark the actual record as synced in local DB
                if (item.table === 'transactions') {
                    const payloadAny = item.payload as any;
                    if (payloadAny.id) {
                        await db.transactions.update(payloadAny.id, { synced: true });
                    }
                }
            } catch (error) {
                console.error(`Sync failed for queue item ${item.id}`, error);
                await db.syncQueue.update(item.id, { attempts: item.attempts + 1 });
            }
        }
    }

    static async pullLatest(_branchId: string) {
        // fetch server updates -> IndexedDB (placeholder for now)
    }

    static async pushTransaction(tx: Transaction) {
        // Always write to IndexedDB first
        try {
            await db.transactions.put({ ...tx, synced: false });

            // Add to SyncQueue
            await db.syncQueue.add({
                table: 'transactions',
                operation: 'insert',
                payload: tx,
                attempts: 0,
                created_at: new Date().toISOString()
            });

            // Attempt to process queue immediately if online
            if (typeof navigator !== 'undefined' && navigator.onLine) {
                this.processQueue();
            }
        } catch (e) {
            console.error("Failed to push transaction", e);
        }
    }

    static onReconnect() {
        this.processQueue();
    }
}
