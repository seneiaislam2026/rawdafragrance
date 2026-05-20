import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  
  const product = products.find(p => p.id === id);
  const relatedProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-brand-light">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-brand-dark mb-4">Product Not Found</h2>
          <button onClick={() => navigate('/shop')} className="text-gold-500 hover:text-brand-dark border-b border-gold-500 uppercase tracking-widest text-sm">Return to Shop</button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="pt-24 pb-16 bg-brand-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex text-xs uppercase tracking-widest text-brand-muted mb-8 space-x-2">
          <button onClick={() => navigate('/')} className="hover:text-gold-500">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-gold-500">Shop</button>
          <span>/</span>
          <span className="text-brand-dark">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="relative aspect-[4/5] bg-brand-white w-full overflow-hidden rounded-2xl shadow-xl shadow-brand-dark/5">
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage && (
              <div className="absolute top-6 left-6 z-20 bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm">
                -{product.discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="text-gold-500 text-xs uppercase tracking-widest font-medium mb-3">
              {product.category}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={star <= Math.floor(product.rating) ? 'fill-gold-500 text-gold-500' : 'fill-gray-100 text-gray-200'} 
                  />
                ))}
              </div>
              <span className="text-brand-muted text-sm">({product.reviews} customer reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-8">
              {product.discountPercentage ? (
                <>
                  <p className="text-3xl text-brand-dark font-bold">
                    ৳{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                  </p>
                  <p className="text-xl text-brand-muted line-through mb-1">
                    ৳{product.price.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-3xl text-brand-dark font-bold">
                  ৳{product.price.toFixed(2)}
                </p>
              )}
            </div>

            <p className="text-brand-dark/70 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center justify-between border border-brand-dark/20 bg-brand-white sm:w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-brand-muted hover:text-brand-dark transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-brand-dark font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-brand-muted hover:text-brand-dark transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-gold-500 text-brand-white border border-gold-500 py-3 px-8 flex items-center justify-center font-medium uppercase tracking-widest text-sm hover:bg-transparent hover:text-gold-500 transition-all duration-300"
              >
                <ShoppingBag size={18} className="mr-2" />
                Add to Cart
              </button>
            </div>

            {/* Meta Info */}
            <div className="border-t border-brand-border pt-6 space-y-4">
              <div className="flex items-center text-brand-muted text-sm">
                <Truck size={18} className="text-gold-500 mr-4" />
                Free shipping on luxury orders over ৳200
              </div>
              <div className="flex items-center text-brand-muted text-sm">
                <RotateCcw size={18} className="text-gold-500 mr-4" />
                30-day elegant return policy
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl text-brand-dark mb-4">You May Also Like</h2>
              <div className="w-12 h-[1px] bg-gold-500 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
