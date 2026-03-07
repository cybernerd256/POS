"use client";

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction } from '@/lib/db/dexie';
import { Search, Eye } from 'lucide-react';
import { RefundModal } from '@/components/transactions/RefundModal';

export default function TransactionsPage() {
    const transactions = useLiveQuery(() => db.transactions.orderBy('created_at').reverse().toArray()) || [];
    const [search, setSearch] = useState('');
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const filtered = transactions.filter(t =>
        t.id.includes(search) ||
        t.payment_method.includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">Transactions</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">View history, reprints, and manager refunds</p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-border flex gap-4 bg-elevated/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by receipt ID or payment..."
                            className="w-full bg-base border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-base sticky top-0 border-b border-border z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Receipt ID</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Date & Time</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Amount (UGX)</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Method</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.id} className="border-b border-border hover:bg-elevated/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-mono font-bold text-foreground">{t.id.split('-')[0].toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">{t.items.length} items</p>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(t.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-primary">
                                            {new Intl.NumberFormat('en-UG').format(t.total)}
                                            {t.total < 0 && <span className="ml-2 text-[10px] text-danger bg-danger/10 px-1.5 py-0.5 rounded border border-danger/20">REFUNDED</span>}
                                        </td>
                                        <td className="px-6 py-4 uppercase text-xs font-bold tracking-wider">
                                            {t.payment_method.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedTx(t)}
                                                className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-primary transition-colors tooltip mr-2"
                                                title="View Details & Refund"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTx && (
                <RefundModal
                    transaction={selectedTx}
                    onClose={() => setSelectedTx(null)}
                />
            )}
        </div>
    );
}
