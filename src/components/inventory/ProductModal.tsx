"use client";

import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';
import { db, Product } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarcodeScanner } from '@/components/pos/BarcodeScanner';

interface ProductModalProps {
    product?: Product | null;
    onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
    const categories = useLiveQuery(() => db.categories.toArray()) || [];
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        buying_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        barcode: '',
        category_id: ''
    });
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        if (product) setFormData(product);
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.selling_price) return;

        const payload: Product = {
            id: product?.id || crypto.randomUUID(),
            name: formData.name || '',
            buying_price: Number(formData.buying_price),
            selling_price: Number(formData.selling_price),
            stock_quantity: Number(formData.stock_quantity),
            barcode: formData.barcode || '',
            category_id: formData.category_id || '',
            branch_id: 'mock-branch',
            synced: false,
            updated_at: new Date().toISOString()
        };

        if (product) {
            await db.products.update(product.id, payload);
        } else {
            await db.products.add(payload);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-elevated">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-danger">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-auto">
                    <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Product Name *</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary" placeholder="e.g. Rolex 1kg" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Buying Price (UGX)</label>
                                <input type="number" value={formData.buying_price || ''} onChange={e => setFormData({ ...formData, buying_price: e.target.valueAsNumber })} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Selling Price (UGX) *</label>
                                <input required type="number" value={formData.selling_price || ''} onChange={e => setFormData({ ...formData, selling_price: e.target.valueAsNumber })} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary" placeholder="0" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Stock Quantity *</label>
                                <input required type="number" value={formData.stock_quantity || ''} onChange={e => setFormData({ ...formData, stock_quantity: e.target.valueAsNumber })} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
                                <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary text-foreground">
                                    <option value="">Uncategorized</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Barcode</label>
                            <div className="flex gap-2">
                                <input value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="flex-1 bg-base border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary" placeholder="Scan or type..." />
                                <button type="button" onClick={() => setShowScanner(true)} className="bg-elevated border border-border px-3 py-2 rounded-lg text-primary hover:bg-white/5 flex items-center justify-center">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-border bg-elevated flex gap-2">
                    <button type="button" onClick={onClose} className="flex-1 bg-base py-2.5 rounded-lg border border-border font-semibold text-muted-foreground hover:bg-white/5 text-sm">Cancel</button>
                    <button type="submit" form="product-form" className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90">
                        <CheckCircle2 className="w-4 h-4" /> {product ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </div>

            {showScanner && (
                <BarcodeScanner
                    onScan={(code) => {
                        setFormData({ ...formData, barcode: code });
                        setShowScanner(false);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
