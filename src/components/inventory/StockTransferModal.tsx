import { useState } from 'react';
import { db, Product } from '@/lib/db/dexie';
import { useAppStore } from '@/store/appStore';
import { X, ArrowRightLeft } from 'lucide-react';

interface StockTransferModalProps {
    product: Product;
    onClose: () => void;
}

export function StockTransferModal({ product, onClose }: StockTransferModalProps) {
    const { activeBranch, availableBranches } = useAppStore();
    const targetBranches = availableBranches.filter(b => b.id !== activeBranch.id);

    const [targetBranchId, setTargetBranchId] = useState(targetBranches[0]?.id || '');
    const [quantity, setQuantity] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        const transferQty = Number(quantity);

        if (!transferQty || transferQty <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (transferQty > product.stock_quantity) {
            alert("Insufficient stock for this transfer.");
            return;
        }

        if (!targetBranchId) {
            alert("Please select a target branch.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Deduct from current branch
            await db.products.update(product.id, {
                stock_quantity: product.stock_quantity - transferQty,
                synced: false
            });

            // 2. Add to target branch
            // We need to find if the product exists in the target branch by barcode/name
            const targetProduct = await db.products
                .where({ branch_id: targetBranchId, barcode: product.barcode })
                .first();

            if (targetProduct) {
                await db.products.update(targetProduct.id, {
                    stock_quantity: targetProduct.stock_quantity + transferQty,
                    synced: false
                });
            } else {
                // Create new product in target branch
                await db.products.add({
                    id: crypto.randomUUID(),
                    branch_id: targetBranchId,
                    name: product.name,
                    barcode: product.barcode,
                    category_id: product.category_id,
                    buying_price: product.buying_price,
                    selling_price: product.selling_price,
                    stock_quantity: transferQty,
                    synced: false,
                    updated_at: new Date().toISOString()
                });
            }

            alert(`Successfully transferred ${transferQty} to selected branch.`);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to complete stock transfer.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border bg-elevated/30">
                    <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-primary" />
                        Transfer Stock
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-base rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleTransfer} className="p-6 flex flex-col gap-5 overflow-auto">
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col gap-1">
                        <p className="text-sm text-primary font-bold">{product.name}</p>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Current Stock:</span>
                            <span className="font-mono font-bold text-foreground">{product.stock_quantity}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-1.5">Destination Branch</label>
                        <select
                            value={targetBranchId}
                            onChange={e => setTargetBranchId(e.target.value)}
                            className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                            required
                        >
                            {targetBranches.length === 0 && <option value="">No other branches available</option>}
                            {targetBranches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-1.5">Transfer Quantity <span className="text-danger">*</span></label>
                        <input
                            type="number"
                            required
                            max={product.stock_quantity}
                            min={1}
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                            placeholder="e.g. 10"
                        />
                    </div>

                    <div className="pt-4 border-t border-border mt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-foreground bg-elevated hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button disabled={isSaving || targetBranches.length === 0} type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isSaving ? 'Transferring...' : 'Confirm Transfer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
