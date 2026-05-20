import { useState, FormEvent } from 'react';
import { Package, Search, Truck, Check, MapPin, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TrackOrder() {
  const { orders } = useApp();
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    const order = orders.find(o => o.id.toLowerCase() === trackingId.trim().toLowerCase());
    if (order) {
      setTrackedOrder(order);
      setError('');
    } else {
      setTrackedOrder(null);
      setError('Order not found. Please check your order ID and try again.');
    }
  };

  return (
    <div className="pt-24 pb-24 min-h-screen bg-brand-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4 drop-shadow-sm">Track Your Order</h1>
          <p className="text-brand-muted max-w-xl mx-auto text-sm md:text-base">
            Enter your order ID below to get real-time updates on your luxury fragrance delivery.
          </p>
        </div>

        <div className="bg-white p-5 md:p-10 border border-brand-border rounded-[20px] shadow-sm">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter Order ID (e.g., ORD-9103)"
                className="w-full bg-brand-light/50 border border-brand-border rounded-xl pl-12 pr-4 py-4 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-brand-dark outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>
            <button 
              type="submit"
              className="py-4 px-8 bg-brand-dark rounded-xl text-white font-medium hover:bg-black transition-colors shrink-0 shadow-lg shadow-brand-dark/20 uppercase tracking-wider text-sm"
            >
              Track Order
            </button>
          </form>

          {error && (
            <div className="text-red-500 text-sm p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              {error}
            </div>
          )}

          {trackedOrder && (
            <div className="mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
                <div>
                  <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1 font-bold">Order Details</div>
                  <h3 className="text-xl font-serif text-brand-dark">#{trackedOrder.id}</h3>
                  <p className="text-sm text-brand-muted mt-1">{trackedOrder.date}</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1 font-bold">Status</div>
                  <div className="text-lg font-bold text-gold-600 uppercase tracking-widest inline-flex items-center gap-2 bg-gold-500/10 px-4 py-1.5 rounded-full">
                    {trackedOrder.status === 'Delivered' && <Check size={18} />}
                    {trackedOrder.status}
                  </div>
                </div>
              </div>

              {/* Responsive Tracking Progress Bar */}
              <div className="relative mb-6 pb-4 sm:pb-14 mt-8 px-2 sm:px-6">
                {/* Desktop/Tablet Line */}
                <div className="hidden sm:block absolute top-7 left-10 right-10 h-1 bg-gray-100 z-0 rounded-full"></div>
                <div 
                  className="hidden sm:block absolute top-7 left-10 h-1 bg-gold-500 z-0 transition-all duration-1000 rounded-full" 
                  style={{ 
                    width: trackedOrder.status === 'Delivered' ? 'calc(100% - 6rem)' :
                           trackedOrder.status === 'Returned' ? 'calc(100% - 6rem)' :
                           trackedOrder.status === 'Shipped' ? 'calc(75% - 4.5rem)' :
                           trackedOrder.status === 'Process' ? 'calc(50% - 3rem)' : 
                           trackedOrder.status === 'Confirmed' ? 'calc(25% - 1.5rem)' : '0' 
                  }}
                ></div>
                
                <div className="flex flex-col sm:flex-row justify-between relative z-10 w-full sm:-mx-6 px-4 gap-12 sm:gap-0">
                   {[
                     { status: 'Pending', icon: <Package size={16} /> },
                     { status: 'Confirmed', icon: <Check size={16} /> },
                     { status: 'Process', icon: <Settings size={16} /> },
                     { status: 'Shipped', icon: <Truck size={16} /> },
                     { status: trackedOrder.status === 'Returned' ? 'Returned' : 'Delivered', icon: <MapPin size={16} /> }
                   ].map((step, idx) => {
                     const steps = ['Pending', 'Confirmed', 'Process', 'Shipped', trackedOrder.status === 'Returned' ? 'Returned' : 'Delivered'];
                     const currentStatus = trackedOrder.status === 'Delivered' || trackedOrder.status === 'Returned' ? trackedOrder.status : 
                                           trackedOrder.status === 'Shipped' ? 'Shipped' : 
                                           trackedOrder.status === 'Process' ? 'Process' : 
                                           trackedOrder.status === 'Confirmed' ? 'Confirmed' : 'Pending';
                                           
                     const currentIdx = steps.indexOf(currentStatus);
                     const isCompleted = idx <= currentIdx;
                     const isCurrent = idx === currentIdx;
                     const isError = step.status === 'Returned';
                     
                     return (
                       <div key={idx} className="flex flex-row sm:flex-col items-center relative group justify-start sm:justify-center gap-6 sm:gap-0 w-full sm:w-auto">
                         {/* Mobile Vertical Line */}
                         {idx < 4 && (
                           <div className="sm:hidden absolute top-12 left-6 w-0.5 h-6 bg-gray-100 -z-10 group-last:hidden"></div>
                         )}
                         {idx < 4 && idx < currentIdx && (
                           <div className="sm:hidden absolute top-12 left-6 w-0.5 h-6 bg-gold-500 -z-10 transition-all duration-1000 group-last:hidden"></div>
                         )}

                         <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                           isError && isCompleted ? 'bg-red-500 text-white' :
                           isCompleted ? 'bg-brand-dark text-gold-400' : 'bg-white border-2 border-gray-100 text-gray-400'
                         }`}>
                           {isCompleted && !isCurrent && !isError ? <Check size={18} /> : step.icon}
                         </div>
                         <div className={`sm:mt-4 text-[11px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-bold sm:text-center sm:absolute sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:w-20 leading-tight ${
                           isError && isCompleted ? 'text-red-500' :
                           isCompleted ? 'text-brand-dark' : 'text-gray-400'
                         }`}>
                           {step.status}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
              
              <div className="bg-gray-50/80 p-6 md:p-8 rounded-2xl text-center border border-gray-100 mt-6">
                <h4 className="font-serif text-lg md:text-xl mb-3 text-brand-dark">
                  {trackedOrder.status === 'Delivered' && "Package Delivered Successfully"}
                  {trackedOrder.status === 'Returned' && "Package Returned to Sender"}
                  {trackedOrder.status === 'Shipped' && "Package is on the way"}
                  {trackedOrder.status === 'Process' && "Order is being prepared"}
                  {trackedOrder.status === 'Confirmed' && "Order Confirmed"}
                  {trackedOrder.status === 'Pending' && "Order Received & Pending"}
                </h4>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                  {trackedOrder.status === 'Delivered' && "Your order has been delivered to your provided address. Thank you for shopping with Rawda."}
                  {trackedOrder.status === 'Returned' && "Your order has been returned. If you have any questions, please contact our support team."}
                  {trackedOrder.status === 'Shipped' && "Our delivery partner has picked up your package and is heading your way."}
                  {trackedOrder.status === 'Process' && "We are carefully packing your luxury fragrances."}
                  {trackedOrder.status === 'Confirmed' && "Your order has been confirmed and will be processed soon."}
                  {trackedOrder.status === 'Pending' && "We have received your order and payment details are being verified."}
                </p>
                
                <div className="mt-8 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row justify-center gap-6 sm:gap-12 text-left bg-white p-6 rounded-xl shadow-xs">
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mb-2 flex items-center gap-1.5"><MapPin size={12}/> Destination</div>
                    <div className="text-sm font-medium text-brand-dark">{trackedOrder.city}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{trackedOrder.address}</div>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200/60"></div>
                  <div className="flex-1 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                     <div className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mb-2 flex items-center gap-1.5"><Package size={12}/> Items</div>
                     <div className="text-sm text-brand-dark font-medium leading-relaxed">
                       {trackedOrder.itemsList ? trackedOrder.itemsList.map((i: any) => `${i.qty}x ${i.name}`).join(', ') : 
                       (Array.isArray(trackedOrder.items) ? trackedOrder.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ') : `${trackedOrder.items || 1} Items`)}
                     </div>
                  </div>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
