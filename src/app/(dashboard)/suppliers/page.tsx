"use client";

import { useState } from 'react';
import { db } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/store/appStore';
import { Search, Plus, Trash2, Phone, Mail, Truck } from 'lucide-react';

export default function SuppliersPage() {
    const { activeBranch } = useAppStore();
    const suppliers = useLiveQuery(() => db.suppliers.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];
    const [search, setSearch] = useState('');

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_name && s.contact_name.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete supplier ${name}?`)) {
            await db.suppliers.delete(id);
        }
    };

    // A quick mock add function for testing without building a full modal right now.
    const handleMockAdd = async () => {
        const name = prompt("Supplier Company Name:");
        if (!name) return;

        await db.suppliers.add({
            id: crypto.randomUUID(),
            name,
            contact_name: "Manager",
            phone: "+256 700 000 000",
            email: "sales@" + name.replace(/\s+/g, '').toLowerCase() + ".com",
            address: "Kampala Industrial Area",
            branch_id: activeBranch.id,
            synced: false
        });
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <Truck className="w-6 h-6 text-primary" />
                        Suppliers
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage wholesale distributors and purchase orders</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="bg-elevated border border-border text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white/5 transition-colors whitespace-nowrap"
                    >
                        View Purchase Orders
                    </button>
                    <button
                        onClick={handleMockAdd}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Quick Add
                    </button>
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
                            placeholder="Search suppliers by name or contact person..."
                            className="w-full bg-base border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-base sticky top-0 border-b border-border z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Supplier Name</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Contact Person</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Contact Details</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No suppliers found. Add your first wholesale distributor.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s.id} className="border-b border-border hover:bg-elevated/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary/20 text-primary font-bold flex items-center justify-center text-xs uppercase border border-primary/30">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <p className="font-bold text-foreground">{s.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {s.contact_name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                                                {s.phone ? <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {s.phone}</span> : null}
                                                {s.email ? <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {s.email}</span> : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-danger hover:border-danger/50 transition-colors tooltip" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
