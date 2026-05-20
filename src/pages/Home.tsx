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
    { title: 'PREMIUM ATTAR', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&auto=format&fit=crop', desc: 'Concentrated essences' },
    { title: 'PERFUMES', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop', desc: 'Luxury sprays' },
    { title: 'OUD WOOD', img: 'https://images.unsplash.com/photo-1628148967926-d3c7ab0840c8?q=80&w=400&auto=format&fit=crop', desc: 'Rare and exotic' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      
      {/* Premium Hero Section */}
      {storeSettings.showHeroBanner && storeSettings.banners && storeSettings.banners.length > 0 && (
        <section className="relative w-full h-[45vh] min-h-[320px] md:h-[65vh] md:min-h-[480px] overflow-hidden bg-[#0c0d0f] flex items-center">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full"
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
              <span className="text-gold-400 font-serif tracking-[0.25em] text-xs md:text-sm uppercase font-bold drop-shadow-sm mb-3.5 block">
                Exclusive Heritage Collection
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-extrabold text-white tracking-wide leading-[1.1] mb-5 sm:mb-7 uppercase drop-shadow-md">
                Elegance In <br className="hidden sm:block" />
                <span className="text-gold-400">Every Drop</span>
              </h1>
              <p className="text-gray-200 text-xs sm:text-base md:text-[17px] font-sans font-light tracking-wide leading-relaxed mb-8 sm:mb-10 drop-shadow-sm opacity-90">
                Experience the essence of authentic luxury with our handcrafted masterwork attars and exclusive premium perfumes. Inspired by timeless traditions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/shop" 
                  className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 active:scale-95 text-brand-dark hover:text-white px-7 py-3.5 sm:px-9 sm:py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl shadow-black/30 hover:shadow-gold-500/15 cursor-pointer"
                >
                  Shop Now
                </Link>
                <Link 
                  to="/shop?category=Gift" 
                  className="inline-flex items-center justify-center bg-transparent border border-white/45 hover:border-gold-400 active:scale-95 hover:bg-white/5 text-white px-7 py-3.5 sm:px-9 sm:py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                >
                  Gift Sets
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
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

      {/* Top Categories */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center justify-center mb-12 md:mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-gold-500 mb-2">Curated Selection</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-dark tracking-wide uppercase font-semibold">Shop by Category</h2>
          <div className="w-12 h-[1px] bg-gold-500/50 mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {topCategories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group"
            >
              <Link to={`/shop?category=${cat.title.split(' ')[0]}`} className="block relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[4/5] shadow-md transition-shadow hover:shadow-xl">
                <img src={cat.img} alt={cat.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-gold-400 mb-1.5 opacity-90">{cat.desc}</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wider group-hover:text-gold-300 transition-colors duration-300 uppercase">{cat.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Signature Qualities - Breathing Space Benefit Bar */}
      <section className="py-12 md:py-16 bg-brand-light/45 border-y border-brand-border/40">
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

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-16 text-center md:text-left gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.35em] text-gold-500 mb-2 block">Our Masterworks</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-dark tracking-wide uppercase font-semibold">Featured Collections</h2>
              <div className="w-12 h-[1px] bg-gold-500/50 mt-4 mx-auto md:mx-0"></div>
            </div>
            {!showAllProducts && (
              <button 
                onClick={() => setShowAllProducts(true)} 
                className="hidden md:flex items-center gap-2 text-sm font-bold tracking-wider uppercase hover:text-gold-500 transition-colors border-b border-brand-dark hover:border-gold-500 pb-1 cursor-pointer"
              >
                View All <ArrowRight size={16} />
              </button>
            )}
          </div>
          
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
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
            <div className="mt-12 text-center md:hidden">
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

    </div>
  );
}
