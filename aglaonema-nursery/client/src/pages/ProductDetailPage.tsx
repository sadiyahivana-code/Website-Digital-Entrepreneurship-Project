import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Zap, Heart, Star, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { formatRupiah, formatDate, getStockStatus } from '../lib/utils';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/ui/ProductCard';
import { TextSkeleton } from '../components/ui/Skeleton';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'care' | 'spec'>('desc');
  const [reviewFilter, setReviewFilter] = useState(0);
  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data),
  });

  const product = data?.product;
  const stockStatus = product ? getStockStatus(product.stock) : null;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, stock: product.stock, images: product.images, slug: product.slug }, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-cream-300 rounded-sm animate-pulse" />
        <div className="space-y-4">
          <TextSkeleton className="h-8 w-3/4" />
          <TextSkeleton className="h-6 w-1/2" />
          <TextSkeleton className="h-4 w-full" />
          <TextSkeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 font-display text-2xl text-forest-800">Produk tidak ditemukan</div>;

  const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600'];
  const reviews = product.reviews || [];
  const filteredReviews = reviewFilter ? reviews.filter((r: any) => r.rating === reviewFilter) : reviews;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(r => ({ stars: r, count: reviews.filter((rv: any) => rv.rating === r).length }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-sm font-body text-cream-700 hover:text-forest-800 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          <motion.div className="relative aspect-square rounded-sm overflow-hidden bg-cream-300 mb-3 group" whileHover={{ scale: 1.01 }}>
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${i === activeImage ? 'border-forest-800' : 'border-cream-300 hover:border-forest-400'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-gold-500 text-xs tracking-widest font-body uppercase mb-2">{product.category}</p>
          <h1 className="font-display text-3xl text-forest-800 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} showValue />
            <span className="text-xs text-cream-600 font-body">({reviews.length} ulasan)</span>
            <span className={`text-xs font-body font-semibold ${stockStatus?.color}`}>{stockStatus?.label}</span>
          </div>

          <div className="text-3xl font-display font-bold text-forest-800 mb-6">{formatRupiah(product.price)}</div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-body text-sm text-bark-700">Jumlah:</span>
            <div className="flex items-center border border-cream-300 rounded-sm">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-cream-300 transition-colors font-body text-lg">−</button>
              <span className="px-4 py-2 font-body font-medium w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock} className="px-3 py-2 hover:bg-cream-300 transition-colors font-body text-lg disabled:opacity-40">+</button>
            </div>
            <span className="text-xs text-cream-600 font-body">Stok: {product.stock}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-secondary flex-1 justify-center disabled:opacity-40">
              <ShoppingCart className="w-4 h-4" /> Keranjang
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-primary flex-1 justify-center disabled:opacity-40">
              <Zap className="w-4 h-4" /> Beli Sekarang
            </button>
            <button className="p-3 border border-cream-300 hover:border-red-400 hover:text-red-500 rounded-sm transition-all">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border border-cream-300 rounded-sm overflow-hidden">
            <div className="flex border-b border-cream-300">
              {[['desc', 'Deskripsi'], ['care', 'Perawatan'], ['spec', 'Spesifikasi']].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key as any)} className={`flex-1 py-3 text-xs font-body font-medium transition-colors ${activeTab === key ? 'bg-forest-800 text-cream-200' : 'hover:bg-cream-200 text-bark-700'}`}>{label}</button>
              ))}
            </div>
            <div className="p-5 font-body text-sm text-bark-800 leading-relaxed min-h-[120px]">
              {activeTab === 'desc' && <p>{product.description}</p>}
              {activeTab === 'care' && (
                <ul className="space-y-2">
                  <li>☀️ Cahaya: Tidak langsung, tempat teduh</li>
                  <li>💧 Siram: 2-3x seminggu, jangan berlebihan</li>
                  <li>🌡️ Suhu: 18-30°C (cocok untuk iklim Indonesia)</li>
                  <li>🪴 Pupuk: Sebulan sekali, pupuk NPK cair</li>
                  <li>✂️ Potong daun kering untuk menjaga estetika</li>
                </ul>
              )}
              {activeTab === 'spec' && (
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="text-cream-600">Kategori</dt><dd className="font-medium">{product.category}</dd>
                  <dt className="text-cream-600">Ukuran Pot</dt><dd className="font-medium">15-20 cm</dd>
                  <dt className="text-cream-600">Tinggi</dt><dd className="font-medium">20-40 cm</dd>
                  <dt className="text-cream-600">Media Tanam</dt><dd className="font-medium">Tanah & Cocopeat</dd>
                </dl>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-forest-800 mb-6">Ulasan Pelanggan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Rating summary */}
          <div className="bg-white border border-cream-300 p-6 rounded-sm text-center">
            <div className="text-5xl font-display font-bold text-forest-800 mb-2">{product.rating.toFixed(1)}</div>
            <StarRating rating={product.rating} size={20} />
            <p className="text-xs text-cream-600 font-body mt-2">{reviews.length} ulasan</p>
            <div className="mt-4 space-y-2">
              {ratingBreakdown.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2 text-xs font-body">
                  <span className="w-3">{stars}</span>
                  <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                  <div className="flex-1 bg-cream-300 rounded-full h-1.5">
                    <div className="bg-gold-400 h-1.5 rounded-full" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-4 text-cream-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review list */}
          <div className="md:col-span-2">
            <div className="flex gap-2 mb-4">
              {[0, 5, 4, 3].map(r => (
                <button key={r} onClick={() => setReviewFilter(r)} className={`px-3 py-1 text-xs font-body rounded-sm border transition-all ${reviewFilter === r ? 'bg-forest-800 text-cream-200 border-forest-800' : 'border-cream-300 hover:bg-cream-200'}`}>
                  {r === 0 ? 'Semua' : `${r} ⭐`}
                </button>
              ))}
              {!user && (
                <button onClick={() => navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))} className="ml-auto btn-secondary text-xs px-3 py-1">
                  Tulis Ulasan
                </button>
              )}
            </div>
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <p className="font-body text-sm text-cream-600 py-8 text-center">Belum ada ulasan</p>
              ) : filteredReviews.map((review: any) => (
                <div key={review.id} className="bg-white border border-cream-300 p-4 rounded-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-forest-200 rounded-full flex items-center justify-center">
                      <span className="text-forest-800 font-bold text-sm">{review.user.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-body font-medium text-sm">{review.user.name}</div>
                      <div className="text-xs text-cream-600">{formatDate(review.createdAt)}</div>
                    </div>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                  <p className="font-body text-sm text-bark-800">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
