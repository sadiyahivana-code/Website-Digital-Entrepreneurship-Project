import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '../../lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} />

          {/* Drawer */}
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-cream-200 z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-300">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-forest-800" />
                <h2 className="font-display text-xl text-forest-800">Keranjang</h2>
                {items.length > 0 && <span className="bg-forest-800 text-cream-200 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{items.length}</span>}
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-cream-300 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-cream-400 mx-auto mb-3" />
                  <p className="font-display text-lg text-forest-800 mb-1">Keranjang Kosong</p>
                  <p className="font-body text-sm text-cream-600">Tambahkan produk pilihan Anda</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.productId} className="flex gap-3 bg-white p-3 rounded-sm border border-cream-300">
                    <img src={item.product.images[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200'} alt={item.product.name} className="w-16 h-16 object-cover rounded-sm flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body font-medium text-sm text-bark-950 truncate">{item.product.name}</h4>
                      <p className="font-body text-forest-700 font-semibold text-sm mt-0.5">{formatRupiah(item.product.price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 border border-cream-400 rounded-sm flex items-center justify-center hover:bg-cream-300 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-body text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="w-6 h-6 border border-cream-400 rounded-sm flex items-center justify-center hover:bg-cream-300 transition-colors disabled:opacity-40">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-300 p-6 space-y-4">
                <div className="flex items-center justify-between font-body">
                  <span className="text-sm text-bark-700">Subtotal</span>
                  <span className="font-semibold text-forest-800">{formatRupiah(totalPrice())}</span>
                </div>
                <p className="text-xs text-cream-600 font-body">Ongkos kirim dihitung saat checkout</p>
                <button onClick={handleCheckout} className="btn-primary w-full justify-center">
                  Lanjut ke Checkout
                </button>
                <button onClick={() => { closeCart(); navigate('/cart'); }} className="btn-secondary w-full justify-center text-xs">
                  Lihat Keranjang Lengkap
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
