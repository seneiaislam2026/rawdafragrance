import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['All', 'Attar', 'Perfume', 'Gift Sets'];
const SORTS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Popularity'];

export default function Shop() {
  const { products } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'Featured';

  // Filter and sort logic
  let filteredProducts = products.filter(p => {
    if (currentCategory !== 'All' && p.category !== currentCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (currentSort === 'Price: Low to High') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'Price: High to Low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'Popularity') {
    filteredProducts.sort((a, b) => b.reviews - a.reviews);
  }

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'All' || value === 'Featured') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 border-b border-brand-border pb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-4">
            {currentCategory === 'All' ? 'Our Collection' : currentCategory}
          </h1>
          <p className="text-brand-muted">Discover the finest fragrances curated for the connoisseur.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-between bg-brand-white p-4 rounded-sm border border-brand-border"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <span className="text-brand-dark uppercase tracking-widest text-sm font-medium">Filters & Sorting</span>
            <Filter size={18} className="text-gold-500" />
          </button>

          {/* Sidebar / Filters */}
          <aside className={`
            fixed inset-0 z-50 bg-brand-white p-6 overscroll-y-auto transition-transform duration-300 lg:static lg:translate-x-0 lg:w-64 lg:p-0 lg:bg-transparent lg:z-auto border-r border-brand-border lg:border-none shadow-2xl lg:shadow-none
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex justify-between items-center lg:hidden mb-8">
              <h2 className="font-serif text-2xl text-brand-dark">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="text-brand-muted hover:text-brand-dark transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-10">
              {/* Search */}
              <div>
                <h3 className="text-brand-dark uppercase tracking-widest text-xs font-semibold mb-4">Search</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-gray border border-brand-border px-4 py-3 pl-10 text-sm focus:border-gold-500 focus:ring-0 text-brand-dark"
                  />
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-brand-dark uppercase tracking-widest text-xs font-semibold mb-4">Category</h3>
                <ul className="space-y-3">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => updateParam('category', cat)}
                        className={`text-sm tracking-wider transition-colors hover:text-gold-500 ${currentCategory === cat ? 'text-gold-500 font-medium' : 'text-brand-muted'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-brand-dark uppercase tracking-widest text-xs font-semibold mb-4">Sort By</h3>
                <ul className="space-y-3">
                  {SORTS.map(sort => (
                    <li key={sort}>
                      <button 
                        onClick={() => updateParam('sort', sort)}
                        className={`text-sm tracking-wider transition-colors hover:text-gold-500 ${currentSort === sort ? 'text-brand-dark font-medium' : 'text-brand-muted'}`}
                      >
                        {sort}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <span className="text-brand-muted text-sm">{filteredProducts.length} results</span>
            </div>

            {filteredProducts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
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
                {filteredProducts.map(product => (
                  <motion.div 
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-brand-white border border-brand-border rounded-sm">
                <p className="text-brand-muted mb-2">No products found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="text-gold-500 hover:text-brand-dark uppercase tracking-widest text-sm border-b border-gold-500 pb-1 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
