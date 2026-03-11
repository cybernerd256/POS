"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, HeldSale, Transaction, PurchaseOrder, CartItem, Product } from "@/lib/db/dexie";
import { usePosStore } from "@/store/posStore";
import { Search, ScanBarcode, CheckCircle2, Trash2, ShoppingCart, UserPlus, PauseCircle, PlayCircle, Percent } from "lucide-react";
import { SyncEngine } from "@/lib/sync/syncEngine";
import { useState } from "react";
import { CustomerSelectorModal } from "@/components/pos/CustomerSelectorModal";
import { BarcodeScanner } from "@/components/pos/BarcodeScanner";
import { PostSaleModal } from "@/components/pos/PostSaleModal";
import { useAppStore } from "@/store/appStore";

export default function POSPage() {
    const products = useLiveQuery(() => db.products.toArray()) || [];
    const heldSales = useLiveQuery(() => db.heldSales.toArray()) || [];

    const {
        cart,
        cartDiscount,
        customer,
        paymentMethod,
        addToCart,
        removeFromCart,
        updateQuantity,
        setItemDiscount,
        setCustomer,
        setPaymentMethod,
        clearCart,
        loadHeldSale,
        getSubtotal,
        getDiscountAmount
    } = usePosStore();

    const { uraVatEnabled } = useAppStore();

    const [showHeldSales, setShowHeldSales] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

    const handleCompleteSale = async () => {
        if (cart.length === 0) return;

        const subtotal = getSubtotal();
        const discountAmount = getDiscountAmount();
        const baseTotal = Math.max(0, subtotal - discountAmount);
        const vatAmount = uraVatEnabled ? baseTotal * 0.18 : 0;
        const finalTotal = baseTotal + vatAmount;

        const transaction: Transaction = {
            id: crypto.randomUUID(),
            items: cart.map(c => ({
                product_id: c.product_id,
                quantity: c.quantity,
                price: c.price,
                discount: c.discount
            })),
            subtotal: subtotal,
            discount_amount: discountAmount,
            total: finalTotal,
            payment_method: paymentMethod,
            cashier_id: 'mock-cashier',
            branch_id: 'mock-branch',
            customer_id: customer?.id,
            synced: false,
            created_at: new Date().toISOString()
        };

        await SyncEngine.pushTransaction(transaction);

        for (const item of cart) {
            const prod = await db.products.get(item.product_id);
            if (prod) {
                const newStock = prod.stock_quantity - item.quantity;
                await db.products.update(prod.id, { stock_quantity: newStock });

                // Auto-Restock Rule Logic
                if (prod.autoRestockThreshold && newStock <= prod.autoRestockThreshold && prod.supplier_id) {
                    const orderQuantity = Math.max(10, prod.autoRestockThreshold * 2);
                    const po: PurchaseOrder = {
                        id: crypto.randomUUID(),
                        branch_id: prod.branch_id,
                        supplier_id: prod.supplier_id,
                        po_number: `PO-AUTO-${Date.now().toString().slice(-6)}`,
                        items: [{
                            product_id: prod.id,
                            name: prod.name,
                            quantity: orderQuantity,
                            unit_price: prod.buying_price
                        }],
                        total_amount: orderQuantity * prod.buying_price,
                        status: 'draft',
                        synced: false,
                        created_at: new Date().toISOString()
                    };
                    // Avoid duplicating auto-POs if stock drops multiple times below threshold
                    const existingDrafts = await db.purchaseOrders.where('supplier_id').equals(prod.supplier_id).toArray();
                    const hasDraftForProduct = existingDrafts.some(d => d.status === 'draft' && d.items.some(i => i.product_id === prod.id));

                    if (!hasDraftForProduct) {
                        await db.purchaseOrders.add(po);
                    }
                }
            }
        }

        setCompletedTransaction(transaction);
        clearCart();
    };

    const handleHoldSale = async () => {
        if (cart.length === 0) return;
        const label = prompt("Enter a reference name for this held sale:", `Customer ${heldSales.length + 1}`);
        if (!label) return;

        const held: HeldSale = {
            id: crypto.randomUUID(),
            label,
            items: cart,
            subtotal: getSubtotal(),
            discount: cartDiscount,
            customer: customer || undefined,
            branch_id: 'mock-branch',
            created_at: new Date().toISOString()
        };
        await db.heldSales.add(held);
        clearCart();
    };

    const handleResumeSale = async (held: HeldSale) => {
        loadHeldSale(held.items as (CartItem & { product: Product })[], held.discount || { type: 'fixed', value: 0 }, held.customer || null);
        await db.heldSales.delete(held.id);
        setShowHeldSales(false);
    };

    const handleScan = (barcode: string) => {
        const prod = products.find(p => p.barcode === barcode);
        if (prod) {
            addToCart(prod);
        } else {
            alert("Product not found for barcode: " + barcode);
        }
        setShowScanner(false);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            {/* PRODUCT GRID SECTION */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Search Bar & Actions */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products by name or barcode..."
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-1 ring-primary text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowScanner(true)}
                        className="bg-surface border border-border px-4 rounded-lg text-primary hover:bg-elevated flex items-center gap-2"
                    >
                        <ScanBarcode className="w-5 h-5" />
                        <span className="hidden lg:inline text-sm font-semibold">Scan</span>
                    </button>
                    <button
                        onClick={() => setShowHeldSales(true)}
                        className="bg-surface border border-border px-4 rounded-lg text-primary hover:bg-elevated flex items-center gap-2 relative"
                    >
                        <PlayCircle className="w-5 h-5" />
                        <span className="hidden lg:inline text-sm font-semibold">Resume Sale</span>
                        {heldSales.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-warning text-xs font-bold text-black w-5 h-5 flex items-center justify-center rounded-full">
                                {heldSales.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {products.map(p => (
                        <button
                            key={p.id}
                            onClick={() => addToCart(p)}
                            disabled={p.stock_quantity <= 0}
                            className={`flex flex-col text-left bg-surface border shadow-sm rounded-xl p-4 transition-all ${p.stock_quantity > 0 ? 'border-border hover:border-primary hover:scale-[1.02]' : 'border-border/50 opacity-50 cursor-not-allowed'}`}
                        >
                            <div className="flex-1 min-h-[60px]">
                                <p className="font-heading font-bold text-sm leading-tight text-foreground">{p.name}</p>
                                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-base mt-2 inline-block border border-border">
                                    {p.stock_quantity > 5 ? 'In Stock' : p.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <div className="mt-2">
                                <p className="font-mono text-accent font-semibold text-base xl:text-lg tracking-tight">
                                    {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(p.selling_price)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Stock: {p.stock_quantity}</p>
                            </div>
                            {p.stock_quantity > 0 && p.stock_quantity <= 5 && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                            )}
                        </button>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                            No products available. Add items in Inventory.
                        </div>
                    )}
                </div>
            </div>

            {/* CART SECTION */}
            <div className="w-full lg:w-96 bg-surface border border-border rounded-xl flex flex-col h-[60vh] lg:h-auto overflow-hidden shrink-0 shadow-lg relative">
                {/* Cart Header */}
                <div className="p-4 border-b border-border bg-elevated flex justify-between items-center">
                    <h2 className="font-heading font-bold text-lg">Current Order</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCustomerModal(true)}
                            className="p-1.5 rounded-md hover:bg-base text-muted-foreground hover:text-primary transition-colors tooltip"
                            title="Add Customer"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                        {cart.length > 0 && (
                            <button
                                onClick={handleHoldSale}
                                className="p-1.5 rounded-md hover:bg-base text-muted-foreground hover:text-warning transition-colors tooltip"
                                title="Hold Sale"
                            >
                                <PauseCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Customer Banner */}
                {customer && (
                    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex justify-between items-center text-xs">
                        <span className="font-semibold text-primary">{customer.name}</span>
                        <button onClick={() => setCustomer(null)} className="text-muted-foreground hover:text-danger">Remove</button>
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-auto p-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                            <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Cart is empty. Select products to begin.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {cart.map(item => (
                                <div key={item.product_id} className="flex flex-col bg-base p-3 rounded-lg border border-border group relative">
                                    <div className="flex justify-between items-start pr-6">
                                        <p className="text-sm font-semibold truncate flex-1">{item.product.name}</p>
                                        <p className="font-mono text-sm text-foreground text-right ml-2">
                                            {new Intl.NumberFormat('en-UG').format((item.price * item.quantity) - (item.discount ? (item.discount.type === 'fixed' ? item.discount.value : (item.price * item.quantity * item.discount.value / 100)) : 0))}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1 bg-elevated rounded border border-border">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                            >-</button>
                                            <span className="w-6 text-center text-xs font-mono">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const val = prompt("Enter discount % (e.g. 10):", "10");
                                                if (val) setItemDiscount(item.product_id, { type: 'percentage', value: parseFloat(val) });
                                            }}
                                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 bg-elevated px-2 py-1.5 rounded border border-border"
                                        >
                                            <Percent className="w-3 h-3" /> {item.discount ? `${item.discount.value}${item.discount.type === 'percentage' ? '%' : 'UGX'} off` : 'Disc'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Totals & Checkout */}
                <div className="p-4 border-t border-border bg-base flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-mono">{new Intl.NumberFormat('en-UG').format(getSubtotal())}</span>
                    </div>

                    {(cartDiscount.value > 0 || getDiscountAmount() > 0) && (
                        <div className="flex justify-between items-center text-sm text-warning">
                            <span>Discount</span>
                            <span className="font-mono">-{new Intl.NumberFormat('en-UG').format(getDiscountAmount())}</span>
                        </div>
                    )}

                    {uraVatEnabled && (
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>URA VAT (18%)</span>
                            <span className="font-mono">{new Intl.NumberFormat('en-UG').format(Math.max(0, getSubtotal() - getDiscountAmount()) * 0.18)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-2xl font-mono font-bold text-primary">
                            {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(
                                Math.max(0, getSubtotal() - getDiscountAmount()) + (uraVatEnabled ? Math.max(0, getSubtotal() - getDiscountAmount()) * 0.18 : 0)
                            )}
                        </span>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {['cash', 'mobile_money', 'card', 'split'].map((method) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method as 'cash' | 'mobile_money' | 'card' | 'split')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all border ${paymentMethod === method ? 'bg-primary/20 text-primary border-primary' : 'bg-elevated text-muted-foreground border-border hover:bg-white/5'}`}
                            >
                                {method === 'mobile_money' ? 'MOMO' : method.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCompleteSale}
                        disabled={cart.length === 0}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        <CheckCircle2 className="w-5 h-5" /> COMPLETE SALE
                    </button>
                </div>

                {/* Held Sales Overlay Modal */}
                {showHeldSales && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-surface border border-border shadow-2xl rounded-xl w-full max-w-sm flex flex-col max-h-full">
                            <div className="p-4 border-b border-border flex justify-between items-center">
                                <h3 className="font-bold font-heading text-lg">Held Sales</h3>
                                <button onClick={() => setShowHeldSales(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                            </div>
                            <div className="p-2 flex-1 overflow-auto flex flex-col gap-2">
                                {heldSales.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">No held sales found.</p>
                                ) : (
                                    heldSales.map(h => (
                                        <div key={h.id} className="bg-base p-3 rounded-lg border border-border flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{h.label}</p>
                                                <p className="text-xs text-muted-foreground">{h.items.length} items · {new Date(h.created_at).toLocaleTimeString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleResumeSale(h)}
                                                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-bold"
                                            >
                                                Resume
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal Portals (rendered in-line for simplicity without actual portal) */}
            {showCustomerModal && <CustomerSelectorModal onClose={() => setShowCustomerModal(false)} />}
            {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
            {completedTransaction && <PostSaleModal transaction={completedTransaction} onClose={() => setCompletedTransaction(null)} />}
        </div>
    );
}
