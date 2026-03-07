"use client";

import { db } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/store/appStore';
import { Plus, Trash2, TrendingDown, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function ExpensesPage() {
    const { activeBranch, userId } = useAppStore();
    const expenses = useLiveQuery(() => db.expenses.where('branch_id').equals(activeBranch.id).reverse().sortBy('date'), [activeBranch.id]) || [];

    // For a real app, we'd have a full modal. Using Quick Add here to move fast.
    const handleQuickAdd = async () => {
        const amountStr = prompt("Enter expense amount (UGX):");
        if (!amountStr) return;
        const amount = Number(amountStr);
        if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

        const description = prompt("Enter description (e.g. Paid UMEME electricity bill):");
        if (!description) return;

        await db.expenses.add({
            id: crypto.randomUUID(),
            branch_id: activeBranch.id,
            cashier_id: userId,
            category: 'Utilities', // Defaulting for quick add
            amount,
            description,
            date: new Date().toISOString(),
            synced: false
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this expense record?")) {
            await db.expenses.delete(id);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <TrendingDown className="w-6 h-6 text-danger" />
                        Expense Tracker
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Log and monitor branch operational costs</p>
                </div>
                <button
                    onClick={handleQuickAdd}
                    className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" /> Record Expense
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-2">
                    <p className="text-sm font-bold text-muted-foreground">Total Expenses (All Time)</p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(totalExpenses)}
                    </p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-border flex justify-between items-center bg-elevated/30">
                    <h3 className="font-bold text-sm text-foreground">Recent Expenses</h3>
                    <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
                        <Filter className="w-3.5 h-3.5" /> Filter by Category
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-base sticky top-0 border-b border-border z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Date</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Description</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Category</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No expenses recorded for this branch yet.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((e) => (
                                    <tr key={e.id} className="border-b border-border hover:bg-elevated/50 transition-colors group">
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(e.date), 'MMM d, yyyy h:mm a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-foreground">
                                            {e.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-base border border-border text-muted-foreground">
                                                {e.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-danger">
                                            {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(e.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(e.id)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-danger hover:border-danger/50 transition-colors tooltip" title="Delete Entry">
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
