import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, MapPin, X, ChevronRight, Info, Heart, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { cartCount, isAdmin, isUserLoggedIn, products } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Recommended products (top 3 popular)
  const recommendedProducts = products.filter(p => p.isPopular).slice(0, 3);
  
  // Filtered products based on search
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Close search when path changes
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <>
      {/* Top Bar */}
      <div 
        className="bg-[#1C2434] text-white px-4 shadow-sm z-40 relative"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))', paddingBottom: '12px' }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6 text-[11px] sm:text-xs">
            <button 
              onClick={() => {
                if (location.pathname !== '/') {
                  if (window.history.state && window.history.state.idx > 0) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }
              }} 
              className="flex items-center hover:text-gold-500 cursor-pointer transition-colors uppercase tracking-widest font-medium"
              aria-label="Go Back"
            >
              <ChevronRight size={14} className="rotate-180 mr-1" />
              <span>Back</span>
            </button>
            <div className="hidden sm:flex items-center space-x-1.5 hover:text-gold-500 cursor-pointer transition-colors uppercase tracking-widest font-medium">
              <MapPin size={12} className="text-gold-500" />
              <span>Store Locations</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/track" className="hover:text-gold-500 text-xs sm:text-[13px] font-semibold transition-colors uppercase tracking-widest hover:underline decoration-gold-500 underline-offset-4 decoration-2">Track Order</Link>
            <Link to={isAdmin ? "/admin" : "/user-dashboard"} className="hover:text-gold-500 text-xs sm:text-[13px] font-semibold transition-colors uppercase tracking-widest hover:underline decoration-gold-500 underline-offset-4 decoration-2">My Account</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-brand-white border-b border-brand-border sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6 md:py-7 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center relative h-10">
            
            {/* Left Box: Menu & Search */}
            <div className="flex items-center space-x-4 relative z-20">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-brand-dark hover:text-gold-500 transition-colors p-1" aria-label="Open Menu">
                {isMobileMenuOpen ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
              </button>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)} 
                className="text-brand-dark hover:text-gold-500 transition-colors p-1"
                aria-label="Search"
              >
                <Search size={22} strokeWidth={2} />
              </button>
            </div>

            {/* Center Box: Logo */}
            <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 group z-10 py-1 whitespace-nowrap" onClick={() => setIsSearchOpen(false)}>
              <span className="text-[24px] sm:text-[30px] md:text-[34px] font-serif font-extrabold tracking-[0.06em] text-brand-dark group-hover:text-gold-500 transition-colors uppercase flex flex-col items-center leading-none">
                RAWDA <span className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.35em] font-medium text-gold-500 group-hover:text-brand-dark transition-colors mt-1">FRAGRANCE</span>
              </span>
            </Link>

            {/* Right Box: Setup */}
            <div className="flex items-center space-x-4 relative z-20">
              <Link to="/user-dashboard" className="text-brand-dark hover:text-gold-500 transition-colors p-1" onClick={() => setIsSearchOpen(false)}>
                <User size={24} strokeWidth={1.5} />
              </Link>
              <Link to="/checkout" className="relative text-brand-dark hover:text-gold-500 transition-colors group p-1" onClick={() => setIsSearchOpen(false)}>
                <ShoppingBag size={24} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center border-2 border-brand-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-[102px] bg-black/40 backdrop-blur-sm z-30"
                onClick={() => setIsSearchOpen(false)}
              />
              
              {/* Search Panel */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                className="absolute top-full left-0 right-0 bg-white shadow-2xl border-b border-brand-border z-40 max-h-[85vh] overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-4xl mx-auto p-6 sm:p-8">
                  {/* Search Input */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-gold-500 transition-colors" size={24} />
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for fragrances, attars..."
                      className="w-full bg-brand-light border-0 border-b-2 border-brand-border focus:border-gold-500 focus:ring-0 text-xl font-serif py-4 pl-14 pr-12 transition-all outline-none text-brand-dark placeholder:text-brand-muted/70"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* Results & Recommendations Area */}
                  <div className="mt-8">
                    {searchQuery.trim() === '' ? (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted mb-6">Recommended for you</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {recommendedProducts.map(product => (
                            <Link 
                              key={product.id} 
                              to={`/product/${product.id}`}
                              className="group flex flex-col pt-2"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              <div className="aspect-[4/3] bg-brand-light rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              </div>
                              <h5 className="font-serif text-brand-dark group-hover:text-gold-600 transition-colors">{product.name}</h5>
                              <p className="text-brand-muted text-sm font-medium">৳{product.price.toFixed(2)}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <div className="flex justify-between items-end mb-4 border-b border-brand-border pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">Search Results</h4>
                          <span className="text-xs text-brand-muted/70">{searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}</span>
                        </div>
                        
                        {searchResults.length > 0 ? (
                          <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {searchResults.map((product, idx) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <Link
                                  to={`/product/${product.id}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center gap-4 p-3 hover:bg-brand-light rounded-xl transition-colors group"
                                >
                                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-brand-border/50 shrink-0">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-serif text-brand-dark group-hover:text-gold-600 transition-colors">{product.name}</h5>
                                    <p className="text-xs text-brand-muted uppercase tracking-widest mt-0.5">{product.category}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-brand-dark block">৳{product.price.toFixed(2)}</span>
                                    <ArrowRight size={16} className="text-gold-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-auto mt-1" />
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Search className="mx-auto text-brand-border mb-4" size={40} />
                            <h4 className="text-lg font-serif text-brand-dark mb-1">No products found</h4>
                            <p className="text-brand-muted text-sm">Update your search to find what you're looking for.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Close Button outside drawer */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 z-[110] text-white p-2 hover:opacity-80 animate-in fade-in duration-300"
              style={{ left: 'min(calc(85% + 10px), 330px)' }}
            >
              <X size={32} strokeWidth={1.5} />
            </button>

            {/* Drawer */}
            <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-left duration-300">

              {/* Top Signin Card */}
              <div 
                className="bg-[#111111] rounded-[16px] py-5 px-4 flex items-center gap-4 text-white hover:bg-black cursor-pointer transition-colors mb-8 mt-2 shadow-md border border-white/10" 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/user-dashboard'); }}
              >
                {isUserLoggedIn ? (
                  <>
                    <div className="bg-gold-500 w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 text-brand-dark font-serif text-xl">
                      SI
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-serif text-[18px] leading-normal truncate py-0.5">Seneia Islam</div>
                      <div className="text-gold-500 font-medium text-[13px] truncate">View Dashboard</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/10 w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0">
                      <User size={24} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-serif text-[18px] leading-normal truncate py-0.5">Hello there!</div>
                      <div className="text-white/70 text-[13px] tracking-wide mt-0.5 truncate border-b border-white/30 inline-block pb-0.5">Sign in / Register</div>
                    </div>
                  </>
                )}
              </div>

              {/* Categories */}
              <div className="bg-brand-gray/30 rounded-[10px] py-1 mb-8 shadow-sm">
                {[
                  { name: 'Attars', path: '/shop?category=Attar' },
                  { name: 'Perfumes', path: '/shop?category=Perfume' },
                  { name: 'Gift Sets', path: '/shop?category=Gift Sets' },
                  { name: 'Incense', path: '/shop?category=Incense' },
                  { name: 'Oud Wood', path: '/shop?category=Oud Wood' },
                ].map((item, i, arr) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-5 py-3.5 text-[14px] text-brand-dark/80 hover:bg-brand-gray/50 transition-colors ${i !== arr.length - 1 ? 'border-b border-brand-border' : ''}`}
                  >
                    {item.name}
                    <ChevronRight size={16} className="text-brand-muted" />
                  </Link>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mb-8">
                <h3 className="font-serif text-[17px] text-brand-muted/80 mb-2 inline-block">Quick Links</h3>
                <div className="w-10 h-[2px] bg-gold-500 mb-4"></div>
                
                <div className="bg-brand-gray/30 rounded-[10px] py-1 shadow-sm">
                  {[
                    { name: 'About Us', path: '/#', icon: <User size={20} className="text-brand-muted" strokeWidth={1.5} /> },
                    { name: 'Track Order', path: '/track', icon: <MapPin size={20} className="text-brand-muted" strokeWidth={1.5} /> },
                    { name: 'Wishlists', path: '/user-dashboard', icon: <Heart size={20} className="text-brand-muted" strokeWidth={1.5} /> },
                    { name: 'Faqs', path: '/#', icon: <HelpCircle size={20} className="text-brand-muted" strokeWidth={1.5} /> },
                  ].map((item, i, arr) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 text-[14px] text-brand-dark hover:bg-brand-gray/50 transition-colors ${i !== arr.length - 1 ? 'border-b border-brand-border' : ''}`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1 text-brand-dark/80">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </nav>
    </>
  );
}
