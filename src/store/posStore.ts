import { create } from 'zustand';
import { CartItem, Product, Customer } from '@/lib/db/dexie';

export type Discount = { type: 'percentage' | 'fixed'; value: number };

interface PosState {
    cart: (CartItem & { product: Product })[];
    cartDiscount: Discount;
    customer: Customer | null;
    paymentMethod: 'cash' | 'mobile_money' | 'card' | 'split' | 'credit';

    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    setItemDiscount: (productId: string, discount: Discount | undefined) => void;

    setCartDiscount: (discount: Discount) => void;
    setCustomer: (customer: Customer | null) => void;
    setPaymentMethod: (method: 'cash' | 'mobile_money' | 'card' | 'split' | 'credit') => void;

    clearCart: () => void;
    loadHeldSale: (cart: (CartItem & { product: Product })[], cartDiscount: Discount, customer: Customer | null) => void;

    getSubtotal: () => number;
    getDiscountAmount: () => number;
    getTotal: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
    cart: [],
    cartDiscount: { type: 'fixed', value: 0 },
    customer: null,
    paymentMethod: 'cash',

    addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            set({
                cart: cart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            });
        } else {
            set({
                cart: [...cart, { product_id: product.id, product, quantity, price: product.selling_price }]
            });
        }
    },

    removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.product_id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        set({
            cart: get().cart.map(item =>
                item.product_id === productId ? { ...item, quantity } : item
            )
        });
    },

    setItemDiscount: (productId, discount) => {
        set({
            cart: get().cart.map(item =>
                item.product_id === productId ? { ...item, discount } : item
            )
        });
    },

    setCartDiscount: (discount) => set({ cartDiscount: discount }),
    setCustomer: (customer) => set({ customer }),
    setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

    clearCart: () => set({
        cart: [],
        cartDiscount: { type: 'fixed', value: 0 },
        customer: null,
        paymentMethod: 'cash'
    }),

    loadHeldSale: (cart, cartDiscount, customer) => set({ cart, cartDiscount, customer, paymentMethod: 'cash' }),

    getSubtotal: () => {
        return get().cart.reduce((acc, item) => {
            let itemTotal = item.price * item.quantity;
            if (item.discount) {
                if (item.discount.type === 'percentage') {
                    itemTotal -= itemTotal * (item.discount.value / 100);
                } else {
                    itemTotal -= item.discount.value;
                }
            }
            return acc + itemTotal;
        }, 0);
    },

    getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const { cartDiscount } = get();
        if (cartDiscount.type === 'percentage') {
            return subtotal * (cartDiscount.value / 100);
        }
        return cartDiscount.value;
    },

    getTotal: () => {
        return Math.max(0, get().getSubtotal() - get().getDiscountAmount());
    }
}));
