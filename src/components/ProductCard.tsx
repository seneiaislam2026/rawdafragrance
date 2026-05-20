import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../context/AppContext';
import { useApp } from '../context/AppContext';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useApp();

  const discountedPrice = product.discountPercentage 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group relative flex flex-col bg-white border border-brand-border/40 overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-brand-dark/5"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-brand-light flex items-center justify-center p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.img 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Badges container */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-1 sm:gap-2">
          {product.isPopular && (
            <div className="bg-brand-dark text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] sm:tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-md backdrop-blur-sm">
              Featured
            </div>
          )}
          {product.discountPercentage && (
            <div className="bg-red-500 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
              <Tag size={8} className="sm:hidden" />
              <Tag size={10} className="hidden sm:block" /> 
              -{product.discountPercentage}%
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-3 sm:p-5 flex flex-col flex-grow bg-white">
        <div className="text-brand-muted text-[8px] sm:text-[10px] uppercase tracking-[0.2em] mb-1 sm:mb-2 font-medium">
          {product.category}
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-sm sm:text-lg md:text-xl mb-1 text-brand-dark group-hover:text-gold-600 transition-colors duration-300 font-semibold line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center space-x-1.5 mb-2 sm:mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={i < Math.floor(product.rating) ? 11 : 9} className={`w-2 h-2 sm:w-3 sm:h-3 ${i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'fill-gray-100 text-gray-200'}`} />
            ))}
          </div>
          <span className="text-brand-muted text-[9px] sm:text-[11px] font-medium tracking-wide">({product.reviews})</span>
        </div>
        
        <div className="mt-auto flex items-end justify-between pt-3 sm:pt-4 border-t border-brand-border/30">
          <div className="flex flex-col">
            {product.discountPercentage ? (
              <>
                <span className="text-brand-muted line-through text-[10px] sm:text-xs mb-0.5">৳{product.price.toFixed(2)}</span>
                <span className="text-sm sm:text-xl font-bold text-brand-dark leading-none">৳{discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm sm:text-xl font-bold text-brand-dark leading-none">৳{product.price.toFixed(2)}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 bg-brand-dark rounded-full text-white hover:bg-gold-500 hover:scale-110 hover:-rotate-6 transition-all duration-300 shadow-md"
            aria-label="Add to cart"
          >
            <ShoppingBag size={14} className="sm:hidden" />
            <ShoppingBag size={16} className="hidden sm:block" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default ProductCard;
