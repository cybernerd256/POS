"use client";

import { useState, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product } from "@/lib/db/dexie";
import { Plus, Search, Edit, Trash2, Tag, Upload, ArrowRightLeft } from "lucide-react";
import { ProductModal } from "@/components/inventory/ProductModal";
import { CategoryModal } from "@/components/inventory/CategoryModal";
import { StockTransferModal } from "@/components/inventory/StockTransferModal";
import { useAppStore } from "@/store/appStore";
import Papa from "papaparse";

export default function InventoryPage() {
    const { activeBranch } = useAppStore();
    const products = useLiveQuery(() => db.products.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];
    const categories = useLiveQuery(() => db.categories.where('branch_id').equals(activeBranch.id).toArray(), [activeBranch.id]) || [];

    const [search, setSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [transferProduct, setTransferProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            await db.products.delete(id);
        }
    };

    const handleEdit = (p: Product) => {
        setEditingProduct(p);
        setIsProductModalOpen(true);
    };

    const openNewModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const newProducts = results.data.map((row: any) => ({
                        id: crypto.randomUUID(),
                        branch_id: activeBranch.id,
                        name: row.name || 'Unnamed Product',
                        barcode: row.barcode || '',
                        category_id: '', // Will leave empty or assign to default
                        buying_price: Number(row.buying_price) || 0,
                        selling_price: Number(row.selling_price) || 0,
                        stock_quantity: Number(row.stock_quantity) || 0,
                        synced: false,
                        updated_at: new Date().toISOString()
                    }));

                    await db.products.bulkAdd(newProducts);
                    alert(`Successfully imported ${newProducts.length} products.`);
                } catch (error) {
                    console.error(error);
                    alert("Import failed. Ensure CSV has headers: name, barcode, buying_price, selling_price, stock_quantity");
                } finally {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            },
            error: (error) => {
                console.error(error);
                alert("Failed to parse CSV file.");
                setIsImporting(false);
            }
        });
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">Inventory</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage products, pricing, and stock levels</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="bg-surface border border-border text-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-elevated transition-colors disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" /> {isImporting ? 'Importing...' : 'Import CSV'}
                    </button>
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="bg-surface border border-border text-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-elevated transition-colors"
                    >
                        <Tag className="w-4 h-4" /> Categories
                    </button>
                    <button onClick={openNewModal} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-border flex gap-4 bg-elevated/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products by name or barcode..."
                            className="w-full bg-base border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-base sticky top-0 border-b border-border z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Product Details</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Price (UGX)</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Stock</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 bg-elevated">
                                                <Search className="w-5 h-5 text-muted-foreground opacity-50" />
                                            </div>
                                            <p className="font-semibold text-foreground">No products found</p>
                                            <p className="text-sm mt-1">Adjust your search or add a new product.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => {
                                    const catName = categories.find(c => c.id === p.category_id)?.name || 'Uncategorized';
                                    return (
                                        <tr key={p.id} className="border-b border-border hover:bg-elevated/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-foreground">{p.name}</p>
                                                <p className="text-xs text-muted-foreground flex gap-2 mt-1">
                                                    <span>{catName}</span>
                                                    {p.barcode && <span>· BC: {p.barcode}</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-accent font-semibold">{new Intl.NumberFormat('en-UG').format(p.selling_price)}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cost: {new Intl.NumberFormat('en-UG').format(p.buying_price)}</p>
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                <span className={`${p.stock_quantity <= 5 ? 'text-warning font-bold' : ''}`}>
                                                    {p.stock_quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.stock_quantity > 5 ? (
                                                    <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded border bg-teal/10 text-teal border-teal/20">In Stock</span>
                                                ) : p.stock_quantity > 0 ? (
                                                    <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded border bg-warning/10 text-warning border-warning/20">Low Stock</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded border bg-danger/10 text-danger border-danger/20">Out of Stock</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setTransferProduct(p)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-accent hover:border-accent/50 transition-colors tooltip" title="Transfer Stock">
                                                        <ArrowRightLeft className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleEdit(p)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-primary hover:border-primary/50 transition-colors tooltip" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 bg-base border border-border rounded shadow-sm hover:text-danger hover:border-danger/50 transition-colors tooltip" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isProductModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsProductModalOpen(false)}
                />
            )}

            {isCategoryModalOpen && (
                <CategoryModal
                    onClose={() => setIsCategoryModalOpen(false)}
                />
            )}

            {transferProduct && (
                <StockTransferModal
                    product={transferProduct}
                    onClose={() => setTransferProduct(null)}
                />
            )}
        </div>
    );
}
