"use client";

import { useState } from 'react';
import { db, Transaction } from '@/lib/db/dexie';
import { X, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';

export function RefundModal({ transaction, onClose }: { transaction: Transaction, onClose: () => void }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [reason, setReason] = useState('');

    const isRefunded = transaction.total < 0;

    const handleRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Hardcoded demo manager PIN for Phase 2 MVP
        if (pin !== '1234') {
            setError("Invalid Manager PIN.");
            return;
        }

        if (!reason.trim()) {
            setError("Please provide a reason for the refund.");
            return;
        }

        setIsProcessing(true);

        try {
            // Create a negative transaction to represent the refund
            const refundTx: Transaction = {
                id: crypto.randomUUID(),
                items: transaction.items.map(i => ({ ...i, quantity: -i.quantity })),
                subtotal: -transaction.subtotal,
                discount_amount: -transaction.discount_amount,
                total: -transaction.total,
                payment_method: transaction.payment_method,
                cashier_id: transaction.cashier_id,
                branch_id: transaction.branch_id,
                customer_id: transaction.customer_id,
                synced: false,
                created_at: new Date().toISOString()
            };

            await db.transactions.add(refundTx);

            // Restock inventory
            for (const item of transaction.items) {
                const prod = await db.products.get(item.product_id);
                if (prod) {
                    await db.products.update(prod.id, { stock_quantity: prod.stock_quantity + item.quantity });
                }
            }

            alert("Refund processed successfully.");
            onClose();
        } catch (err) {
            setError("An error occurred processing the refund.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-elevated">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        Transaction Details
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-danger">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6 flex-1 overflow-auto">
                    {/* receipt breakdown */}
                    <div className="bg-base border border-border rounded-xl p-4 font-mono text-sm">
                        <p className="text-muted-foreground mb-4">Receipt #{transaction.id.split('-')[0].toUpperCase()} <br /> {new Date(transaction.created_at).toLocaleString()}</p>

                        <div className="flex flex-col gap-2 mb-4 border-b border-border/50 pb-4">
                            {transaction.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-foreground">
                                    <span>{item.quantity}x {item.product_id.slice(0, 6)}...</span>
                                    <span>{new Intl.NumberFormat('en-UG').format(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-UG').format(transaction.subtotal)}</span>
                        </div>
                        {transaction.discount_amount > 0 && (
                            <div className="flex justify-between text-warning mt-1">
                                <span>Discount</span>
                                <span>-{new Intl.NumberFormat('en-UG').format(transaction.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-primary mt-2">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('en-UG').format(transaction.total)}</span>
                        </div>
                        <p className="text-right text-xs text-muted-foreground mt-1 uppercase">Paid via {transaction.payment_method}</p>
                    </div>

                    {!isRefunded ? (
                        <form onSubmit={handleRefund} className="flex flex-col gap-4 bg-danger/5 border border-danger/20 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-danger text-sm">Issue Full Refund</h4>
                                    <p className="text-xs text-danger/80 mt-1">This will restock the items and record a negative transaction. Requires Manager PIN.</p>
                                </div>
                            </div>

                            {error && <p className="text-xs text-danger font-bold text-center">{error}</p>}

                            <div className="flex flex-col gap-3 mt-2">
                                <input
                                    required
                                    type="text"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Reason for refund (e.g. Defective item, Customer changed mind)..."
                                    className="w-full bg-base border border-danger/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ring-danger text-foreground"
                                />
                                <div className="flex gap-2 relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="password"
                                        value={pin}
                                        onChange={e => setPin(e.target.value)}
                                        placeholder="Manager PIN (try 1234)"
                                        className="flex-1 bg-base border border-danger/30 rounded-lg pl-9 pr-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-1 ring-danger text-foreground"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="bg-danger text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Processing...' : <><RotateCcw className="w-4 h-4" /> Refund</>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-elevated border border-border p-4 rounded-xl text-center">
                            <p className="font-bold text-muted-foreground">This transaction is a refund record.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
