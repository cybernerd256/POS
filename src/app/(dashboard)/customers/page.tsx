"use client";

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Search, Plus, Trash2, Mail, Phone, Users } from 'lucide-react';
import { CustomerSelectorModal } from '@/components/pos/CustomerSelectorModal';

export default function CustomersPage() {
    const customers = useLiveQuery(() => db.customers.toArray()) || [];
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete customer ${name}?`)) {
            await db.customers.delete(id);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Customers
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage customer profiles and loyalty points</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-border flex gap-4 bg-elevated/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, phone, or email..."
                            className="w-full bg-base border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-base sticky top-0 border-b border-border z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Customer Name</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Contact Info</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Loyalty Points</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 bg-elevated">
                                                <Users className="w-5 h-5 text-muted-foreground opacity-50" />
                                            </div>
                                            <p className="font-semibold text-foreground">No customers found</p>
                                            <p className="text-sm mt-1">Adjust your search or add a new customer.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id} className="border-b border-border hover:bg-elevated/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs uppercase border border-primary/30">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <p className="font-bold text-foreground">{c.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-muted-foreground text-xs">
                                                {c.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span> : <span className="italic text-muted-foreground/50">No phone</span>}
                                                {c.email ? <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span> : <span className="italic text-muted-foreground/50">No email</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-xs">
                                                <span>{c.points}</span> <span>pts</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-danger hover:border-danger/50 transition-colors tooltip" title="Delete">
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

            {isModalOpen && (
                <CustomerSelectorModal
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
