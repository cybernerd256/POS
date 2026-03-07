"use client";

import { ReactNode, useState } from 'react';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { ShoppingCart, Users, Package, FileText, Settings, User, Building2, Clock, Truck, TrendingDown, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { ShiftModal } from '@/components/shared/ShiftModal';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-20 md:w-64 bg-surface border-r border-border flex flex-col items-center md:items-stretch py-4">
                <div className="px-4 pb-6 border-b border-border hidden md:block">
                    <h1 className="font-heading text-xl font-bold text-primary">SwiftPOS</h1>
                </div>
                <div className="mt-4 flex flex-col gap-2 px-2">
                    <NavItem href="/home" icon={<BarChart3 className="w-4 h-4" />} label="Dashboard" />
                    <NavItem href="/pos" icon={<ShoppingCart className="w-4 h-4" />} label="POS" />
                    <NavItem href="/inventory" icon={<Package className="w-4 h-4" />} label="Inventory" />
                    <NavItem href="/transactions" icon={<FileText className="w-4 h-4" />} label="Transactions" />
                    <NavItem href="/reports" icon={<FileText className="w-4 h-4 text-primary" />} label="Reports" />
                    <NavItem href="/customers" icon={<Users className="w-4 h-4" />} label="Customers" />
                    <NavItem href="/staff" icon={<Building2 className="w-4 h-4" />} label="Staff" />
                    <NavItem href="/suppliers" icon={<Truck className="w-4 h-4" />} label="Suppliers" />
                    <NavItem href="/expenses" icon={<TrendingDown className="w-4 h-4" />} label="Expenses" />
                    <NavItem href="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0">
                <OfflineBanner />
                {/* TOPBAR */}
                <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 relative z-40">
                    <BranchSelector />
                    <div className="flex items-center gap-4">
                        <ShiftWidget />
                        <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center border border-border">
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto bg-base p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function BranchSelector() {
    const { activeBranch, availableBranches, setActiveBranch, userRole } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    if (userRole !== 'admin') {
        return <div className="font-heading font-semibold text-primary">{activeBranch.name}</div>;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 font-heading font-semibold text-primary hover:bg-white/5 py-1.5 px-3 rounded-lg border border-transparent hover:border-border transition-colors"
            >
                {activeBranch.name}
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 w-56 bg-surface border border-border shadow-2xl rounded-xl overflow-hidden py-1 z-50">
                    <div className="px-3 py-2 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Switch Branch
                    </div>
                    {availableBranches.map((b: { id: string; name: string; }) => (
                        <button
                            key={b.id}
                            onClick={() => {
                                setActiveBranch(b);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${b.id === activeBranch.id ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-elevated'}`}
                        >
                            {b.name}
                            {b.id === activeBranch.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-elevated transition-colors text-muted-foreground hover:text-primary">
            {icon}
            <span className="hidden md:inline text-sm font-medium">{label}</span>
        </Link>
    );
}

function ShiftWidget() {
    const { activeBranch, userId } = useAppStore();
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

    // Find if the current user has an open shift in this branch
    const openShifts = useLiveQuery(
        () => db.shifts
            .where({ cashier_id: userId, branch_id: activeBranch.id, status: 'open' })
            .toArray(),
        [userId, activeBranch.id]
    );

    // Provide a mocked expected cash to make the UI look alive
    const mockExpectedCash = 125000;

    const activeShift = openShifts?.[0];

    // Managers and Admins don't strictly *need* to open shifts to use the app, but cashiers usually do.
    // For now we'll show the widget for everyone.

    return (
        <>
            <button
                onClick={() => setIsShiftModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${activeShift ? 'bg-success/10 border-success/30 text-success hover:bg-success/20' : 'bg-warning/10 border-warning/30 text-warning hover:bg-warning/20'}`}
            >
                <Clock className="w-3.5 h-3.5" />
                {activeShift ? 'Shift Open' : 'Shift Closed'}
            </button>
            <ShiftModal
                isOpen={isShiftModalOpen}
                onClose={() => setIsShiftModalOpen(false)}
                mode={activeShift ? 'close' : 'open'}
                currentShiftId={activeShift?.id}
                expectedCash={mockExpectedCash}
            />
        </>
    );
}
