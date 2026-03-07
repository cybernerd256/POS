import { useState } from 'react';
import { X, CreditCard, CheckCircle2, Phone, User, Mail, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
    const [step, setStep] = useState<1 | 2>(1);

    // Credential Harvesting
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Payment specific
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && phone) {
            setStep(2);
        } else {
            alert("Please fill in all your billing details.");
        }
    };

    const handlePay = () => {
        setIsProcessing(true);
        // Simulate Flutterwave API call and webhook response
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border bg-elevated/30">
                    <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Upgrade to PRO
                    </h2>
                    <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-base rounded-full transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleNext} className="p-6 flex flex-col gap-5 overflow-auto">
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col gap-1 items-center text-center">
                            <h3 className="text-primary font-bold">SwiftPOS PRO</h3>
                            <p className="text-sm text-muted-foreground mt-1">UGX 400,000 / month</p>
                            <p className="text-xs font-semibold text-foreground mt-2">Unlock unlimited branches, multi-cashier accounts, and advanced reports.</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-foreground mb-3">Billing Details</h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text" required
                                            value={name} onChange={e => setName(e.target.value)}
                                            className="w-full bg-base border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="email" required
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-base border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="tel" required
                                            value={phone} onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-base border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                            placeholder="07XX XXX XXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mt-2 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-foreground bg-elevated hover:bg-white/10 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                                Next: Payment
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-6 flex flex-col gap-6 overflow-auto">
                        <div>
                            <h4 className="text-sm font-bold text-foreground mb-3">Payment Method</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('momo')}
                                    className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'momo'
                                            ? 'bg-[#E5A823]/10 border-[#E5A823] text-[#E5A823]'
                                            : 'bg-base border-border hover:bg-elevated'
                                        }`}
                                >
                                    <Phone className="w-6 h-6" />
                                    <span className="text-xs font-bold">Mobile Money</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card'
                                            ? 'bg-info/10 border-info text-info'
                                            : 'bg-base border-border hover:bg-elevated'
                                        }`}
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="text-xs font-bold">Credit Card</span>
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'momo' ? (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">Mobile Money Number</label>
                                <input
                                    type="tel"
                                    defaultValue={phone}
                                    className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                                    placeholder="07XX XXX XXX"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">You will receive a prompt on your phone to enter your PIN.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground">Card Number</label>
                                    <input
                                        type="text"
                                        className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-mono tracking-widest"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground">Expiry Date</label>
                                        <input
                                            type="text"
                                            className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-center font-mono"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground">CVV</label>
                                        <input
                                            type="password"
                                            className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-center font-mono"
                                            placeholder="123"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-elevated border border-border rounded-xl p-4 flex justify-between items-center mt-2">
                            <span className="text-sm font-bold text-muted-foreground">Total to Pay</span>
                            <span className="text-lg font-mono font-bold text-primary">UGX 400,000</span>
                        </div>

                        <div className="pt-2 flex justify-between gap-3">
                            <button
                                onClick={() => setStep(1)}
                                disabled={isProcessing}
                                className="px-5 py-2.5 flex-1 rounded-xl text-sm font-bold bg-base border border-border hover:bg-elevated transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={isProcessing}
                                className="px-5 py-2.5 flex-[2] flex gap-2 justify-center items-center rounded-xl text-sm font-bold bg-[#E5A823] text-black hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                            >
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>Pay UGX 400,000</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
