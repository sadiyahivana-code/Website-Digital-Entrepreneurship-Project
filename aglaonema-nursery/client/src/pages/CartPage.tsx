import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../stores/cartStore';
import { formatRupiah } from '../lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const navigate = useNavigate();
  const shipping = totalPrice() >= 300000 ? 0 : 15000;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag className="w-16 h-16 text-cream-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-forest-800 mb-2">Keranjang Kosong</h2>
          <p className="font-body text-sm text-cream-700 mb-6">Yuk mulai pilih tanaman impian Anda</p>
          <Link to="/products" className="btn-primary">Lihat Katalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item.productId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }} className="bg-white border border-cream-300 rounded-sm p-4 flex gap-4">
                  <Link to={`/products/${item.product.slug}`}>
                    <img src={item.product.images[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200'} alt={item.product.name} className="w-20 h-20 object-cover rounded-sm flex-shrink-0 hover:opacity-80 transition-opacity" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.slug}`} className="font-body font-semibold text-sm text-forest-800 hover:text-forest-600 transition-colors line-clamp-2">{item.product.name}</Link>
                    <p className="font-body text-gold-600 font-semibold mt-1">{formatRupiah(item.product.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-cream-300 rounded-sm">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-cream-300 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 py-1.5 font-body text-sm font-medium w-10 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="px-2.5 py-1.5 hover:bg-cream-300 transition-colors disabled:opacity-40"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-body font-bold text-forest-800">{formatRupiah(item.product.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="bg-white border border-cream-300 rounded-sm p-6 h-fit sticky top-24">
            <h2 className="font-display text-lg text-forest-800 mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-3 font-body text-sm pb-4 border-b border-cream-300 mb-4">
              <div className="flex justify-between">
                <span className="text-cream-700">Subtotal ({items.length} produk)</span>
                <span className="font-medium">{formatRupiah(totalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-700">Estimasi Ongkir</span>
                {shipping === 0 ? <span className="text-forest-600 font-semibold">Gratis!</span> : <span>{formatRupiah(shipping)}</span>}
              </div>
            </div>
            {totalPrice() < 300000 && (
              <p className="text-xs font-body text-amber-700 bg-amber-50 border border-amber-200 rounded-sm p-2 mb-4">
                Tambah {formatRupiah(300000 - totalPrice())} lagi untuk gratis ongkir!
              </p>
            )}
            <div className="flex justify-between font-body font-bold text-base mb-5">
              <span>Total</span>
              <span className="text-forest-800">{formatRupiah(totalPrice() + shipping)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center">
              Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
