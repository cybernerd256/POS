"use client";

import { useState } from 'react';
import { db } from '@/lib/db/dexie';
import { useAppStore } from '@/store/appStore';
import { X, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'open' | 'close';
    currentShiftId?: string;
    expectedCash?: number;
}

export function ShiftModal({ isOpen, onClose, mode, currentShiftId, expectedCash }: ShiftModalProps) {
    const { activeBranch, userId } = useAppStore();
    const [floatAmount, setFloatAmount] = useState('');
    const [declaredCash, setDeclaredCash] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleOpenShift = async () => {
        setIsSaving(true);
        try {
            await db.shifts.add({
                id: crypto.randomUUID(),
                cashier_id: userId,
                branch_id: activeBranch.id,
                status: 'open',
                opening_time: new Date().toISOString(),
                opening_float: Number(floatAmount) || 0,
                synced: false
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to open shift.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseShift = async () => {
        if (!currentShiftId) return;
        setIsSaving(true);
        try {
            const difference = (Number(declaredCash) || 0) - (expectedCash || 0);

            await db.shifts.update(currentShiftId, {
                status: 'closed',
                closing_time: new Date().toISOString(),
                closing_cash_declared: Number(declaredCash) || 0,
                expected_cash: expectedCash,
                synced: false
            });

            // In a real app we might also print a Z-Report here automatically.
            alert(`Shift Closed.\nExpected: ${expectedCash}\nDeclared: ${declaredCash}\nDifference: ${difference}`);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to close shift.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border bg-elevated/30">
                    <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        {mode === 'open' ? 'Open Shift' : 'Close Shift (Z-Report)'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-base rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {mode === 'open' ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Declare the cash currently in the drawer to start your shift.
                            </p>
                            <div>
                                <label className="block text-sm font-bold text-muted-foreground mb-1.5 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Opening Cash Float (UGX)
                                </label>
                                <input
                                    type="number"
                                    value={floatAmount}
                                    onChange={e => setFloatAmount(e.target.value)}
                                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-primary transition-colors"
                                    placeholder="e.g. 50000"
                                    autoFocus
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col gap-1">
                                <p className="text-sm text-primary font-bold">Shift Summary</p>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-muted-foreground">Expected Drawer Cash:</span>
                                    <span className="font-mono font-bold text-foreground">
                                        {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(expectedCash || 0)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-muted-foreground mb-1.5">
                                    Actual Cash Declared (UGX) <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={declaredCash}
                                    onChange={e => setDeclaredCash(e.target.value)}
                                    className="w-full bg-base border border-border rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Count your drawer..."
                                    autoFocus
                                />
                                {(Number(declaredCash) !== expectedCash && declaredCash !== '') && (
                                    <p className="text-xs flex items-center gap-1 mt-2 text-danger">
                                        <AlertCircle className="w-3 h-3" /> Discrepancy: {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format((Number(declaredCash) || 0) - (expectedCash || 0))}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="pt-2 flex flex-col gap-3">
                        <button
                            disabled={isSaving || (mode === 'close' && !declaredCash)}
                            onClick={mode === 'open' ? handleOpenShift : handleCloseShift}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-opacity disabled:opacity-50 ${mode === 'open' ? 'bg-primary text-primary-foreground' : 'bg-danger text-danger-foreground hover:opacity-90'}`}
                        >
                            {isSaving ? 'Processing...' : mode === 'open' ? 'Start Shift' : 'End Shift & Print Z-Report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
