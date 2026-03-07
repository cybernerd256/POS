import Dexie, { type EntityTable } from 'dexie';

export interface CartItem {
    product_id: string;
    quantity: number;
    price: number;
    discount?: { type: 'percentage' | 'fixed', value: number };
}

export interface Product {
    id: string;
    name: string;
    buying_price: number;
    selling_price: number;
    stock_quantity: number;
    barcode?: string;
    category_id: string;
    branch_id: string;
    synced: boolean;
    updated_at: string;
}

export interface Transaction {
    id: string;
    items: CartItem[];
    subtotal: number;
    discount_amount: number;
    total: number;
    payment_method: 'cash' | 'mobile_money' | 'card' | 'split' | 'credit';
    cashier_id: string;
    branch_id: string;
    customer_id?: string;
    synced: boolean;
    created_at: string;
}

export interface SyncQueue {
    id?: number;
    table: string;
    operation: 'insert' | 'update' | 'delete';
    payload: any;
    attempts: number;
    created_at: string;
}

export interface Customer {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    points: number;
    branch_id: string;
    synced: boolean;
}

export interface Category {
    id: string;
    name: string;
    branch_id: string;
    colour?: string;
}

export interface Staff {
    id: string;
    name: string;
    role: 'admin' | 'manager' | 'cashier';
    pin: string;
    phone?: string;
    branch_id: string;
    is_active: boolean;
    synced: boolean;
}

export interface Shift {
    id: string;
    cashier_id: string;
    branch_id: string;
    status: 'open' | 'closed';
    opening_time: string;
    opening_float: number;
    closing_time?: string;
    closing_cash_declared?: number;
    expected_cash?: number;
    synced: boolean;
}

export interface HeldSale {
    id: string;
    label: string;
    items: CartItem[];
    subtotal: number;
    discount?: { type: 'percentage' | 'fixed', value: number };
    customer?: Customer;
    branch_id: string;
    created_at: string;
}

export interface Supplier {
    id: string;
    organisation_id?: string;
    branch_id: string;
    name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    synced: boolean;
}

export interface PurchaseOrder {
    id: string;
    branch_id: string;
    supplier_id: string;
    po_number: string;
    items: { product_id: string; name: string; quantity: number; unit_price: number }[];
    total_amount: number;
    status: 'draft' | 'sent' | 'received' | 'cancelled';
    synced: boolean;
    created_at: string;
}

export interface Expense {
    id: string;
    branch_id: string;
    cashier_id: string;
    category: 'Rent' | 'Utilities' | 'Salaries' | 'Petty Cash' | 'Other';
    amount: number;
    description: string;
    receipt_url?: string;
    date: string;
    synced: boolean;
}

const db = new Dexie('SwiftPOS') as Dexie & {
    products: EntityTable<Product, 'id'>;
    transactions: EntityTable<Transaction, 'id'>;
    syncQueue: EntityTable<SyncQueue, 'id'>;
    heldSales: EntityTable<HeldSale, 'id'>;
    customers: EntityTable<Customer, 'id'>;
    categories: EntityTable<Category, 'id'>;
    staff: EntityTable<Staff, 'id'>;
    shifts: EntityTable<Shift, 'id'>;
    suppliers: EntityTable<Supplier, 'id'>;
    purchaseOrders: EntityTable<PurchaseOrder, 'id'>;
    expenses: EntityTable<Expense, 'id'>;
};

db.version(6).stores({
    products: '&id, barcode, category_id, branch_id, synced',
    transactions: '&id, branch_id, cashier_id, synced, created_at',
    syncQueue: '++id, table, operation, attempts',
    heldSales: '&id, branch_id',
    customers: '&id, phone, branch_id, synced',
    categories: '&id, branch_id',
    staff: '&id, role, branch_id, is_active, synced',
    shifts: '&id, cashier_id, branch_id, status, synced',
    suppliers: '&id, branch_id',
    purchaseOrders: '&id, branch_id, supplier_id, status, created_at',
    expenses: '&id, branch_id, category, date, synced'
}).upgrade(tx => {
    // Database upgraded from v1 to v2. Schema updated.
});

// Polyfill for version 1 if needed (redefine in version 1 for safe upgrade testing if needed, but since it's initial phase we can just drop DB or upgrade)
db.version(1).stores({
    products: '&id, barcode, category_id, branch_id, synced',
    transactions: '&id, branch_id, cashier_id, synced, created_at',
    syncQueue: '++id, table, operation, attempts',
    customers: '&id, phone, branch_id, synced',
    categories: '&id, branch_id'
});

export { db };
