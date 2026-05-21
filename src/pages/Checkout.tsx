import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, CreditCard, HandCoins, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const { cart, cartTotal, removeFromCart, clearCart, orders, setOrders, addToast, storeSettings } = useApp();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === storeSettings.couponCode.toUpperCase()) {
      setDiscount(cartTotal * (storeSettings.couponDiscountPercentage / 100));
      addToast('Coupon applied successfully!');
    } else {
      addToast('Invalid coupon code.');
      setDiscount(0);
    }
  };

  const [formData, setFormData] = useState({
    name: localStorage.getItem('rawda_customer_name') || '',
    email: localStorage.getItem('rawda_customer_email') || '',
    phone: localStorage.getItem('rawda_customer_phone') || '',
    address: localStorage.getItem('rawda_customer_address') || '',
    division: localStorage.getItem('rawda_customer_division') || '',
    city: localStorage.getItem('rawda_customer_city') || '',
    area: localStorage.getItem('rawda_customer_area') || '',
    note: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Process order
    const generatedOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: generatedOrderId,
      date: new Date().toISOString().split('T')[0],
      total: cartTotal - discount,
      status: 'Pending',
      items: cart.length,
      customer: formData.name || 'Provided Name',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || 'Provided Address',
      city: formData.city || 'Dhaka',
      itemsList: cart.map(c => ({ name: c.name, qty: c.quantity }))
    };
    
    // Save to local storage for future orders
    localStorage.setItem('rawda_customer_name', formData.name);
    localStorage.setItem('rawda_customer_email', formData.email);
    localStorage.setItem('rawda_customer_phone', formData.phone);
    localStorage.setItem('rawda_customer_address', formData.address);
    localStorage.setItem('rawda_customer_division', formData.division);
    localStorage.setItem('rawda_customer_city', formData.city);
    localStorage.setItem('rawda_customer_area', formData.area);
    
    setOrders([newOrder, ...orders]);
    setPlacedOrderId(generatedOrderId);
    setOrderPlaced(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subtotal = cartTotal;
  const total = subtotal - discount;

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-brand-light">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center text-center max-w-md mx-4"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="font-serif text-3xl text-brand-dark mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Thank you for your purchase. We've received your order and are getting it ready to be shipped.</p>
          
          <div className="bg-gray-50 rounded-2xl w-full p-6 mb-8 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Tracking ID</p>
              <p className="font-mono text-2xl font-medium text-brand-dark">{placedOrderId}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(placedOrderId);
                addToast('Tracking ID copied to clipboard!');
              }}
              className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              title="Copy Tracking ID"
            >
              <Copy size={20} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-center">
            <button 
              onClick={() => navigate('/track')} 
              className="px-8 py-3.5 bg-brand-dark text-white rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black transition-all"
            >
              Track Order
            </button>
            <button 
              onClick={() => navigate('/shop')} 
              className="px-8 py-3.5 bg-white border border-gray-200 text-brand-dark rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-brand-light">
        <h2 className="font-serif text-3xl text-brand-dark mb-6">Your Cart is Empty</h2>
        <p className="text-brand-muted mb-8 max-w-md text-center">Looks like you haven't added any luxury items to your cart yet.</p>
        <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-gold-500 text-brand-white font-medium uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors">
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-12 border-b border-brand-border pb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-10">
              
              {/* Contact Info */}
              <div>
                <h2 className="font-serif text-xl border-b border-brand-border pb-3 mb-6 text-brand-dark text-gold-500">1. Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      placeholder="Full Name" 
                      className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                    />
                    <label 
                      htmlFor="name" 
                      className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                    >
                      Full Name
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      placeholder="Email Address" 
                      className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                    />
                    <label 
                      htmlFor="email" 
                      className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                    >
                      Email Address
                    </label>
                  </div>
                  <div className="relative md:col-span-2">
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                      placeholder="Phone Number" 
                      className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                    />
                    <label 
                      htmlFor="phone" 
                      className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                    >
                      Phone Number
                    </label>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="font-serif text-xl border-b border-brand-border pb-3 mb-6 text-brand-dark text-gold-500 mt-8">2. Shipping Address</h2>
                <div className="space-y-5">
                  <div className="relative">
                    <input 
                      type="text" 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      required 
                      placeholder="Street Address / House / Flat" 
                      className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                    />
                    <label 
                      htmlFor="address" 
                      className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                    >
                      Street Address / House / Flat
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <select 
                        id="division" 
                        name="division" 
                        value={formData.division} 
                        onChange={handleChange} 
                        required 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all appearance-none cursor-pointer hover:border-gray-300"
                      >
                        <option value="" disabled hidden></option>
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chattogram">Chattogram</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barishal">Barishal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                      </select>
                      <label htmlFor="division" className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 pointer-events-none">Division</label>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center pt-4 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        required 
                        placeholder="City / District" 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                      />
                      <label 
                        htmlFor="city" 
                        className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                      >
                        City / District
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <input 
                        type="text" 
                        id="area" 
                        name="area" 
                        value={formData.area} 
                        onChange={handleChange} 
                        required 
                        placeholder="Area / Thana" 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                      />
                      <label 
                        htmlFor="area" 
                        className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                      >
                        Area / Thana
                      </label>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="note" 
                        name="note" 
                        value={formData.note} 
                        onChange={handleChange} 
                        placeholder="Optional notes" 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder-transparent hover:border-gray-300" 
                      />
                      <label 
                        htmlFor="note" 
                        className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                      >
                        Order Note
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h2 className="font-serif text-xl border-b border-brand-border pb-3 mb-6 text-brand-dark text-gold-500">3. Payment Method</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'card', name: 'Credit Card', icon: <CreditCard size={18} /> },
                    { id: 'bkash', name: 'bKash', icon: <span className="font-bold text-xs">bK</span> },
                    { id: 'nagad', name: 'Nagad', icon: <span className="font-bold text-xs">N</span> },
                    { id: 'cod', name: 'Cash on Delivery', icon: <HandCoins size={18} /> },
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`cursor-pointer border p-4 flex flex-col items-center justify-center gap-3 rounded-[16px] transition-all duration-300 ${paymentMethod === method.id ? 'border-gold-500 bg-gold-500/5 ring-1 ring-gold-500 shadow-sm scale-[1.02]' : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-[1.01]'}`}
                    >
                      <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors duration-300 ${paymentMethod === method.id ? 'bg-gold-500 text-brand-white' : 'bg-gray-100 text-brand-muted'}`}>
                        {method.icon}
                      </div>
                      <span className="text-xs font-semibold tracking-wider text-brand-dark uppercase">{method.name}</span>
                    </div>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-5 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div className="relative">
                      <input 
                        type="text" 
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000" 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark font-mono outline-none transition-all placeholder:opacity-0 focus:placeholder:opacity-100 hover:border-gray-300" 
                      />
                      <label 
                        htmlFor="cardNumber" 
                        className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                      >
                        Card Number
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="relative">
                        <input 
                          type="text" 
                          id="cardExpiry"
                          placeholder="MM/YY" 
                          className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder:opacity-0 focus:placeholder:opacity-100 hover:border-gray-300" 
                        />
                        <label 
                          htmlFor="cardExpiry" 
                          className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                        >
                          Expiry (MM/YY)
                        </label>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          id="cardCvc"
                          placeholder="123" 
                          className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark outline-none transition-all placeholder:opacity-0 focus:placeholder:opacity-100 hover:border-gray-300" 
                        />
                        <label 
                          htmlFor="cardCvc" 
                          className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                        >
                          CVC
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="mt-6 space-y-5 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <p className="text-sm text-brand-muted mb-4 leading-relaxed">Please send <strong className="text-brand-dark">৳{total.toFixed(2)}</strong> to our {methodName(paymentMethod)} merchant number: <strong className="text-gold-600 font-mono">01712-345678</strong>.</p>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="paymentAccount"
                        placeholder="e.g. 017..." 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark font-mono outline-none transition-all placeholder:opacity-0 focus:placeholder:opacity-100 hover:border-gray-300" 
                      />
                      <label 
                        htmlFor="paymentAccount" 
                        className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                      >
                        {methodName(paymentMethod)} Account Number
                      </label>
                    </div>
                    <div className="relative mt-4">
                      <input 
                        type="text" 
                        id="paymentTrx"
                        placeholder="TRX..." 
                        className="peer w-full bg-white border border-gray-200 px-4 pt-6 pb-2 text-sm rounded-xl focus:border-gold-500 focus:ring-2 focus:ring-gold-500/10 text-brand-dark font-mono outline-none transition-all placeholder:opacity-0 focus:placeholder:opacity-100 hover:border-gray-300" 
                      />
                      <label 
                        htmlFor="paymentTrx" 
                        className="absolute left-4 top-2 text-[10px] uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-muted peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-gold-500 pointer-events-none"
                      >
                        Transaction ID
                      </label>
                    </div>
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className="mt-6 space-y-6 bg-white p-6 border border-gray-200 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
                     <div className="bg-gold-500/10 p-3 rounded-full text-gold-500 shrink-0">
                       <ShieldCheck size={24} />
                     </div>
                     <div>
                       <h3 className="text-brand-dark font-serif text-base mb-1">Pay with Cash on Delivery</h3>
                       <p className="text-sm text-brand-muted leading-relaxed">You can pay in cash to our courier when you receive the goods at your doorstep.</p>
                     </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-brand-white border border-brand-border p-6 lg:p-8 sticky top-24">
              <h2 className="font-serif text-xl border-b border-brand-border pb-4 mb-6 text-brand-dark text-gold-500">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="w-16 h-20 bg-brand-light flex-shrink-0 flex items-center justify-center border border-brand-border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-brand-dark">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-brand-muted hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="text-xs text-brand-muted mt-1 uppercase tracking-widest">{item.category}</div>
                      <div className="flex justify-between mt-3 text-sm">
                        <span className="text-brand-muted">Qty: {item.quantity}</span>
                        <span className="text-brand-dark font-medium">৳{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-8 border-t border-b border-brand-border py-6 relative">
                <input 
                  type="text" 
                  placeholder="Coupon Code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 min-w-0 bg-brand-white border border-brand-border px-4 py-3 text-sm rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-brand-dark outline-none transition-all" 
                />
                <button type="submit" className="px-5 py-3 bg-brand-dark text-white rounded-lg hover:bg-black text-xs uppercase tracking-widest transition-colors shadow-sm font-medium shrink-0 whitespace-nowrap">Apply</button>
              </form>

              {/* Totals */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Subtotal</span>
                  <span className="text-brand-dark">৳{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-gold-500">
                    <span>Discount</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Shipping</span>
                  <span className="text-brand-dark">Free</span>
                </div>
                
                <div className="border-t border-brand-border mt-4 pt-4 flex justify-between">
                  <span className="font-serif text-lg text-brand-dark">Total</span>
                  <span className="font-serif text-lg text-brand-dark">৳{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                className="w-full mt-8 py-4 bg-gold-500 text-brand-white font-medium uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors duration-300"
              >
                Place Order
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function methodName(id: string) {
  if (id === 'bkash') return 'bKash';
  if (id === 'nagad') return 'Nagad';
  return 'Card';
}
