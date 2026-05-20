import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { isAdmin } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <footer className="bg-brand-white border-t border-brand-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div>
            <Link to="/" className="text-2xl font-serif font-bold tracking-widest text-brand-dark inline-block mb-6">
              RAWDA <span className="text-gold-500 font-light">FRAGRANCE</span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              Experience the essence of authentic luxury with our hand-crafted attars and exclusive perfumes. Inspired by timeless traditions.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61586144283987" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-brand-border flex items-center justify-center text-brand-dark hover:bg-gold-500 hover:border-gold-500 hover:text-brand-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-brand-border flex items-center justify-center text-brand-dark hover:bg-gold-500 hover:border-gold-500 hover:text-brand-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-brand-border flex items-center justify-center text-brand-dark hover:bg-gold-500 hover:border-gold-500 hover:text-brand-white transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-brand-dark tracking-wide">Quick Links</h4>
            <ul className="space-y-4">
              <li><button onClick={() => { if (location.pathname !== '/') navigate(-1); }} className="text-brand-muted hover:text-gold-500 transition-colors text-sm uppercase tracking-wider flex items-center group"><ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Go Back</button></li>
              <li><Link to="/track" className="text-brand-muted hover:text-gold-500 transition-colors text-sm uppercase tracking-wider">Track Order</Link></li>
              <li><Link to="/user-dashboard" className="text-brand-muted hover:text-gold-500 transition-colors text-sm uppercase tracking-wider">My Account</Link></li>
              <li><Link to="/shop" className="text-brand-muted hover:text-gold-500 transition-colors text-sm uppercase tracking-wider">Shop All</Link></li>
              {isAdmin && (
                <li><Link to="/admin" className="text-brand-muted hover:text-gold-500 transition-colors text-sm uppercase tracking-wider">Admin Dashboard</Link></li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-brand-dark tracking-wide">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-brand-muted text-sm">
                <MapPin size={18} className="mr-3 text-gold-500 mt-0.5 shrink-0" />
                <span>Mohammadpur, Dhaka-1207</span>
              </li>
              <li className="flex items-center text-brand-muted text-sm">
                <Phone size={18} className="mr-3 text-gold-500 shrink-0" />
                <span>+880 1950 959 931</span>
              </li>
              <li className="flex items-center text-brand-muted text-sm">
                <Mail size={18} className="mr-3 text-gold-500 shrink-0" />
                <span>info@rawdafragrance.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-brand-dark tracking-wide">Newsletter</h4>
            <p className="text-brand-muted text-sm mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-brand-gray border border-brand-border px-4 py-3 text-sm focus:border-gold-500 focus:outline-none focus:ring-0 text-brand-dark rounded-none"
              />
              <button 
                type="submit" 
                className="bg-brand-dark text-brand-white border border-brand-dark hover:bg-gold-500 hover:border-gold-500 py-3 text-sm tracking-widest uppercase font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-brand-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-brand-muted uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} Rawda Fragrance. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
