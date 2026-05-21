import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { products, storeSettings } = useApp();
  const featuredProducts = products.filter(p => p.isPopular).slice(0, 4);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const displayProducts = showAllProducts ? products : featuredProducts;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!storeSettings.showHeroBanner || !storeSettings.banners || storeSettings.banners.length === 0) return;
    
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % storeSettings.banners.length);
    }, 4000); // 4 seconds
    
    return () => clearInterval(intervalId);
  }, [storeSettings.showHeroBanner, storeSettings.banners]);

  const topCategories = [
    { title: 'PREMIUM ATTAR', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&auto=format&fit=crop', desc: 'Attars' },
    { title: 'PERFUMES', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop', desc: 'Sprays' },
    { title: 'OUD WOOD', img: 'https://images.unsplash.com/photo-1590156546946-cb5afb13ec85?q=80&w=400&auto=format&fit=crop', desc: 'Exotic' },
    { title: 'GIFT SETS', img: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=400&auto=format&fit=crop', desc: 'Premium' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      
      {/* Premium Hero Section */}
      {storeSettings.showHeroBanner && storeSettings.banners && storeSettings.banners.length > 0 && (
        <section className="relative w-full h-[22vh] min-h-[180px] md:h-[30vh] md:min-h-[260px] lg:h-[35vh] lg:min-h-[300px] overflow-hidden bg-[#0c0d0f] flex items-center">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -50) {
                  setCurrentSlide((prev) => (prev + 1) % storeSettings.banners!.length);
                } else if (swipe > 50) {
                  setCurrentSlide((prev) => (prev - 1 + storeSettings.banners!.length) % storeSettings.banners!.length);
                }
              }}
            >
              <img 
                src={storeSettings.banners[currentSlide]} 
                alt="Premium Fragrance Collection" 
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover opacity-65 filter contrast-[1.05] brightness-[0.75]"
              />
              {/* Luxury dark gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/35 z-10" />
            </motion.div>
          </AnimatePresence>

          {/* Interactive Hero Content Overlay */}
          <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 flex flex-col justify-center items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-xl md:max-w-2xl"
            >
              <span className="text-gold-400 font-serif tracking-[0.25em] text-[10px] md:text-xs uppercase font-bold drop-shadow-sm mb-1.5 block">
                Exclusive Heritage Collection
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-white tracking-wide leading-[1.15] mb-2.5 sm:mb-3 uppercase drop-shadow-md">
                Elegance In <br className="hidden sm:block" />
                <span className="text-gold-400">Every Drop</span>
              </h1>
              <p className="text-gray-200 text-[11px] sm:text-[13px] md:text-sm font-sans font-light tracking-wide leading-relaxed mb-4 sm:mb-5 drop-shadow-sm opacity-90 max-w-lg">
                Experience the essence of authentic luxury with our handcrafted masterwork attars and exclusive premium perfumes. Inspired by timeless traditions.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link 
                  to="/shop" 
                  className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 active:scale-95 text-brand-dark hover:text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl shadow-black/30 hover:shadow-gold-500/15 cursor-pointer"
                >
                  Shop Now
                </Link>
                <Link 
                  to="/shop?category=Gift" 
                  className="inline-flex items-center justify-center bg-transparent border border-white/45 hover:border-gold-400 active:scale-95 hover:bg-white/5 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                >
                  Gift Sets
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {storeSettings.banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-6 bg-gold-400' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sleek Minimal Categories Selection Bar */}
      <section className="py-8 bg-brand-white/80 border-b border-brand-border/30 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto justify-start sm:justify-center items-center gap-6 sm:gap-12 md:gap-16 pb-2 pt-1 no-scrollbar scroll-smooth">
            {topCategories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/shop?category=${cat.title.split(' ')[0]}`}
                className="flex flex-col group cursor-pointer shrink-0 relative rounded-[16px] overflow-hidden isolate shadow-sm hover:shadow-md transition-all duration-500 w-[140px] sm:w-[180px] h-[160px] sm:h-[220px]"
              >
                <div className="absolute inset-0 z-0">
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-5">
                  <span className="text-[11px] sm:text-xs font-bold tracking-widest text-white group-hover:text-gold-400 transition-colors duration-300 uppercase leading-snug">
                    {cat.title}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-white/70 tracking-[0.1em] uppercase font-medium mt-1">
                    {cat.desc}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Collection */}
      <section className="py-12 md:py-20 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 md:mb-14 text-center md:text-left gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-500 mb-2 block">Our Masterworks</span>
              <h2 className="text-2xl sm:text-3xl font-serif text-brand-dark tracking-wide uppercase font-semibold">Featured Collections</h2>
              <div className="w-12 h-[1px] bg-gold-400 mt-3 mx-auto md:mx-0"></div>
            </div>
            {!showAllProducts && (
              <button 
                onClick={() => setShowAllProducts(true)} 
                className="hidden md:flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-gold-500 transition-colors border-b border-brand-dark hover:border-gold-500 pb-1 cursor-pointer"
              >
                View All <ArrowRight size={16} />
              </button>
            )}
          </div>
          
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <AnimatePresence>
              {displayProducts.map((product, i) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {!showAllProducts && (
            <div className="mt-10 text-center md:hidden">
              <button 
                onClick={() => setShowAllProducts(true)} 
                className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-dark hover:text-gold-500 transition-colors border-b border-brand-dark hover:border-gold-500 pb-1 cursor-pointer"
              >
                View All Products <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Signature Qualities - Breathing Space Benefit Bar */}
      <section className="py-12 md:py-16 bg-brand-light/30 border-y border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-500 uppercase mb-3">100% Authentic</span>
              <p className="text-brand-muted text-xs sm:text-sm font-light max-w-xs leading-relaxed">We source only the finest, pure essential oils and genuine natural fragrance concentrates.</p>
            </div>
            <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-brand-border/40 py-6 md:py-0 md:px-6">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-500 uppercase mb-3">Craftsmanship</span>
              <p className="text-brand-muted text-xs sm:text-sm font-light max-w-xs leading-relaxed">Each attar and spray is hand-selected and matured using age-old maturation techniques.</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-500 uppercase mb-3">Royal Packaging</span>
              <p className="text-brand-muted text-xs sm:text-sm font-light max-w-xs leading-relaxed">Every purchase comes wrapped in our signature velvet linings and luxury protective boxes.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
