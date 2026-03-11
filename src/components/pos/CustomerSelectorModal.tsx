"use client";

import { useState } from 'react';
import { db, Customer } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Search, CheckCircle2 } from 'lucide-react';
import { usePosStore } from '@/store/posStore';

export function CustomerSelectorModal({ onClose }: { onClose: () => void }) {
    const [search, setSearch] = useState('');
    const customers = useLiveQuery(() =>
        db.customers
            .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone?.includes(search) ?? false))
            .toArray()
    ) || [];

    const setCustomer = usePosStore(s => s.setCustomer);

    const [isCreating, setIsCreating] = useState(false);
    const [newCust, setNewCust] = useState({ name: '', phone: '' });

    const handleSelect = (c: Customer) => {
        setCustomer(c);
        onClose();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCust.name || !newCust.phone) return;

        const customer: Customer = {
            id: crypto.randomUUID(),
            name: newCust.name,
            phone: newCust.phone,
            branch_id: 'mock-branch',
            synced: false,
            points: 0
        };

        await db.customers.add(customer);
        setCustomer(customer);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-elevated">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        Customer Selector
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-danger">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-auto flex flex-col gap-4">
                    {!isCreating ? (
                        <>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search name or phone..."
                                        className="w-full bg-base border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="bg-elevated border border-border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/5"
                                >
                                    New
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {customers.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelect(c)}
                                        className="flex justify-between items-center text-left bg-base p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{c.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{c.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                                                {c.points} pts
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {customers.length === 0 && search && (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        No customers found. <button onClick={() => setIsCreating(true)} className="text-primary hover:underline">Create new?</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Full Name</label>
                                <input required value={newCust.name} onChange={e => setNewCust({ ...newCust, name: e.target.value })} className="w-full bg-base border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 ring-primary" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Phone Number</label>
                                <input required type="tel" value={newCust.phone} onChange={e => setNewCust({ ...newCust, phone: e.target.value })} className="w-full bg-base border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 ring-primary" placeholder="07XX XXX XXX" />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-elevated py-2.5 rounded-lg border border-border font-semibold text-muted-foreground hover:bg-white/5 text-sm">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90">
                                    <CheckCircle2 className="w-4 h-4" /> Create & Select
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
