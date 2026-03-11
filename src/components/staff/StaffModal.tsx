import { useState } from 'react';
import { db } from '@/lib/db/dexie';
import { useAppStore } from '@/store/appStore';
import { X } from 'lucide-react';

interface StaffModalProps {
    onClose: () => void;
}

export function StaffModal({ onClose }: StaffModalProps) {
    const { activeBranch } = useAppStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [role, setRole] = useState<'admin' | 'manager' | 'cashier'>('cashier');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !pin) {
            alert("Name and PIN are required.");
            return;
        }
        if (pin.length < 4) {
            alert("PIN must be at least 4 digits.");
            return;
        }

        setIsSaving(true);
        try {
            await db.staff.add({
                id: crypto.randomUUID(),
                name,
                pin,
                phone,
                role,
                branch_id: activeBranch.id,
                is_active: true,
                synced: false
            });
            onClose();
        } catch (error) {
            console.error("Error saving staff", error);
            alert("Failed to save staff member.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
            <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border bg-elevated/30">
                    <h2 className="font-heading font-bold text-lg">Add New Staff</h2>
                    <button onClick={onClose} className="p-2 hover:bg-base rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 overflow-auto">
                    <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-1.5">Full Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-muted-foreground mb-1.5">Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. 0770000000"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground mb-1.5">Role <span className="text-danger">*</span></label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value as 'admin' | 'manager' | 'cashier')}
                                className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                            >
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground mb-1.5">Access PIN <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                required
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                minLength={4}
                                maxLength={6}
                                className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-mono tracking-widest placeholder:tracking-normal"
                                placeholder="4-6 digits"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border mt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-foreground bg-elevated hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button disabled={isSaving} type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
