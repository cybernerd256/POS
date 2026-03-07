"use client";

import { useAppStore } from '@/store/appStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
    const { activeBranch } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const transactions = useLiveQuery(() => db.transactions.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];
    const expenses = useLiveQuery(() => db.expenses.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];

    // Quick Math
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(t => t.created_at.startsWith(today));
    const todaysSales = todaysTransactions.reduce((acc, t) => acc + t.total, 0);
    const todaysExpenses = expenses.filter(e => e.date.startsWith(today)).reduce((acc, e) => acc + e.amount, 0);

    // Format for charts
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
        const hour = i + 8; // 8 AM to 8 PM
        const hourStr = hour.toString().padStart(2, '0');
        const salesInHour = todaysTransactions
            .filter(t => t.created_at.includes(`T${hourStr}:`))
            .reduce((acc, t) => acc + t.total, 0);
        return { name: `${hourStr}:00`, sales: salesInHour };
    });

    // Top Products Mock Data (Real logic would aggregate cart items, keeping it simple for now)
    const topProducts = [
        { name: 'Rolex Watch', qty: 12 },
        { name: 'Leather Bag', qty: 8 },
        { name: 'Perfume 50ml', qty: 5 },
        { name: 'Gold Chain', qty: 3 }
    ];

    if (!mounted) return null;

    return (
        <div className="flex flex-col gap-6 h-full pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Analytics for {activeBranch.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full bg-base border border-border">
                    <Clock className="w-4 h-4 text-primary" />
                    {new Date().toLocaleDateString('en-UG', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Today's Sales" amount={todaysSales} icon={<DollarSign className="w-5 h-5" />} trend="+12.5%" isPositive={true} />
                <KPICard title="Today's Expenses" amount={todaysExpenses} icon={<TrendingDown className="w-5 h-5" />} trend="+4.1%" isPositive={false} />
                <KPICard title="Net Profit (Est)" amount={todaysSales - todaysExpenses} icon={<TrendingUp className="w-5 h-5" />} trend="+15.3%" isPositive={true} />
                <KPICard title="Transactions" amount={todaysTransactions.length} icon={<CreditCard className="w-5 h-5" />} format="number" trend="+2" isPositive={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                {/* Main Graph */}
                <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-base">Hourly Sales Revenue</h3>
                        <p className="text-xs text-muted-foreground">Today&apos;s transactions by hour (UGX)</p>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111110', borderColor: '#272725', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#E4A853' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`UGX ${Number(value).toLocaleString()}`, 'Sales']}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#E4A853" strokeWidth={3} dot={{ r: 4, fill: '#E4A853', strokeWidth: 2, stroke: '#111110' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-base">Top Selling Products</h3>
                        <p className="text-xs text-muted-foreground">Highest volume items today</p>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={false} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, className: 'font-medium', fill: '#e5e7eb' }} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: '#111110', borderColor: '#272725', borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Bar dataKey="qty" fill="#E4A853" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, amount, icon, format = 'currency', trend, isPositive }: any) {
    return (
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3 group hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-muted-foreground">{title}</p>
                <div className="p-2 bg-base rounded-md text-foreground group-hover:text-primary transition-colors border border-border">
                    {icon}
                </div>
            </div>
            <div>
                <h4 className="text-2xl font-mono font-bold text-foreground">
                    {format === 'currency'
                        ? new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount)
                        : amount}
                </h4>
                <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                    <span className={`px-1.5 py-0.5 rounded-sm ${isPositive ? 'bg-success/10' : 'bg-danger/10'}`}>
                        {trend}
                    </span>
                    <span className="text-muted-foreground font-medium">vs last week</span>
                </div>
            </div>
        </div>
    );
}
