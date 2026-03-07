"use client";

import { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Store } from 'lucide-react';

import { UpgradeModal } from '@/components/settings/UpgradeModal';

export default function SettingsPage() {
    const [tier, setTier] = useState<'BASIC' | 'PRO'>('BASIC');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleUpgradeSuccess = () => {
        setIsUpgradeModalOpen(false);
        setTier('PRO');
        alert("Payment Successful! Welcome to SwiftPOS PRO.");
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full overflow-auto pb-12">
            <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Settings & Billing</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1">Manage your store preferences and subscriptions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscription Tier Card */}
                <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-elevated relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-primary/10">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <h2 className="font-heading font-bold text-lg mb-1 relative z-10">Current Plan</h2>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <span className="text-3xl font-bold font-mono text-primary">{tier}</span>
                            <span className="text-sm text-muted-foreground font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                {tier === 'BASIC' ? 'Free Forever' : 'UGX 50,000 / mo'}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col gap-4">
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground font-medium flex-1">
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> {tier === 'BASIC' ? '1 Branch Only' : 'Unlimited Branches'}</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Offline Sync Engine</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> WhatsApp Receipts</p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Basic Reports</p>
                            {tier === 'PRO' && <p className="flex items-center gap-2 text-primary font-bold"><CheckCircle2 className="w-4 h-4" /> Multi-cashier Accounts</p>}
                        </div>

                        {tier === 'BASIC' ? (
                            <button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="w-full bg-[#E5A823] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-4 shadow-lg"
                            >
                                <CreditCard className="w-5 h-5" /> Upgrade to PRO
                            </button>
                        ) : (
                            <button
                                className="w-full bg-elevated border border-border text-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors mt-4"
                            >
                                Manage Billing (Flutterwave)
                            </button>
                        )}
                    </div>
                </div>

                {/* Branch Management (Tier Gated) */}
                <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border bg-elevated">
                        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                            <Store className="w-5 h-5 text-primary" /> Branches
                        </h2>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="flex flex-col gap-3">
                            <div className="p-4 bg-base border border-border rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm">Central Branch (Headquarters)</p>
                                    <p className="text-xs text-muted-foreground mt-1">Kampala Road, Plot 4</p>
                                </div>
                                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/30">Active</span>
                            </div>

                            {tier === 'BASIC' ? (
                                <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl text-center flex flex-col items-center justify-center py-8">
                                    <p className="text-sm text-danger font-semibold mb-2">Branch layout limit reached.</p>
                                    <p className="text-xs text-danger/80 mb-4 max-w-xs mx-auto">You must upgrade to PRO to manage multiple branches.</p>
                                    <button onClick={() => setIsUpgradeModalOpen(true)} className="bg-danger/10 text-danger border border-danger/30 px-4 py-2 text-xs font-bold rounded-lg hover:bg-danger/20 transition-colors">
                                        Unlock Multiple Branches
                                    </button>
                                </div>
                            ) : (
                                <button className="p-4 border-2 border-dashed border-border rounded-xl text-center text-primary font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all">
                                    + Add New Branch
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isUpgradeModalOpen && (
                <UpgradeModal
                    onClose={() => setIsUpgradeModalOpen(false)}
                    onSuccess={handleUpgradeSuccess}
                />
            )}
        </div>
    );
}
