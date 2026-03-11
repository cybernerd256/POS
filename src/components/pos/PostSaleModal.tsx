"use client";

import { CheckCircle2, MessageCircle, Printer, X } from 'lucide-react';
import { Transaction } from '@/lib/db/dexie';

interface PostSaleModalProps {
    transaction: Transaction;
    onClose: () => void;
}

export function PostSaleModal({ transaction, onClose }: PostSaleModalProps) {
    const baseTotal = transaction.subtotal - transaction.discount_amount;
    const vatApplied = transaction.total - baseTotal;

    const handleWhatsApp = () => {
        // Basic text formatting for WhatsApp
        const receiptText = `*SwiftPOS Receipt*
📍 Central Branch
📅 ${new Date(transaction.created_at).toLocaleString()}
-------------------------
${transaction.items.map(i => `${i.quantity}x Prod-${i.product_id.slice(0, 4)}  UGX ${(i.price * i.quantity).toLocaleString()}`).join('\n')}
-------------------------
${vatApplied > 0.01 ? `Subtotal: UGX ${baseTotal.toLocaleString()}\nVAT (18%): UGX ${vatApplied.toLocaleString()}\n` : ''}*TOTAL: UGX ${transaction.total.toLocaleString()}*
Paid: ${transaction.payment_method.replace('_', ' ').toUpperCase()}
-------------------------
Thank you for shopping with us!
Powered by SwiftPOS ⚡`;

        const encodedText = encodeURIComponent(receiptText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-teal" />
                </div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-1">Sale Complete</h2>
                <p className="text-muted-foreground text-sm mb-2">
                    Transaction #{transaction.id.split('-').shift()?.toUpperCase()}
                </p>
                <div className="bg-base border border-border w-full rounded-xl p-4 mb-6">
                    <div className="flex justify-between text-sm text-foreground mb-1">
                        <span>Subtotal</span>
                        <span className="font-mono">{new Intl.NumberFormat('en-UG').format(baseTotal)}</span>
                    </div>
                    {vatApplied > 0.01 && (
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>VAT (18%)</span>
                            <span className="font-mono">{new Intl.NumberFormat('en-UG').format(vatApplied)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-primary border-t border-border pt-2 mt-1">
                        <span>Total Paid</span>
                        <span className="font-mono">UGX {new Intl.NumberFormat('en-UG').format(transaction.total)}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={handlePrint}
                        className="w-full bg-elevated border border-border text-foreground font-semibold py-3 flex items-center justify-center gap-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <Printer className="w-5 h-5" /> Print Receipt
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-[#25D366] text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <MessageCircle className="w-5 h-5" /> Send via WhatsApp
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-transparent text-muted-foreground font-semibold py-3 flex items-center justify-center rounded-xl hover:text-foreground transition-colors mt-2"
                    >
                        New Sale <X className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>

            {/* Hidden print area - in real app we'd load the full Receipt component here hidden */}
            <div className="hidden print:block absolute top-0 left-0 bg-white text-black p-4 w-full h-full text-xs font-mono">
                <h2 className="font-bold text-lg text-center uppercase">Central Branch</h2>
                <p className="text-center">Receipt #: {transaction.id.split('-').shift()?.toUpperCase()}</p>
                <div className="my-2 border-b border-dashed border-black"></div>
                {transaction.items.map((item, i) => (
                    <div key={i} className="flex justify-between mb-1">
                        <span>{item.quantity}x Prod-{item.product_id.slice(0, 4)}</span>
                        <span>{new Intl.NumberFormat('en-UG').format(item.price * item.quantity)}</span>
                    </div>
                ))}
                <div className="my-2 border-b border-dashed border-black"></div>
                <div className="flex justify-between font-bold">
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('en-UG').format(baseTotal)}</span>
                </div>
                {vatApplied > 0.01 && (
                    <div className="flex justify-between">
                        <span>VAT (18%):</span>
                        <span>{new Intl.NumberFormat('en-UG').format(vatApplied)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-[14px] mt-1">
                    <span>TOTAL:</span>
                    <span>UGX {new Intl.NumberFormat('en-UG').format(transaction.total)}</span>
                </div>
                <p className="text-center mt-6 text-[10px]">Powered by SwiftPOS</p>
            </div>
        </div>
    );
}
