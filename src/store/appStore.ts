import { create } from 'zustand';

interface Branch {
    id: string;
    name: string;
}

interface AppState {
    activeBranch: Branch;
    availableBranches: Branch[];
    setActiveBranch: (branch: Branch) => void;
    userRole: 'admin' | 'manager' | 'cashier';
    userId: string;
}

export const useAppStore = create<AppState>((set) => ({
    // Defaults for offline mock / testing
    activeBranch: { id: 'branch-1', name: 'Kampala Road HQ' },
    availableBranches: [
        { id: 'branch-1', name: 'Kampala Road HQ' },
        { id: 'branch-2', name: 'Acacia Mall' },
        { id: 'branch-3', name: 'Ntinda Complex' }
    ],
    userRole: 'admin',
    userId: 'mock-user-1',
    setActiveBranch: (branch) => set({ activeBranch: branch })
}));
