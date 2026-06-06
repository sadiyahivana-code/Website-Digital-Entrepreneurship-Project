import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, Shield, Star, MapPin } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import HeroPlant from '../components/ui/HeroPlant';

const testimonials = [
  { name: 'Sari Dewi', text: 'Tanaman sampai dalam kondisi segar dan dikemas dengan sangat rapi. Red Sumatra saya tumbuh subur!', rating: 5, location: 'Jakarta' },
  { name: 'Budi Santoso', text: 'Koleksi Aglaonema terlengkap yang pernah saya temui. Harga juga sangat bersaing.', rating: 5, location: 'Bekasi' },
  { name: 'Melia Putri', text: 'Pelayanannya ramah dan responsif. Tanaman Pictum Tricolor saya benar-benar cantik!', rating: 5, location: 'Depok' },
];

const features = [
  { icon: Leaf, title: 'Tanaman Premium', desc: 'Setiap tanaman dipilih langsung oleh ahli hortikultura berpengalaman' },
  { icon: Truck, title: 'Pengiriman Aman', desc: 'Dikemas khusus dengan media yang menjaga tanaman tetap segar selama perjalanan' },
  { icon: Shield, title: 'Garansi Kualitas', desc: 'Jaminan kepuasan 7 hari atau kami ganti tanaman Anda tanpa syarat' },
  { icon: Star, title: 'Varietas Langka', desc: 'Koleksi varietas eksklusif yang sulit ditemukan di tempat lain' },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?sort=best_seller&limit=8').then(r => r.data),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-forest-900">
        {/* Background subtle texture */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(#C9B26B 1px, transparent 1px), linear-gradient(90deg, #C9B26B 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.p
                className="font-body text-gold-400 tracking-[0.3em] text-sm mb-4 uppercase"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              >
                Aglaonema Nursery
              </motion.p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-cream-200 leading-tight mb-6">
                Kecantikan Alam<br />
                <em className="text-gold-400">di Rumah Anda</em>
              </h1>
              <p className="font-body text-cream-400 text-lg leading-relaxed mb-8 max-w-lg">
                Temukan koleksi Aglaonema premium pilihan terbaik. Dari varietas klasik hingga yang paling langka dan eksotis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn-gold text-base px-8 py-4">
                  Lihat Koleksi <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/stores" className="border border-cream-400 text-cream-300 px-8 py-4 font-body font-medium tracking-wide hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Lokasi Toko
                </Link>
              </div>

              {/* Stats */}
              <motion.div
                className="flex gap-8 mt-12 pt-8 border-t border-forest-700"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              >
                {[['15+', 'Varietas'], ['500+', 'Pelanggan'], ['4.9', 'Rating']].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-display text-2xl font-bold text-gold-400">{val}</div>
                    <div className="font-body text-xs text-cream-500 tracking-wide">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: 3D Animated Plant */}
            <motion.div
              className="relative h-[500px] hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {/* Glowing circle behind plant */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(201,178,107,0.15) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <HeroPlant />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-cream-400 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-cream-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 bg-cream-200 border-y border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-6 h-6 text-forest-800" />
                </div>
                <h3 className="font-display font-semibold text-forest-800 text-sm mb-1">{f.title}</h3>
                <p className="font-body text-xs text-cream-700 leading-relaxed hidden md:block">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-gold-500 tracking-[0.3em] text-xs font-body uppercase mb-2">Pilihan Terbaik</p>
          <h2 className="section-title mb-3">Koleksi Unggulan</h2>
          <p className="font-body text-cream-700 max-w-md mx-auto text-sm">Varietas Aglaonema paling populer dan dicari oleh para pecinta tanaman hias</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) :
            data?.products?.map((product: any, i: number) => <ProductCard key={product.id} product={product} index={i} />)
          }
        </div>

        <div className="text-center mt-10">
          <Link to="/products" className="btn-secondary">
            Lihat Semua Koleksi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Banner Promo */}
      <section className="bg-forest-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <p className="text-gold-400 tracking-[0.3em] text-xs font-body uppercase mb-3">Penawaran Spesial</p>
            <h2 className="font-display text-4xl md:text-5xl text-cream-200 mb-4">
              Gratis Ongkir<br /><span className="text-gold-400">Min. Belanja Rp 300.000</span>
            </h2>
            <p className="font-body text-cream-400 mb-8 max-w-md mx-auto">Berlaku untuk pengiriman ke seluruh Indonesia. Nikmati kemudahan berbelanja tanaman pilihan Anda.</p>
            <Link to="/products" className="btn-gold px-10 py-4 text-base">
              Belanja Sekarang
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-gold-500 tracking-[0.3em] text-xs font-body uppercase mb-2">Kata Mereka</p>
            <h2 className="section-title">Kepuasan Pelanggan</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-6 border border-cream-300 rounded-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
                </div>
                <p className="font-body text-sm text-bark-800 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-body font-semibold text-sm text-forest-800">{t.name}</div>
                  <div className="font-body text-xs text-cream-600">{t.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
