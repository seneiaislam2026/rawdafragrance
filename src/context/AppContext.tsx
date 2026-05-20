import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

// Product Type
export interface Product {
  id: string;
  name: string;
  category: 'Attar' | 'Perfume' | 'Gift Sets';
  price: number;
  discountPercentage?: number;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  isPopular?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

// Initial Mock Data
export const productsData: Product[] = [
  {
    id: '1',
    name: 'Oud Al Layl',
    category: 'Attar',
    price: 120,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
    description: 'A deep, enchanting oud that lingers through the night. Perfect for evening wear.',
    rating: 4.8,
    reviews: 124,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Royal Musk',
    category: 'Perfume',
    price: 250,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop',
    description: 'An elegant blend of white musk and amber, creating a sophisticated trail.',
    rating: 4.9,
    reviews: 89,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Desert Rose',
    category: 'Attar',
    price: 95,
    image: 'https://images.unsplash.com/photo-1599557677931-e4905eff785f?q=80&w=600&auto=format&fit=crop',
    description: 'A spicy floral concoction inspired by the hidden oasis in a vast desert.',
    rating: 4.5,
    reviews: 56,
  },
  {
    id: '4',
    name: 'The Sultan Collection',
    category: 'Gift Sets',
    price: 499,
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop',
    description: 'A premium box set of our 5 best-selling miniature attars and perfumes.',
    rating: 5.0,
    reviews: 210,
    isPopular: true,
  },
  {
    id: '5',
    name: 'Velvet Iris',
    category: 'Perfume',
    price: 180,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600&auto=format&fit=crop',
    description: 'A smooth, powdery iris scent with undertones of vanilla and cedarwood.',
    rating: 4.6,
    reviews: 42,
  },
  {
    id: '6',
    name: 'Nomad Soul',
    category: 'Attar',
    price: 110,
    image: 'https://images.unsplash.com/photo-1628148967926-d3c7ab0840c8?q=80&w=600&auto=format&fit=crop',
    description: 'Woody notes mixed with cardamom and saffron for the adventurous spirit.',
    rating: 4.7,
    reviews: 67,
  }
];

// Context Type definition
export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  city: string;
  address: string;
  phone: string;
  items: {name: string, qty: number}[];
}

const STATIC_ORDERS: Order[] = [
  { 
    id: 'ORD-9103', 
    customer: 'Seneia Islam', 
    date: 'May 3, 09:12 AM', 
    total: 85.00, 
    status: 'Pending',
    city: 'Dhaka',
    address: 'Savar',
    phone: '01605707783',
    items: [{ name: 'Desert Rose', qty: 3 }]
  },
  { 
    id: '60WUT5', 
    customer: 'Seneia Islam', 
    date: 'May 2, 06:17 AM', 
    total: 859.98, 
    status: 'Process',
    city: 'Dhaka',
    address: 'Savar',
    phone: '01605707783',
    items: [{ name: 'Sony WH-1000XM5', qty: 2 }]
  },
  { 
    id: 'ORD-8921', 
    customer: 'John Doe', 
    date: 'Apr 15, 10:30 AM', 
    total: 340.00, 
    status: 'Delivered',
    city: 'Sylhet',
    address: 'Zindabazar',
    phone: '01711223344',
    items: [{ name: 'Oud Al Layl', qty: 2 }]
  },
  { 
    id: 'ORD-9034', 
    customer: 'Alice Smith', 
    date: 'May 1, 02:45 PM', 
    total: 120.00, 
    status: 'Shipped',
    city: 'Chittagong',
    address: 'GEC Circle',
    phone: '01811223344',
    items: [{ name: 'Nomad Soul', qty: 1 }]
  },
  { 
    id: 'ORD-9150', 
    customer: 'Bob Johnson', 
    date: 'May 3, 11:20 AM', 
    total: 450.00, 
    status: 'Returned',
    city: 'Khulna',
    address: 'Shib Bari',
    phone: '01911223344',
    items: [{ name: 'The Sultan Collection', qty: 1 }]
  }
];

export interface StoreSettings {
  showHeroBanner: boolean;
  banners: string[];
  couponCode: string;
  couponDiscountPercentage: number;
  whatsappNumber: string;
}

interface ToastMessage {
  id: number;
  message: string;
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Auth state
  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  isUserLoggedIn: boolean;
  loginUser: () => void;
  logoutUser: () => void;
  
  // Mock DB
  products: Product[];
  setProducts: (products: Product[]) => void;
  
  orders: Order[];
  setOrders: (orders: Order[]) => void;

  storeSettings: StoreSettings;
  setStoreSettings: (settings: StoreSettings) => void;

  // UI
  addToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: StoreSettings = {
  showHeroBanner: true,
  banners: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1600&auto=format&fit=crop'
  ],
  couponCode: 'LUXURY20',
  couponDiscountPercentage: 20,
  whatsappNumber: '+8801950959931'
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>(productsData);
  const [orders, setOrders] = useState<Order[]>(STATIC_ORDERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    addToast('Added to cart successfully!');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => {
    const price = item.discountPercentage ? item.price * (1 - item.discountPercentage / 100) : item.price;
    return total + (price * item.quantity);
  }, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const loginAdmin = () => setIsAdmin(true);
  const logoutAdmin = () => setIsAdmin(false);

  const loginUser = () => setIsUserLoggedIn(true);
  const logoutUser = () => setIsUserLoggedIn(false);

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount,
      isAdmin, loginAdmin, logoutAdmin,
      isUserLoggedIn, loginUser, logoutUser,
      products, setProducts,
      orders, setOrders,
      storeSettings, setStoreSettings,
      addToast
    }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-brand-dark text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-brand-border/20 pointer-events-auto"
            >
              <CheckCircle2 size={18} className="text-gold-500 shrink-0" />
              <span className="text-sm font-medium pr-4">{toast.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
