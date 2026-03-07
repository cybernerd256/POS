import { forwardRef } from 'react';
import { Transaction } from '@/lib/db/dexie';
import { format } from 'date-fns';

interface ReceiptProps {
    transaction: Transaction;
    branchName: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction, branchName }, ref) => {
    return (
        <div ref={ref} className="w-[300px] bg-white text-black p-4 font-mono text-xs mx-auto">
            <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
                <h2 className="font-bold text-lg uppercase">{branchName}</h2>
                <p>123 Business Rd, Kampala</p>
                <p>Tel: +256 700 000000</p>
            </div>

            <div className="mb-4">
                <p>Receipt #: {transaction.id.split('-').shift()?.toUpperCase()}</p>
                <p>Date: {format(new Date(transaction.created_at), 'dd MMM yyyy HH:mm')}</p>
                <p>Cashier: {transaction.cashier_id}</p>
            </div>

            <div className="border-t border-b border-black py-2 border-dashed mb-4">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left font-normal pb-2">ITEM</th>
                            <th className="text-center font-normal pb-2">QTY</th>
                            <th className="text-right font-normal pb-2">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaction.items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-1">Prod-{item.product_id.slice(0, 4)}</td>
                                <td className="text-center py-1">x{item.quantity}</td>
                                <td className="text-right py-1">{new Intl.NumberFormat('en-UG').format(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mb-4">
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL:</span>
                    <span>UGX {new Intl.NumberFormat('en-UG').format(transaction.total)}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Paid:</span>
                    <span className="uppercase">{transaction.payment_method.replace('_', ' ')}</span>
                </div>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-black border-dashed">
                <p>Thank you! Come back soon 😊</p>
                <p className="mt-2 text-[10px]">Powered by SwiftPOS ⚡</p>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
