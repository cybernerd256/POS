"use client";

import { useAppStore } from '@/store/appStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import Papa from 'papaparse';

export default function ReportsPage() {
    const { activeBranch } = useAppStore();
    const [reportType, setReportType] = useState<'sales' | 'inventory'>('sales');
    const [dateRange, setDateRange] = useState('today');

    const transactions = useLiveQuery(() => db.transactions.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];
    const products = useLiveQuery(() => db.products.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];

    const handleExportCSV = () => {
        let dataToExport: Record<string, string | number | undefined>[] = [];
        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;

        if (reportType === 'sales') {
            dataToExport = transactions.map(t => ({
                Transaction_ID: t.id,
                Date: new Date(t.created_at).toLocaleString(),
                Payment_Method: t.payment_method,
                Subtotal: t.subtotal,
                Discount: t.discount_amount,
                Total_Paid: t.total,
                Cashier_ID: t.cashier_id
            }));
        } else {
            dataToExport = products.map(p => ({
                Product_Name: p.name,
                Barcode: p.barcode,
                Buying_Price: p.buying_price,
                Selling_Price: p.selling_price,
                Stock_Quantity: p.stock_quantity,
                Inventory_Value: p.stock_quantity * p.buying_price
            }));
        }

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    return (
        <div className="flex flex-col gap-6 h-full pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Reports Engine
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Generate and export business intelligence reports</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as 'sales' | 'inventory')}
                            className="w-full bg-base border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                        >
                            <option value="sales">Sales Summary</option>
                            <option value="inventory">Inventory Valuation</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-muted-foreground mb-2">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full bg-base border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
                            disabled={reportType === 'inventory'}
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <button className="bg-elevated border border-border text-foreground px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-white/5 transition-colors h-[42px]">
                        <Filter className="w-4 h-4" /> Apply Filters
                    </button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden bg-base/50">
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 text-primary">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="font-heading font-bold text-lg text-foreground mb-1">
                            {reportType === 'sales' ? 'Sales Report Ready' : 'Inventory Report Ready'}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            Your report configuration is set. Click the export button above to download the raw data as a CSV spreadsheet.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
