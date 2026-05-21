import { useState } from 'react';
import { Package, User, Heart, Settings, LogOut, CheckCircle2, Clock, Trash2, MapPin, Truck, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const MOCK_ORDERS = [
  { id: 'ORD-8921', date: '2026-04-15', total: 340.00, status: 'Delivered', items: 2 },
  { id: 'ORD-9034', date: '2026-05-01', total: 120.00, status: 'Processing', items: 1 },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const { products, isUserLoggedIn, loginUser, logoutUser, loginAdmin } = useApp();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock Wishlist
  const wishlist = [products[0], products[2]];

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: <User size={18} /> },
    { id: 'orders', name: 'Order History', icon: <Package size={18} /> },
    { id: 'wishlist', name: 'Wishlist', icon: <Heart size={18} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} /> },
  ];

  const userOrders = useApp().orders.filter(o => o.customer === 'Seneia Islam');

  if (!isUserLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-brand-light flex animate-in fade-in duration-500">
        {/* Left Side - Image (Desktop Only) */}
        <div className="hidden lg:block lg:w-1/2 relative bg-brand-dark">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80" 
            alt="Luxury Perfume" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center p-12">
            <h2 className="font-serif text-5xl text-white mb-6">Discover Your Signature Scent</h2>
            <p className="text-white/80 text-lg max-w-md font-light leading-relaxed">
              Join our exclusive community to manage your orders, track shipments, and access members-only collections.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 pb-20">
          <div className="w-full max-w-md bg-white p-10 sm:p-12 rounded-[20px] shadow-2xl shadow-brand-dark/5 border border-brand-border/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark mb-3">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-brand-muted text-sm px-4">
                {isLoginMode 
                  ? 'Sign in to access your exclusive perfume collection.' 
                  : 'Register now to explore the finest rawda fragrances.'}
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget);
              const username = formData.get('username') as string;
              const password = formData.get('password') as string;
              
              if (isLoginMode && (username === 'rawda.20' || username === 'rawda.fragrance.20') && password === 'rawda.fragrance.@20') {
                loginAdmin();
                navigate('/admin');
              } else {
                loginUser();
                const from = location.state?.from?.pathname || '/shop';
                navigate(from, { replace: true });
              }
            }}>
              {!isLoginMode && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-muted ml-1">Full Name</label>
                  <input required type="text" className="w-full bg-brand-gray/20 border border-brand-border/50 px-5 py-3.5 text-sm rounded-xl focus:border-gold-500 focus:bg-white focus:ring-1 focus:ring-gold-500 text-brand-dark outline-none transition-all placeholder:text-brand-muted/50" placeholder="Enter your full name" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-muted ml-1">Email / Username</label>
                <input name="username" required type="text" className="w-full bg-brand-gray/20 border border-brand-border/50 px-5 py-3.5 text-sm rounded-xl focus:border-gold-500 focus:bg-white focus:ring-1 focus:ring-gold-500 text-brand-dark outline-none transition-all placeholder:text-brand-muted/50" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-muted ml-1 flex justify-between">
                  Password
                  {isLoginMode && <a href="#" className="text-gold-500 hover:text-gold-600 transition-colors normal-case tracking-normal">Forgot password?</a>}
                </label>
                <input name="password" required type="password" className="w-full bg-brand-gray/20 border border-brand-border/50 px-5 py-3.5 text-sm rounded-xl focus:border-gold-500 focus:bg-white focus:ring-1 focus:ring-gold-500 text-brand-dark outline-none transition-all placeholder:text-brand-muted/50" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-4 bg-brand-dark text-white rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black hover:shadow-lg hover:shadow-brand-dark/20 transition-all duration-300 mt-6 relative overflow-hidden group">
                <span className="relative z-10">{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                <div className="absolute inset-0 h-full w-0 bg-gold-500 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="h-px bg-brand-border/60 flex-1"></div>
              <span className="text-[10px] text-brand-muted uppercase tracking-[0.2em] font-medium">or continue with</span>
              <div className="h-px bg-brand-border/60 flex-1"></div>
            </div>

            <button 
              type="button" 
              onClick={() => {
                loginUser();
                const from = location.state?.from?.pathname || '/shop';
                navigate(from, { replace: true });
              }}
              className="w-full py-3.5 mt-8 bg-white border border-brand-border/80 text-brand-dark font-medium text-sm hover:bg-brand-gray/30 transition-all flex items-center justify-center gap-3 rounded-xl shadow-sm hover:shadow-md"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <div className="mt-10 text-center text-sm text-brand-muted">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-brand-dark font-medium hover:text-gold-500 transition-colors ml-1"
              >
                {isLoginMode ? 'Register now' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-[calc(100vh-6rem)] pb-16 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Simple Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-brand-white text-3xl md:text-4xl font-serif shadow-md flex-shrink-0 relative overflow-hidden">
             <span className="relative z-10 drop-shadow-md">SI</span>
             <div className="absolute inset-0 bg-white/20"></div>
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-2 font-bold">Seneia Islam</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-gold-500/10 text-gold-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-widest border border-gold-500/20">
                Premium Member
              </span>
              <span className="text-gray-500 hidden sm:inline-block text-xs">• Joined 2026</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pt-2">
          
          {/* Enhanced Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-1">My Account</p>
                <p className="text-brand-dark text-sm font-medium">Manage your experience</p>
              </div>
              <ul className="flex flex-col p-2">
                {tabs.map(tab => (
                  <li key={tab.id}>
                    <button 
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3.5 my-1 text-sm font-medium rounded-xl transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-gold-500 text-white shadow-md shadow-gold-500/20 translate-x-1' 
                          : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50 hover:translate-x-1'
                      }`}
                    >
                      <span className={`mr-3 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.icon}</span>
                      {tab.name}
                    </button>
                  </li>
                ))}
                <li>
                  <div className="h-px bg-gray-100 mx-4 my-2"></div>
                  <button 
                    onClick={logoutUser}
                    className="w-full flex items-center px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 group"
                  >
                    <span className="mr-3 opacity-70 group-hover:opacity-100"><LogOut size={18} /></span>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content Area Details */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
            
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-serif text-2xl text-brand-dark">Personal Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your personal details and contact info.</p>
                </div>
                <div className="h-px bg-gray-100 w-full mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-brand-muted font-semibold">First Name</label>
                    <input type="text" defaultValue="Seneia" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm rounded-xl focus:border-gold-500 focus:bg-white focus:ring-1 focus:ring-gold-500 text-brand-dark transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-brand-muted font-semibold">Last Name</label>
                    <input type="text" defaultValue="Islam" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm rounded-xl focus:border-gold-500 focus:bg-white focus:ring-1 focus:ring-gold-500 text-brand-dark transition-all outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-brand-muted font-semibold">Email Address</label>
                    <input type="email" defaultValue="seneiaislam@gmail.com" disabled className="w-full bg-gray-100/50 border border-gray-200 px-4 py-3 text-sm rounded-xl text-gray-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-brand-muted font-semibold">Phone Number</label>
                    <input type="tel" defaultValue="01605707783" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm rounded-xl focus:border-gold-500 focus:bg-white focus:ring-1 focus:ring-gold-500 text-brand-dark transition-all outline-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <button className="px-8 py-3.5 bg-brand-dark text-white rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-black hover:shadow-lg hover:shadow-brand-dark/20 transition-all duration-300">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {!trackingOrder ? (
                  <>
                    <div>
                      <h2 className="font-serif text-2xl text-brand-dark">Order History</h2>
                      <p className="text-sm text-gray-500 mt-1">View and track your previous orders.</p>
                    </div>
                    <div className="h-px bg-gray-100 w-full mb-8"></div>
                    
                    {userOrders.length > 0 ? (
                      <div className="space-y-6">
                        {userOrders.map(order => (
                          <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-medium text-brand-dark text-lg">{order.id}</h3>
                                <span className={`text-xs px-3 py-1 rounded-full flex items-center font-medium ${
                                  order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 
                                  order.status === 'Returned' ? 'bg-red-50 text-red-600' : 'bg-gold-50 text-gold-600 border border-gold-100'
                                }`}>
                                  {order.status === 'Delivered' ? <CheckCircle2 size={14} className="mr-1.5" /> : <Clock size={14} className="mr-1.5" />}
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-gray-500 text-sm">Placed on {order.date}</p>
                            </div>
                            <div className="flex flex-col md:items-end w-full md:w-auto">
                              <p className="text-brand-dark font-serif text-xl font-medium">৳{(order.total || 0).toFixed(2)}</p>
                              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                                {order.items ? order.items : 1} items
                              </p>
                              <button onClick={() => setTrackingOrder(order)} className="text-gold-600 font-medium hover:text-brand-dark uppercase tracking-widest text-xs self-start md:self-end mt-2 flex items-center gap-1 group">
                                Track Order 
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setTrackingOrder(null)} className="text-brand-muted hover:text-brand-dark uppercase tracking-widest text-xs border-b border-brand-muted mb-6 inline-flex items-center pb-0.5">
                      <span className="mr-2">&larr;</span> Back to Orders
                    </button>
                    <h2 className="font-serif text-2xl text-brand-dark border-b border-brand-border pb-4 mb-8">Live Tracking: <span className="text-gold-500">{trackingOrder.id}</span></h2>
                    
                    <div className="bg-brand-light border border-brand-border p-6 md:p-10 rounded-sm">
                      {/* Tracking Progress Bar */}
                      <div className="relative mb-12 mt-8 md:px-8">
                        <div className="absolute top-1/2 left-0 right-0 md:left-8 md:right-8 h-1 bg-brand-border -translate-y-1/2 z-0"></div>
                        <div 
                          className="absolute top-1/2 left-0 md:left-8 h-1 bg-gold-500 -translate-y-1/2 z-0 transition-all duration-1000" 
                          style={{ 
                            width: trackingOrder.status === 'Delivered' ? 'calc(100% - 4rem)' :
                                   trackingOrder.status === 'Shipped' ? 'calc(66% - 2rem)' :
                                   trackingOrder.status === 'Process' ? 'calc(33% - 1rem)' : '0' 
                          }}
                        ></div>
                        
                        <div className="flex justify-between relative z-10 w-full">
                           {[
                             { status: 'Pending', icon: <Package size={16} /> },
                             { status: 'Process', icon: <Settings size={16} /> },
                             { status: 'Shipped', icon: <Truck size={16} /> },
                             { status: 'Delivered', icon: <MapPin size={16} /> }
                           ].map((step, idx) => {
                             const steps = ['Pending', 'Process', 'Shipped', 'Delivered'];
                             const currentIdx = steps.indexOf(trackingOrder.status);
                             const isCompleted = idx <= currentIdx;
                             const isCurrent = idx === currentIdx;
                             
                             return (
                               <div key={step.status} className="flex flex-col items-center relative">
                                 <div className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm ${
                                   isCompleted ? 'bg-gold-500 text-brand-white' : 'bg-brand-white border-2 border-brand-border text-brand-muted'
                                 }`}>
                                   {isCompleted && !isCurrent && step.status !== 'Delivered' ? <Check size={18} /> : step.icon}
                                 </div>
                                 <div className={`mt-3 absolute top-full left-1/2 -translate-x-1/2 w-24 text-[10px] md:text-xs uppercase tracking-widest font-medium text-center ${isCompleted ? 'text-brand-dark' : 'text-brand-muted'}`}>
                                   {step.status}
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8 mt-12 bg-brand-white border border-brand-border/50 text-center">
                        <h4 className="font-serif text-xl md:text-2xl mb-2 text-brand-dark">
                          {trackingOrder.status === 'Delivered' && "Package Delivered Successfully"}
                          {trackingOrder.status === 'Shipped' && "Package is on the way"}
                          {trackingOrder.status === 'Process' && "Order is being prepared"}
                          {trackingOrder.status === 'Pending' && "Order Received"}
                        </h4>
                        <p className="text-brand-muted text-sm">
                          {trackingOrder.status === 'Delivered' && "Your order has been delivered. Thank you for shopping with Rawda."}
                          {trackingOrder.status === 'Shipped' && "Our delivery partner has picked up your package and is heading your way."}
                          {trackingOrder.status === 'Process' && "We are carefully packing your luxury fragrances."}
                          {trackingOrder.status === 'Pending' && "We have received your order and payment details are being verified."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-serif text-2xl text-brand-dark">My Wishlist</h2>
                  <p className="text-sm text-gray-500 mt-1">Products you've saved for later.</p>
                </div>
                <div className="h-px bg-gray-100 w-full mb-8"></div>
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {wishlist.map(product => (
                    <motion.div 
                      key={product.id} 
                      className="bg-white border border-gray-100 rounded-2xl relative group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                      }}
                    >
                      <button className="absolute top-3 right-3 z-10 p-2 text-gray-400 hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-brand-light p-6 flex items-center justify-center">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </Link>
                      <div className="p-5">
                        <div className="text-gold-500 text-[10px] uppercase tracking-widest mb-1.5 font-medium">{product.category}</div>
                        <Link to={`/product/${product.id}`}><h3 className="font-serif text-lg text-brand-dark group-hover:text-gold-600 transition-colors mb-2 truncate font-semibold">{product.name}</h3></Link>
                        <p className="text-brand-dark font-medium text-lg">৳{product.price.toFixed(2)}</p>
                        <button className="w-full mt-4 py-3 bg-brand-dark text-white rounded-xl text-xs uppercase tracking-widest font-medium hover:bg-gold-500 hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-300">
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-serif text-2xl text-brand-dark">Account Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your security preferences.</p>
                </div>
                <div className="h-px bg-gray-100 w-full mb-8"></div>
                <div className="space-y-8">
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-brand-dark font-medium mb-1 text-sm uppercase tracking-widest">Change Password</h3>
                    <p className="text-xs text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                    <div className="space-y-4 max-w-md">
                      <input type="password" placeholder="Current Password" className="w-full bg-white border border-gray-200 px-4 py-3 text-sm rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-brand-dark transition-all outline-none" />
                      <input type="password" placeholder="New Password" className="w-full bg-white border border-gray-200 px-4 py-3 text-sm rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-brand-dark transition-all outline-none" />
                      <button className="px-6 py-3 bg-brand-dark text-white rounded-xl uppercase tracking-widest text-xs font-medium hover:bg-black transition-all mt-2 shadow-sm">Update Password</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
