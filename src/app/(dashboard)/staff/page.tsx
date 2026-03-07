"use client";

import { useState } from 'react';
import { db } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/store/appStore';
import { Search, Plus, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { StaffModal } from '@/components/staff/StaffModal';

export default function StaffPage() {
    const { activeBranch, userRole } = useAppStore();
    const staff = useLiveQuery(() => db.staff.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Only admins and managers can manage staff
    if (userRole === 'cashier') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <ShieldCheck className="w-16 h-16 text-danger/50 mb-4" />
                <h2 className="text-xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground mt-2">You do not have permission to view staff settings.</p>
            </div>
        );
    }

    const filtered = staff.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.includes(search.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to deactivate ${name}?`)) {
            await db.staff.update(id, { is_active: false, synced: false });
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                        <UserIcon className="w-6 h-6 text-primary" />
                        Staff Management
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage employees and roles for {activeBranch.name}</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" /> Add Staff
                </button>
            </div>

            <div className="bg-surface border border-border rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-border flex gap-4 bg-elevated/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search staff by name or role..."
                            className="w-full bg-base border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-base sticky top-0 border-b border-border z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Role</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Contact</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No staff members found for this branch.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((member) => (
                                    <tr key={member.id} className="border-b border-border hover:bg-elevated/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs uppercase border border-primary/30">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <p className="font-bold text-foreground">{member.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${member.role === 'admin' ? 'bg-danger/10 text-danger border-danger/20' : member.role === 'manager' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-info/10 text-info border-info/20'}`}>
                                                {member.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {member.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.is_active ?
                                                <span className="text-success flex items-center gap-1.5 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Active</span> :
                                                <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div> Inactive</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(member.id, member.name)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-danger hover:border-danger/50 transition-colors tooltip" title="Deactivate">
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

            {isModalOpen && (
                <StaffModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}
