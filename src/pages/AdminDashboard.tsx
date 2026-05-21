import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, LayoutDashboard, ShoppingBag, Package, DollarSign, TrendingUp, Edit, Trash2, Shield, Printer, Plus, Clock, Truck, CheckCircle2, ShieldAlert, Globe, Copy, User as UserIcon, Mail, MessageSquare, ShoppingCart, RotateCcw, X, Download, AlertTriangle } from 'lucide-react';
import { motion, Reorder, useDragControls } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { initAuth, googleSignIn, getAccessToken, logout as googleLogout } from '../lib/googleAuth';
import type { User } from 'firebase/auth';
import AdminCalendarView from '../components/AdminCalendarView';

const DraggableGridItem: React.FC<{ id: string, children: React.ReactNode }> = ({ id, children }) => {
  const controls = useDragControls();
  const [isPressing, setIsPressing] = useState(false);
  const pressTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const startPress = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.nativeEvent.pointerType === 'mouse') return;
    
    pressTimeout.current = setTimeout(() => {
      setIsPressing(true);
      controls.start(e);
    }, 500); // 500ms long press to drag
  };

  const clearPress = () => {
    if (pressTimeout.current) clearTimeout(pressTimeout.current);
    setIsPressing(false);
  };

  return (
    <Reorder.Item 
      key={id} 
      value={id} 
      as="div" 
      dragListener={false} 
      dragControls={controls}
      style={{ touchAction: 'pan-y' }}
      className={`outline-none relative transition-transform ${isPressing ? 'z-50 scale-105' : 'z-auto scale-100'}`}
      onPointerDown={startPress}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onPointerLeave={clearPress}
      onContextMenu={(e) => {
        // Prevent default context menu on long press on mobile
        if (e.nativeEvent.pointerType === 'touch') e.preventDefault();
      }}
    >
      {children}
    </Reorder.Item>
  );
}

export default function AdminDashboard() {
  const { isAdmin, loginAdmin, logoutAdmin, products, setProducts, orders, setOrders, storeSettings, setStoreSettings } = useApp();
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('All');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [operationsOrder, setOperationsOrder] = useState([
    'orders', 'products', 'create_order', 'access', 'settings', 'calendar'
  ]);
  
  // Create Order State
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customer: '',
    phone: '',
    city: '',
    address: '',
    total: '',
    itemsNote: ''
  });

  // Google Calendar Auth State
  const [needsAuth, setNeedsAuth] = useState(true);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async (token: string) => {
      try {
        const timeMin = new Date().toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCalendarEvents(data.items || []);
      } catch (e) {
        console.error('Failed to fetch calendar events', e);
      }
    };

    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setNeedsAuth(false);
        fetchEvents(token);
      },
      () => setNeedsAuth(true)
    );
    
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setNeedsAuth(false);
        // fetch events
        const timeMin = new Date().toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`, {
          headers: { Authorization: `Bearer ${result.accessToken}` }
        });
        const data = await res.json();
        setCalendarEvents(data.items || []);
      }
    } catch (e) {
      console.error('Google login failed', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      total: parseFloat(newOrderForm.total) || 0,
      status: 'Pending',
      customer: newOrderForm.customer || 'Guest User',
      phone: newOrderForm.phone || 'N/A',
      address: newOrderForm.address || 'Address not provided',
      city: newOrderForm.city || 'N/A',
      items: [{ name: newOrderForm.itemsNote || 'Custom Order Item', qty: 1 }]
    };
    
    setOrders([newOrder, ...orders]);
    setIsCreateOrderModalOpen(false);
    setNewOrderForm({ customer: '', phone: '', city: '', address: '', total: '', itemsNote: '' });
  };

  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Invoice', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Order ID: #${order.id}`, 14, 30);
    doc.text(`Date: ${order.date}`, 14, 38);
    
    doc.text('Customer Details:', 14, 50);
    doc.setFontSize(10);
    doc.text(`Name: ${order.customer}`, 14, 56);
    doc.text(`Phone: ${order.phone || 'N/A'}`, 14, 62);
    doc.text(`Address: ${order.address}, ${order.city}`, 14, 68);
    
    const itemsData = order.items && Array.isArray(order.items)
      ? order.items.map((item: any) => [item.name, item.qty])
      : [['Various Items (Total Count)', 1]];
      
    autoTable(doc, {
      startY: 80,
      head: [['Item Name', 'Quantity']],
      body: itemsData,
      theme: 'grid',
      headStyles: { fillColor: [10, 153, 111] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text(`Total: BDT ${order.total.toFixed(2)}`, 14, finalY + 10);
    
    doc.save(`Invoice_${order.id}.pdf`);
  };

  const handleDownloadAllConfirmedOrders = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Confirmed Orders Report', 14, 20);
    
    const confirmedOrders = orders.filter(o => o.status === 'Confirm' || o.status === 'Process' || o.status === 'Shipped');
    
    if (confirmedOrders.length === 0) {
      alert('No confirmed orders found.');
      return;
    }
    
    const bodyData = confirmedOrders.map(order => [
      `#${order.id}`,
      order.date,
      order.customer,
      `${order.address}\n${order.city}\nPhone: ${order.phone || 'N/A'}`,
      order.items && Array.isArray(order.items) ? order.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ') : `1 Item`,
      `BDT ${order.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Order ID', 'Date', 'Customer', 'Address & Contact', 'Items', 'Total']],
      body: bodyData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [10, 153, 111] }
    });
    
    doc.save('Confirmed_Orders_Report.pdf');
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    discountPercentage: '',
    category: 'Perfumes',
    imageType: 'link' as 'link' | 'file',
    imageFile: null as File | null,
    imageUrl: '',
    description: '',
    inStock: true
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((username === 'rawda.20' || username === 'rawda.fragrance.20') && password === 'rawda.fragrance.@20') {
      loginAdmin();
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const updateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create an object URL if file is chosen
    const finalImageUrl = newProduct.imageType === 'file' && newProduct.imageFile 
      ? URL.createObjectURL(newProduct.imageFile) 
      : newProduct.imageUrl;

    if (editingProductId) {
      setProducts(products.map(p => {
        if (p.id === editingProductId) {
          return {
            ...p,
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            discountPercentage: newProduct.discountPercentage ? parseFloat(newProduct.discountPercentage) : undefined,
            category: newProduct.category,
            image: finalImageUrl || p.image,
            description: newProduct.description,
            inStock: newProduct.inStock
          };
        }
        return p;
      }));
    } else {
      const productId = Math.random().toString(36).substr(2, 9);
      const productToAdd = {
        id: productId,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        discountPercentage: newProduct.discountPercentage ? parseFloat(newProduct.discountPercentage) : undefined,
        category: newProduct.category,
        image: finalImageUrl || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80',
        description: newProduct.description || 'Premium fragrance crafted with the finest luxury ingredients.',
        rating: 5.0,
        reviews: 0,
        inStock: newProduct.inStock
      };
      setProducts([...products, productToAdd]);
    }

    setIsAddProductModalOpen(false);
    setEditingProductId(null);
    // Reset form
    setNewProduct({
      name: '',
      price: '',
      discountPercentage: '',
      category: 'Perfumes',
      imageType: 'link',
      imageFile: null,
      imageUrl: '',
      description: '',
      inStock: true
    });
  };

  const openEditProductModal = (product: any) => {
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : '',
      category: product.category,
      imageType: 'link',
      imageFile: null,
      imageUrl: product.image,
      description: product.description || '',
      inStock: product.inStock !== false
    });
    setEditingProductId(product.id);
    setIsAddProductModalOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-brand-white p-8 border border-brand-border"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-brand-dark tracking-widest mb-2">RAWDA <span className="text-gold-500 font-light">ADMIN</span></h1>
            <p className="text-brand-muted uppercase tracking-widest text-xs">Secure Access Only</p>
          </div>
          
          {loginError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 mb-6 flex justify-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-brand-muted">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-brand-light border border-brand-border px-4 py-3 text-sm focus:border-gold-500 text-brand-dark" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-brand-muted">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-light border border-brand-border px-4 py-3 text-sm focus:border-gold-500 text-brand-dark" 
                required 
              />
            </div>
            <button type="submit" className="w-full py-4 bg-gold-500 text-brand-white font-medium uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors duration-300">
              Enter Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="pt-2 md:pt-4 pb-16 min-h-[calc(100vh-8rem)] bg-brand-light flex flex-col md:flex-row relative">
      
      {/* Admin Sidebar (Desktop only) */}
      <aside className="w-64 bg-brand-light border-r border-brand-border flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-brand-border">
          <h2 className="font-serif text-xl text-brand-dark tracking-widest">ADMIN PANEL</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-6 py-3 text-sm uppercase tracking-widest transition-colors ${activeTab === 'overview' ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500' : 'text-brand-muted hover:text-brand-dark border-l-2 border-transparent'}`}
              >
                <LayoutDashboard size={18} className="mr-3" /> Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-6 py-3 text-sm uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'bg-[#0A996F] text-brand-white border-l-2 border-[#0A996F]' : 'text-brand-muted hover:text-brand-dark border-l-2 border-transparent'}`}
              >
                <ShoppingBag size={18} className="mr-3" /> Orders
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center px-6 py-3 text-sm uppercase tracking-widest transition-colors ${activeTab === 'products' ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500' : 'text-brand-muted hover:text-brand-dark border-l-2 border-transparent'}`}
              >
                <Package size={18} className="mr-3" /> Products
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('access')}
                className={`w-full flex items-center px-6 py-3 text-sm uppercase tracking-widest transition-colors ${activeTab === 'access' ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500' : 'text-brand-muted hover:text-brand-dark border-l-2 border-transparent'}`}
              >
                <Shield size={18} className="mr-3" /> Access Control
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-6 py-3 text-sm uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500' : 'text-brand-muted hover:text-brand-dark border-l-2 border-transparent'}`}
              >
                <Globe size={18} className="mr-3" /> Settings
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center px-6 py-3 text-sm uppercase tracking-widest transition-colors ${activeTab === 'calendar' ? 'bg-blue-500/10 text-blue-500 border-l-2 border-blue-500' : 'text-brand-muted hover:text-brand-dark border-l-2 border-transparent'}`}
              >
                <Clock size={18} className="mr-3" /> Calendar
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-6 border-t border-brand-border">
          <button onClick={logoutAdmin} className="text-brand-muted hover:text-red-400 text-sm uppercase tracking-widest transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-2 pt-0 md:p-6 lg:p-10 overflow-y-auto pb-40 md:pb-10 min-w-0">
        
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in max-w-5xl mx-auto mt-0 px-2">
            <h2 className="font-serif text-2xl md:text-3xl text-brand-dark mb-6 text-center md:text-left">Admin Operations</h2>
            
            <Reorder.Group as="div" values={operationsOrder} onReorder={setOperationsOrder} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 touch-pan-y">
              {operationsOrder.map(id => {
                if (id === 'orders') return (
                  <DraggableGridItem key={id} id="orders">
                    <button onClick={() => setActiveTab('orders')} className="w-full bg-[#f0f9ff] flex flex-col items-center justify-center h-28 md:h-32 rounded-[20px] shadow-sm border border-transparent hover:border-blue-200 hover:shadow-md transition-all group active:scale-95">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-blue-500 text-white flex items-center justify-center mb-2 md:mb-3 shadow-sm shadow-blue-500/30 pointer-events-none">
                        <ShoppingBag size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-blue-900 text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase text-center px-1 leading-tight line-clamp-2 pointer-events-none">Orders</span>
                    </button>
                  </DraggableGridItem>
                );
                
                if (id === 'products') return (
                  <DraggableGridItem key={id} id="products">
                    <button onClick={() => setActiveTab('products')} className="w-full bg-[#faf5ff] flex flex-col items-center justify-center h-28 md:h-32 rounded-[20px] shadow-sm border border-transparent hover:border-purple-200 hover:shadow-md transition-all group active:scale-95">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-purple-500 text-white flex items-center justify-center mb-2 md:mb-3 shadow-sm shadow-purple-500/30 pointer-events-none">
                        <Package size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-purple-900 text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase text-center px-1 leading-tight line-clamp-2 pointer-events-none">Stock / Products</span>
                    </button>
                  </DraggableGridItem>
                );
                
                if (id === 'calendar') return (
                  <DraggableGridItem key={id} id="calendar">
                    <button onClick={() => setActiveTab('calendar')} className="w-full bg-[#f0fdfa] flex flex-col items-center justify-center h-28 md:h-32 rounded-[20px] shadow-sm border border-transparent hover:border-teal-200 hover:shadow-md transition-all group active:scale-95">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-teal-500 text-white flex items-center justify-center mb-2 md:mb-3 shadow-sm shadow-teal-500/30 pointer-events-none">
                        <Clock size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-teal-900 text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase text-center px-1 leading-tight line-clamp-2 pointer-events-none">Calendar</span>
                    </button>
                  </DraggableGridItem>
                );
                
                if (id === 'access') return (
                  <DraggableGridItem key={id} id="access">
                    <button onClick={() => setActiveTab('access')} className="w-full bg-[#fff1f2] flex flex-col items-center justify-center h-28 md:h-32 rounded-[20px] shadow-sm border border-transparent hover:border-rose-200 hover:shadow-md transition-all group active:scale-95">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-rose-500 text-white flex items-center justify-center mb-2 md:mb-3 shadow-sm shadow-rose-500/30 pointer-events-none">
                        <Shield size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-rose-900 text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase text-center px-1 leading-tight line-clamp-2 pointer-events-none">Users & Access</span>
                    </button>
                  </DraggableGridItem>
                );
                
                if (id === 'create_order') return (
                  <DraggableGridItem key={id} id="create_order">
                    <button onClick={() => setIsCreateOrderModalOpen(true)} className="w-full bg-[#f0fdf4] flex flex-col items-center justify-center h-28 md:h-32 rounded-[20px] shadow-sm border border-transparent hover:border-green-200 hover:shadow-md transition-all group active:scale-95">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-green-500 text-white flex items-center justify-center mb-2 md:mb-3 shadow-sm shadow-green-500/30 pointer-events-none">
                        <Plus size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-green-900 text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase text-center px-1 leading-tight line-clamp-2 pointer-events-none">Create Order</span>
                    </button>
                  </DraggableGridItem>
                );
                
                if (id === 'settings') return (
                  <DraggableGridItem key={id} id="settings">
                    <button onClick={() => setActiveTab('settings')} className="w-full bg-[#f8fafc] flex flex-col items-center justify-center h-28 md:h-32 rounded-[20px] shadow-sm border border-transparent hover:border-slate-300 hover:shadow-md transition-all group active:scale-95">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-slate-600 text-white flex items-center justify-center mb-2 md:mb-3 shadow-sm shadow-slate-600/30 pointer-events-none">
                        <Globe size={20} className="md:w-6 md:h-6" />
                      </div>
                      <span className="font-bold text-slate-800 text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase text-center px-1 leading-tight line-clamp-2 pointer-events-none">Settings</span>
                    </button>
                  </DraggableGridItem>
                );
                
                return null;
              })}
            </Reorder.Group>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="bg-brand-white border border-brand-border p-5 rounded-2xl flex flex-col justify-center items-center">
                <div className="text-brand-muted uppercase tracking-widest text-[10px] mb-2">Total Revenue</div>
                <div className="text-xl font-serif text-brand-dark">৳{totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-brand-white border border-brand-border p-5 rounded-2xl flex flex-col justify-center items-center">
                <div className="text-brand-muted uppercase tracking-widest text-[10px] mb-2">Total Orders</div>
                <div className="text-xl font-serif text-brand-dark">{totalOrders}</div>
              </div>
              <div className="bg-brand-white border border-brand-border p-5 rounded-2xl flex flex-col justify-center items-center">
                <div className="text-brand-muted uppercase tracking-widest text-[10px] mb-2">Total Products</div>
                <div className="text-xl font-serif text-brand-dark">{products.length}</div>
              </div>
              <div className="bg-brand-white border border-brand-border p-5 rounded-2xl flex flex-col justify-center items-center">
                <div className="text-brand-muted uppercase tracking-widest text-[10px] mb-2">Pending Orders</div>
                <div className="text-xl font-serif text-brand-dark">{orders.filter(o => o.status === 'Pending').length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto xl:max-w-none">
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <ShoppingCart className="text-[#0A996F]" size={36} />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold italic tracking-tight uppercase leading-none text-[#0A1A2F]">Order<br/>Management</h1>
                </div>
              </div>
              <p className="text-brand-muted font-bold text-[10px] tracking-widest uppercase ml-[52px]">Manage and process customer orders</p>
            </div>

            {/* Top Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button onClick={handleDownloadAllConfirmedOrders} className="bg-gradient-to-br from-[#0bd49c] to-[#0A996F] text-white rounded-[16px] p-4 sm:p-5 flex items-center justify-between font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden">
                <div className="absolute -right-4 -top-8 text-white/10 group-hover:rotate-12 transition-transform duration-500">
                  <Printer size={80} />
                </div>
                <div className="text-left relative z-10">
                  <span className="block opacity-80 mb-0.5 text-[8px] sm:text-[9px]">ACTION</span>
                  <span className="leading-tight text-sm sm:text-base">Batch Print<br/>Confirmed</span>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform relative z-10 shrink-0">
                  <Printer size={18} />
                </div>
              </button>
              
              <button onClick={() => setIsCreateOrderModalOpen(true)} className="bg-gradient-to-br from-[#4e7dff] to-[#1A56FF] text-white rounded-[16px] p-4 sm:p-5 flex items-center justify-between font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden">
                <div className="absolute -right-4 -top-8 text-white/10 group-hover:rotate-12 transition-transform duration-500">
                  <Plus size={80} />
                </div>
                <div className="text-left relative z-10">
                  <span className="block opacity-80 mb-0.5 text-[8px] sm:text-[9px]">CREATE</span>
                  <span className="leading-tight text-sm sm:text-base">New Order<br/>Manually</span>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform relative z-10 shrink-0">
                  <Plus size={18} />
                </div>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {/* Active */}
              <div 
                onClick={() => setOrderFilter(orderFilter === 'Active' ? 'All' : 'Active')}
                className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-[16px] p-3 shadow-md flex items-center gap-3 cursor-pointer transition-all ${orderFilter === 'Active' ? 'ring-2 ring-slate-400 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.02]'}`}
              >
                <div className="bg-slate-700/50 p-2.5 rounded-full text-white shrink-0">
                  <Package size={16} />
                </div>
                <div>
                  <div className="text-slate-400 font-bold text-[9px] tracking-widest uppercase mb-0.5">Active</div>
                  <div className="text-white font-bold text-xl leading-none">{orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Returned').length}</div>
                </div>
              </div>
              
              {/* Pending */}
              <div 
                onClick={() => setOrderFilter(orderFilter === 'Pending' ? 'All' : 'Pending')}
                className={`bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-[16px] p-3 shadow-sm border border-orange-100 flex items-center gap-3 cursor-pointer transition-all ${orderFilter === 'Pending' ? 'ring-2 ring-orange-400 ring-offset-1 scale-[1.02]' : 'hover:scale-[1.02]'}`}
              >
                <div className="bg-orange-500/10 p-2.5 rounded-full text-orange-600 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-orange-900/60 font-bold text-[9px] tracking-widest uppercase mb-0.5">Pending</div>
                  <div className="text-orange-900 font-bold text-xl leading-none">{orders.filter(o => o.status === 'Pending').length}</div>
                </div>
              </div>
              
              {/* Process */}
              <div 
                onClick={() => setOrderFilter(orderFilter === 'Process' ? 'All' : 'Process')}
                className={`bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[16px] p-3 shadow-sm border border-blue-100 flex items-center gap-3 cursor-pointer transition-all ${orderFilter === 'Process' ? 'ring-2 ring-blue-400 ring-offset-1 scale-[1.02]' : 'hover:scale-[1.02]'}`}
              >
                <div className="bg-blue-500/10 p-2.5 rounded-full text-[#1A56FF] shrink-0">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <div className="text-blue-900/60 font-bold text-[9px] tracking-widest uppercase mb-0.5">Process</div>
                  <div className="text-[#1A56FF] font-bold text-xl leading-none">{orders.filter(o => o.status === 'Process').length}</div>
                </div>
              </div>
              
              {/* Shipped */}
              <div 
                onClick={() => setOrderFilter(orderFilter === 'Shipped' ? 'All' : 'Shipped')}
                className={`bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[16px] p-3 shadow-sm border border-indigo-100 flex items-center gap-3 cursor-pointer transition-all ${orderFilter === 'Shipped' ? 'ring-2 ring-indigo-400 ring-offset-1 scale-[1.02]' : 'hover:scale-[1.02]'}`}
              >
                <div className="bg-indigo-500/10 p-2.5 rounded-full text-indigo-600 shrink-0">
                  <Truck size={16} />
                </div>
                <div>
                  <div className="text-indigo-900/60 font-bold text-[9px] tracking-widest uppercase mb-0.5">Shipped</div>
                  <div className="text-indigo-700 font-bold text-xl leading-none">{orders.filter(o => o.status === 'Shipped').length}</div>
                </div>
              </div>
              
              {/* Delivered */}
              <div 
                onClick={() => setOrderFilter(orderFilter === 'Delivered' ? 'All' : 'Delivered')}
                className={`bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[16px] p-3 shadow-sm border border-emerald-100 flex items-center gap-3 cursor-pointer transition-all ${orderFilter === 'Delivered' ? 'ring-2 ring-emerald-400 ring-offset-1 scale-[1.02]' : 'hover:scale-[1.02]'}`}
              >
                <div className="bg-emerald-500/10 p-2.5 rounded-full text-[#0A996F] shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-emerald-900/60 font-bold text-[9px] tracking-widest uppercase mb-0.5">Delivered</div>
                  <div className="text-[#0A996F] font-bold text-xl leading-none">{orders.filter(o => o.status === 'Delivered').length}</div>
                </div>
              </div>
              
              {/* Returned */}
              <div 
                onClick={() => setOrderFilter(orderFilter === 'Returned' ? 'All' : 'Returned')}
                className={`bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-[16px] p-3 shadow-sm border border-rose-100 flex items-center gap-3 cursor-pointer transition-all ${orderFilter === 'Returned' ? 'ring-2 ring-rose-400 ring-offset-1 scale-[1.02]' : 'hover:scale-[1.02]'}`}
              >
                <div className="bg-rose-500/10 p-2.5 rounded-full text-rose-600 shrink-0">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <div className="text-rose-900/60 font-bold text-[9px] tracking-widest uppercase mb-0.5">Returned</div>
                  <div className="text-rose-600 font-bold text-xl leading-none">{orders.filter(o => o.status === 'Returned').length}</div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {orders.filter(o => {
                if (orderFilter === 'All') return true;
                if (orderFilter === 'Active') return o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Returned';
                return o.status === orderFilter;
              }).map(order => (
                <div key={order.id} className="bg-white border border-brand-border rounded-[24px] p-5 md:p-6 shadow-sm">
                  {/* Top Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl md:text-2xl text-[#0a1a2f]">#{order.id}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest border border-green-200 text-[#0A996F] px-2 py-0.5 rounded-full bg-green-50">
                          <Globe size={10} /> Website
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-3 font-medium tracking-wide">{order.date}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="font-bold text-xl md:text-2xl text-[#0A996F]">৳{order.total.toFixed(2)}</div>
                      <div className="mt-3">
                        <select className="bg-indigo-50/50 text-indigo-600 text-[10px] uppercase tracking-widest font-bold rounded-full px-3 py-1.5 border border-indigo-100 outline-none cursor-pointer">
                          <option>05/05/2026</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className={`bg-[#f8fafa] rounded-2xl p-4 md:p-5 relative mt-4 ${
                    orders.some(o => o.phone === order.phone && o.status === 'Returned' && o.id !== order.id) 
                      ? 'border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                      : ''
                  }`}>
                    {orders.some(o => o.phone === order.phone && o.status === 'Returned' && o.id !== order.id) && (
                      <div className="absolute -top-3 left-4 bg-rose-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-10 animate-pulse">
                        <AlertTriangle size={12} /> PREVIOUSLY RETURNED
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        const text = `Order ID: #${order.id}\nCustomer: ${order.customer}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}\nTotal: ৳${order.total.toFixed(2)}`;
                        navigator.clipboard.writeText(text);
                        alert('Order details copied to clipboard!');
                      }}
                      className="absolute top-4 right-4 bg-[#0A996F] hover:bg-[#087a58] transition-colors text-white p-2 rounded-full shadow-sm"
                    >
                      <Copy size={14} />
                    </button>
                    <div className="flex items-start gap-3 mb-3 pr-10">
                      <UserIcon size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="font-bold text-sm uppercase italic text-[#0a1a2f] tracking-wide">{order.customer}</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-gray-500 font-medium leading-relaxed">
                        <span className="text-indigo-600 font-bold">{order.city}</span> &bull; {order.phone}<br/>
                        {order.address}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-5 bg-white rounded-xl border border-brand-border p-4">
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b border-brand-border pb-2 mb-3">Ordered Items</div>
                      {order.items && Array.isArray(order.items) ? order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] md:text-xs font-bold text-[#0a1a2f] mb-2 last:mb-0">
                          <span className="truncate pr-4">&bull; {item.name}</span>
                          <span className="bg-green-50 text-[#0A996F] px-2 py-1 rounded shrink-0">x{item.qty}</span>
                        </div>
                      )) : null}
                    </div>

                    {/* Status Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-5">
                      {['Pending', 'Confirmed', 'Process', 'Shipped'].map(status => (
                        <button 
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          className={`py-3 md:py-3 px-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                            order.status.toLowerCase() === status.toLowerCase() 
                              ? 'bg-[#1A56FF] text-white shadow-md' 
                              : 'bg-white border border-brand-border text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                          }`}
                        >
                          {order.status.toLowerCase() === status.toLowerCase() && <CheckCircle2 size={12} className="shrink-0" />} {status}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 w-full mt-3">
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-all ${
                          order.status === 'Delivered' 
                            ? 'bg-[#0A996F] text-white shadow-md' 
                            : 'bg-white border border-brand-border text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {order.status === 'Delivered' && <CheckCircle2 size={14} className="shrink-0" />} Delivered
                      </button>
                      
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Returned')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-all ${
                          order.status === 'Returned' 
                            ? 'bg-red-500 text-white shadow-md' 
                            : 'bg-white border border-brand-border text-gray-500 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        {order.status === 'Returned' && <RotateCcw size={14} className="shrink-0" />} Return
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:gap-3 justify-between mt-5 border-t border-brand-border pt-5">
                      <button 
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex-1 flex justify-center bg-white border border-gray-200 text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          const text = `Order ID: #${order.id}\nCustomer: ${order.customer}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}\nTotal: ৳${order.total.toFixed(2)}`;
                          navigator.clipboard.writeText(text);
                          // alert('Order details copied!');
                        }}
                        className="flex-1 flex justify-center bg-white border border-gray-200 text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        title="Copy Details"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          window.open(`mailto:customer@example.com?subject=Regarding Order #${order.id}`);
                        }}
                        className="flex-1 flex justify-center bg-white border border-indigo-100 text-indigo-500 p-3 rounded-xl hover:bg-indigo-50 transition-colors"
                        title="Email Customer"
                      >
                        <Mail size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          window.open(`https://wa.me/88${order.phone?.replace(/[^0-9]/g, '')}?text=Hello ${order.customer}, regarding your order #${order.id}`);
                        }}
                        className="flex-1 flex justify-center bg-white border border-green-100 text-[#0A996F] p-3 rounded-xl hover:bg-green-50 transition-colors"
                        title="WhatsApp Customer"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setOrders(orders.filter(o => o.id !== order.id));
                        }}
                        className="flex-1 flex justify-center bg-white border border-red-100 text-red-500 p-3 rounded-xl hover:bg-red-50 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-3xl text-brand-dark">Product Catalog</h2>
              <button 
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2 bg-gold-500 text-brand-white text-xs font-medium uppercase tracking-widest hover:bg-brand-dark transition-colors"
              >
                Add Product
              </button>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {products.map(product => (
                <motion.div 
                  key={product.id} 
                  className="bg-brand-white border border-brand-border overflow-hidden flex flex-col"
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                >
                  <div className="aspect-square relative flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button onClick={() => openEditProductModal(product)} className="p-2 bg-brand-light/80 text-brand-dark hover:text-brand-dark rounded-full"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-500/80 text-brand-dark hover:bg-red-500 rounded-full"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-gold-500 text-[10px] uppercase tracking-widest mb-1">{product.category}</div>
                    <h3 className="font-serif text-lg text-brand-dark mb-2 leading-tight">{product.name}</h3>
                    <div className="mt-auto flex justify-between items-end">
                      <span className="text-brand-muted text-sm">Stock: <span className="text-brand-dark">In Stock</span></span>
                      <div className="flex flex-col items-end">
                        {product.discountPercentage ? (
                          <>
                            <span className="text-brand-muted line-through text-xs">৳{product.price.toFixed(2)}</span>
                            <span className="text-brand-dark font-medium">৳{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-brand-dark font-medium">৳{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-3xl text-brand-dark">Access Control</h2>
              <button className="px-4 py-2 bg-gold-500 text-brand-white text-xs font-medium uppercase tracking-widest hover:bg-brand-dark transition-colors">
                Add Admin
              </button>
            </div>
            
            <div className="bg-brand-white border border-brand-border rounded-sm overflow-hidden mb-4">
              <div className="overflow-x-auto hidden md:block pb-4 max-w-full">
                {/* Desktop Table */}
                <table className="w-full text-left text-sm text-brand-dark min-w-[700px] whitespace-nowrap">
                  <thead className="text-xs text-brand-muted uppercase tracking-widest bg-brand-light border-b border-brand-border">
                    <tr>
                      <th className="px-6 py-4 font-normal">Name</th>
                      <th className="px-6 py-4 font-normal">Email / Username</th>
                      <th className="px-6 py-4 font-normal">Role</th>
                      <th className="px-6 py-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-brand-border hover:bg-brand-gray transition-colors">
                      <td className="px-6 py-4 font-medium">Super Admin</td>
                      <td className="px-6 py-4">rawda.20</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-sm bg-purple-500/10 text-purple-500">Superadmin</span>
                      </td>
                      <td className="px-6 py-4 text-right cursor-not-allowed text-brand-muted">Cannot remove</td>
                    </tr>
                    <tr className="border-b border-brand-border hover:bg-brand-gray transition-colors">
                      <td className="px-6 py-4 font-medium">Store Manager</td>
                      <td className="px-6 py-4">manager@rawda.com</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-sm bg-blue-500/10 text-blue-500">Admin</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
                
              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col pt-3 pb-4 space-y-3 px-3">
                <div className="bg-white border text-sm border-gray-100 rounded-[16px] p-4 shadow-sm flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-brand-dark text-base">Super Admin</div>
                      <div className="text-brand-muted text-xs mt-1">rawda.20</div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md bg-purple-500/10 text-purple-600">Superadmin</span>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-gray-50">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-brand-muted">Cannot remove</span>
                  </div>
                </div>
                
                <div className="bg-white border text-sm border-gray-100 rounded-[16px] p-4 shadow-sm flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-brand-dark text-base">Store Manager</div>
                      <div className="text-brand-muted text-xs mt-1">manager@rawda.com</div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md bg-blue-500/10 text-blue-600">Admin</span>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-gray-50">
                    <button className="flex items-center text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-red-100 transition-colors">
                      <Trash2 size={12} className="mr-1.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-serif text-2xl text-brand-dark">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-sm text-brand-muted mt-1">{editingProductId ? 'Update product details' : 'Add a new fragrance to the catalog'}</p>
                </div>
                <button 
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <form id="add-product-form" onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Product Name*</label>
                      <input 
                        required 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        type="text" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. Oud Al Layl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Price (৳)*</label>
                      <input 
                        required 
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        type="number" 
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. 150.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Discount (%)</label>
                      <input 
                        value={newProduct.discountPercentage}
                        onChange={(e) => setNewProduct({...newProduct, discountPercentage: e.target.value})}
                        type="number" 
                        min="0"
                        max="100"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Category</label>
                    <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl border border-gray-200">
                      {['Perfumes', 'Attar', 'Gift Sets', 'Incense', 'Oud Wood'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewProduct({...newProduct, category: cat})}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${newProduct.category === cat ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Product Image</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="imageType" 
                            checked={newProduct.imageType === 'link'}
                            onChange={() => setNewProduct({...newProduct, imageType: 'link'})}
                            className="text-gold-500 focus:ring-gold-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Image Link</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="imageType" 
                            checked={newProduct.imageType === 'file'}
                            onChange={() => setNewProduct({...newProduct, imageType: 'file'})}
                            className="text-gold-500 focus:ring-gold-500"
                          />
                          <span className="text-sm font-medium text-gray-700">File Upload</span>
                        </label>
                      </div>
                    </div>

                    {newProduct.imageType === 'link' ? (
                      <input 
                        type="url" 
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="https://example.com/image.jpg"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewProduct({...newProduct, imageFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mb-3">
                            <Plus size={24} className="text-gold-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Click to upload an image</span>
                          <span className="text-xs text-brand-muted mt-1">PNG, JPG, WEBP up to 5MB</span>
                        </label>
                        {newProduct.imageFile && (
                          <div className="mt-4 text-sm font-medium text-gold-600 bg-gold-500/10 py-2 px-4 rounded-lg inline-block">
                            Selected: {newProduct.imageFile.name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Description</label>
                    <textarea 
                      rows={6}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                      placeholder="Briefly describe the notes and essence of the fragrance..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <div className="text-sm font-medium text-brand-dark">Stock Status</div>
                      <div className="text-xs text-brand-muted mt-0.5">Will this product be available for purchase immediately?</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                    </label>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="add-product-form"
                  className="px-6 py-2.5 rounded-xl bg-brand-dark text-white font-medium text-sm hover:bg-black transition-colors shadow-lg shadow-brand-dark/20"
                >
                  {editingProductId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Order Modal */}
        {isCreateOrderModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#1A56FF] text-white">
                <div>
                  <h3 className="font-serif text-2xl">Create New Order</h3>
                  <p className="text-sm text-indigo-100 mt-1">Manually enter order details</p>
                </div>
                <button 
                  onClick={() => setIsCreateOrderModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <form id="create-order-form" onSubmit={handleCreateOrder} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Customer Name*</label>
                      <input 
                        required 
                        value={newOrderForm.customer}
                        onChange={(e) => setNewOrderForm({...newOrderForm, customer: e.target.value})}
                        type="text" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A56FF] focus:ring-1 focus:ring-[#1A56FF] outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. Seneia Islam"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Phone Number*</label>
                      <input 
                        required 
                        value={newOrderForm.phone}
                        onChange={(e) => setNewOrderForm({...newOrderForm, phone: e.target.value})}
                        type="text" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A56FF] focus:ring-1 focus:ring-[#1A56FF] outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. 017XXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">City*</label>
                      <input 
                        required 
                        value={newOrderForm.city}
                        onChange={(e) => setNewOrderForm({...newOrderForm, city: e.target.value})}
                        type="text" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A56FF] focus:ring-1 focus:ring-[#1A56FF] outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. Dhaka"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Total Amount (৳)*</label>
                      <input 
                        required 
                        value={newOrderForm.total}
                        onChange={(e) => setNewOrderForm({...newOrderForm, total: e.target.value})}
                        type="number" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A56FF] focus:ring-1 focus:ring-[#1A56FF] outline-none transition-all placeholder:text-gray-400"
                        placeholder="e.g. 1500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Full Address*</label>
                    <textarea 
                      required 
                      value={newOrderForm.address}
                      onChange={(e) => setNewOrderForm({...newOrderForm, address: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A56FF] focus:ring-1 focus:ring-[#1A56FF] outline-none transition-all placeholder:text-gray-400 resize-none h-20"
                      placeholder="e.g. House 14, Road 2, Block A"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Items Note (Included Products)</label>
                    <textarea 
                      value={newOrderForm.itemsNote}
                      onChange={(e) => setNewOrderForm({...newOrderForm, itemsNote: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1A56FF] focus:ring-1 focus:ring-[#1A56FF] outline-none transition-all placeholder:text-gray-400 resize-none h-20"
                      placeholder="e.g. Oud Al Layl x1, Premium Attar x1"
                    />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setIsCreateOrderModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="create-order-form"
                  className="px-6 py-2.5 rounded-xl bg-[#1A56FF] text-white font-medium text-sm hover:bg-[#1546cc] transition-colors shadow-lg shadow-[#1A56FF]/20 flex items-center gap-2"
                >
                  <Plus size={16} /> Create Order
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl text-brand-dark mb-4">Google Calendar Integration</h2>
            
            <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-sm">
              {needsAuth ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <CalendarIcon size={32} />
                  </div>
                  <h3 className="font-serif text-2xl text-brand-dark mb-3">Connect your Calendar</h3>
                  <p className="text-brand-muted mb-8 max-w-md">Connect your Google account to automatically manage scheduling and appointments straight from your admin dashboard.</p>
                  
                  <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="gsi-material-button bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition-all px-4 py-3 flex items-center justify-center gap-3 w-full max-w-xs cursor-pointer">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6" />
                    <span className="font-medium text-gray-700">{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      {googleUser?.photoURL ? (
                        <img src={googleUser.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center text-xl font-serif">
                          {googleUser?.displayName?.charAt(0) || <UserIcon size={20} />}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-brand-dark">{googleUser?.displayName}</h3>
                        <p className="text-sm text-brand-muted">{googleUser?.email}</p>
                      </div>
                    </div>
                    <button onClick={googleLogout} className="px-4 py-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium">
                      Disconnect
                    </button>
                  </div>
                  
                  <h4 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                    <CalendarIcon className="text-gold-500" size={20} /> Upcoming Events
                  </h4>
                  
                  {calendarEvents.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-brand-muted">No upcoming events found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calendarEvents.map((event: any) => (
                        <div key={event.id} className="p-4 border border-brand-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gold-500/30 transition-colors">
                          <div>
                            <h5 className="font-bold text-brand-dark">{event.summary || 'Untitled Event'}</h5>
                            <p className="text-sm text-brand-muted mt-1 max-w-lg truncate">{event.description || 'No description'}</p>
                          </div>
                          <div className="flex-shrink-0 text-right md:text-left text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <div className="font-medium text-brand-dark">
                              {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'All day'}
                            </div>
                            {event.location && (
                              <div className="text-brand-muted mt-0.5 text-xs flex items-center justify-end md:justify-start gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <CalendarIcon className="text-blue-500" size={36} />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold italic tracking-tight uppercase leading-none text-[#0A1A2F]">Events<br/>Schedule</h1>
                </div>
              </div>
              <p className="text-brand-muted font-bold text-[10px] tracking-widest uppercase ml-[52px]">Manage your Google Calendar workspace</p>
            </div>
            
            <AdminCalendarView />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-serif text-3xl text-brand-dark mb-4">Store Settings</h2>
            
            <div className="bg-brand-white border border-brand-border p-6 md:p-8 space-y-8 max-w-3xl">
              
              {/* Banner Control */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl border-b border-gray-100 pb-2">Hero Banner</h3>
                <div className="flex flex-col gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-brand-dark">Show Hero Banner</h4>
                      <p className="text-xs text-gray-500">Toggle whether the banner appears on the home page.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={storeSettings.showHeroBanner}
                        onChange={(e) => setStoreSettings({...storeSettings, showHeroBanner: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A996F]"></div>
                    </label>
                  </div>
                  
                  {storeSettings.showHeroBanner && (
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-brand-dark text-sm">Banner Images</h4>
                        <button 
                          onClick={() => {
                            const newBanners = storeSettings.banners ? [...storeSettings.banners] : [];
                            if (newBanners.length < 5) {
                              setStoreSettings({...storeSettings, banners: [...newBanners, '']});
                            }
                          }}
                          className="px-3 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 transition-colors"
                        >
                          + Add Banner
                        </button>
                      </div>
                      <div className="space-y-3">
                        {storeSettings.banners?.map((banner, index) => (
                           <div key={index} className="flex items-center gap-2">
                             <input 
                                type="text"
                                value={banner}
                                onChange={(e) => {
                                  const newBanners = [...storeSettings.banners];
                                  newBanners[index] = e.target.value;
                                  setStoreSettings({...storeSettings, banners: newBanners});
                                }}
                                placeholder="Paste image URL here"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#0A996F] outline-none"
                             />
                             <button
                               onClick={() => {
                                 const newBanners = storeSettings.banners.filter((_, i) => i !== index);
                                 setStoreSettings({...storeSettings, banners: newBanners});
                               }}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        ))}
                        {(!storeSettings.banners || storeSettings.banners.length === 0) && (
                          <p className="text-xs text-gray-500 italic">No banners added. Click "+ Add Banner" to add some.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon Management */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl border-b border-gray-100 pb-2">Coupon Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Active Coupon Code</label>
                    <input 
                      type="text" 
                      value={storeSettings.couponCode}
                      onChange={(e) => setStoreSettings({...storeSettings, couponCode: e.target.value.toUpperCase()})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A996F] focus:ring-1 focus:ring-[#0A996F] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Discount Percentage (%)</label>
                    <input 
                      type="number" 
                      value={storeSettings.couponDiscountPercentage}
                      onChange={(e) => setStoreSettings({...storeSettings, couponDiscountPercentage: Number(e.target.value)})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A996F] focus:ring-1 focus:ring-[#0A996F] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Support */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl border-b border-gray-100 pb-2">Support Contact</h3>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={storeSettings.whatsappNumber}
                      onChange={(e) => setStoreSettings({...storeSettings, whatsappNumber: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A996F] focus:ring-1 focus:ring-[#0A996F] outline-none"
                      placeholder="e.g. 01605707783"
                    />
                    <p className="text-xs text-gray-500">Enable floating WhatsApp button by providing the 11-digit local mobile number (e.g., 01700000000).</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Contact Email</label>
                    <input 
                      type="email" 
                      value={storeSettings.emailAddress}
                      onChange={(e) => setStoreSettings({...storeSettings, emailAddress: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A996F] focus:ring-1 focus:ring-[#0A996F] outline-none"
                      placeholder="e.g. rawdafragrance@gmail.com"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation (Visible only on mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-between px-2 py-2 z-[40] overflow-x-auto hide-scrollbar gap-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === 'overview' ? 'bg-amber-50 shadow-sm' : 'hover:bg-gray-50'}`}
        >
          <LayoutDashboard size={22} className={`mb-1 transition-transform duration-300 ${activeTab === 'overview' ? 'scale-110 text-amber-500' : 'text-amber-400 opacity-60'}`} />
          <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'overview' ? 'text-amber-600' : 'text-amber-500 opacity-60'}`}>Menu</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === 'orders' ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-50'}`}
        >
          <ShoppingCart size={22} className={`mb-1 transition-transform duration-300 ${activeTab === 'orders' ? 'scale-110 text-blue-500' : 'text-blue-400 opacity-60'}`} />
          <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'orders' ? 'text-blue-600' : 'text-blue-500 opacity-60'}`}>Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === 'products' ? 'bg-purple-50 shadow-sm' : 'hover:bg-gray-50'}`}
        >
          <Package size={22} className={`mb-1 transition-transform duration-300 ${activeTab === 'products' ? 'scale-110 text-purple-500' : 'text-purple-400 opacity-60'}`} />
          <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'products' ? 'text-purple-600' : 'text-purple-500 opacity-60'}`}>Stock</span>
        </button>
        <button 
          onClick={() => setActiveTab('access')}
          className={`flex-1 flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === 'access' ? 'bg-rose-50 shadow-sm' : 'hover:bg-gray-50'}`}
        >
          <UserIcon size={22} className={`mb-1 transition-transform duration-300 ${activeTab === 'access' ? 'scale-110 text-rose-500' : 'text-rose-400 opacity-60'}`} />
          <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'access' ? 'text-rose-600' : 'text-rose-500 opacity-60'}`}>Users</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-[18px] transition-all duration-300 ${activeTab === 'settings' ? 'bg-teal-50 shadow-sm' : 'hover:bg-gray-50'}`}
        >
          <Globe size={22} className={`mb-1 transition-transform duration-300 ${activeTab === 'settings' ? 'scale-110 text-teal-500' : 'text-teal-400 opacity-60'}`} />
          <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeTab === 'settings' ? 'text-teal-600' : 'text-teal-500 opacity-60'}`}>Settings</span>
        </button>
      </nav>

    </div>
  );
}
