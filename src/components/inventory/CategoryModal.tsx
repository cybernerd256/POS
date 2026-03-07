"use client";

import { useState } from 'react';
import { db, Category } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle2, X, Plus, Trash2, Edit } from 'lucide-react';

export function CategoryModal({ onClose }: { onClose: () => void }) {
    const categories = useLiveQuery(() => db.categories.toArray()) || [];
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editingId) {
            await db.categories.update(editingId, { name: name.trim() });
        } else {
            const cat: Category = {
                id: crypto.randomUUID(),
                name: name.trim(),
                branch_id: 'mock-branch'
            };
            await db.categories.add(cat);
        }
        setEditingId(null);
        setName('');
    };

    const handleDelete = async (id: string, catName: string) => {
        if (confirm(`Delete category "${catName}"? Products in this category will become Uncategorized.`)) {
            await db.categories.delete(id);
            // Reset products in this category
            const products = await db.products.where({ category_id: id }).toArray();
            for (const p of products) {
                await db.products.update(p.id, { category_id: '' });
            }
        }
    };

    const startEdit = (c: Category) => {
        setEditingId(c.id);
        setName(c.name);
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-elevated">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        Categories
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-danger">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-4 flex-1 overflow-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            type="text"
                            placeholder={editingId ? "Edit category name..." : "New category name..."}
                            className="flex-1 bg-base border border-border rounded-lg pl-3 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            {editingId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingId ? 'Save' : 'Add'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setName(''); }}
                                className="bg-elevated border border-border px-3 rounded-lg text-muted-foreground hover:bg-white/5"
                            >
                                Cancel
                            </button>
                        )}
                    </form>

                    <div className="flex flex-col gap-2 mt-4">
                        {categories.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">No categories found.</p>
                        ) : (
                            categories.map(c => (
                                <div key={c.id} className="flex justify-between items-center bg-base p-3 rounded-xl border border-border hover:border-primary/50 transition-colors group">
                                    <p className="font-semibold text-sm text-foreground">{c.name}</p>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(c)} className="p-1.5 hover:text-primary transition-colors tooltip" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 hover:text-danger transition-colors tooltip" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
