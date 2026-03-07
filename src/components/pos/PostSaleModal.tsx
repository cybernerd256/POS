"use client";

import { CheckCircle2, MessageCircle, Printer, X } from 'lucide-react';
import { Transaction } from '@/lib/db/dexie';

interface PostSaleModalProps {
    transaction: Transaction;
    onClose: () => void;
}

export function PostSaleModal({ transaction, onClose }: PostSaleModalProps) {
    const handleWhatsApp = () => {
        // Basic text formatting for WhatsApp
        const receiptText = `*SwiftPOS Receipt*
📍 Central Branch
📅 ${new Date(transaction.created_at).toLocaleString()}
-------------------------
${transaction.items.map(i => `${i.quantity}x Prod-${i.product_id.slice(0, 4)}  UGX ${(i.price * i.quantity).toLocaleString()}`).join('\n')}
-------------------------
*TOTAL: UGX ${transaction.total.toLocaleString()}*
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
                <p className="text-muted-foreground text-sm mb-6">
                    Transaction #{transaction.id.split('-').shift()?.toUpperCase()}<br />
                    Total: UGX {new Intl.NumberFormat('en-UG').format(transaction.total)}
                </p>

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
                <p className="text-center mb-4">Total: UGX {new Intl.NumberFormat('en-UG').format(transaction.total)}</p>
                {transaction.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                        <span>{item.quantity}x Item</span>
                        <span>{new Intl.NumberFormat('en-UG').format(item.price * item.quantity)}</span>
                    </div>
                ))}
                <p className="text-center mt-4 text-[10px]">Powered by SwiftPOS</p>
            </div>
        </div>
    );
}
