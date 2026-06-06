import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import ProductCard from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { formatRupiah } from '../lib/utils';

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'best_seller', label: 'Terlaris' },
  { value: 'best_rating', label: 'Rating Terbaik' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const debounce = useCallback((value: string) => {
    const t = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (v: string) => { setSearch(v); debounce(v); };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories').then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, category, minPrice, maxPrice, minRating, inStock, sort, page],
    queryFn: () => api.get('/products', {
      params: { search: debouncedSearch || undefined, category: category || undefined, minPrice: minPrice > 0 ? minPrice : undefined, maxPrice: maxPrice < 1000000 ? maxPrice : undefined, rating: minRating > 0 ? minRating : undefined, inStock: inStock || undefined, sort, page },
    }).then(r => r.data),
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-body font-semibold text-sm text-forest-800 mb-3">Kategori</h3>
        <div className="space-y-2">
          {['', ...(categoriesData?.categories || [])].map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" checked={category === cat} onChange={() => { setCategory(cat); setPage(1); }} className="accent-forest-800" />
              <span className="font-body text-sm text-bark-800">{cat || 'Semua Kategori'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-body font-semibold text-sm text-forest-800 mb-3">Harga</h3>
        <div className="space-y-2">
          <input type="range" min={0} max={1000000} step={25000} value={maxPrice} onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full" />
          <div className="flex justify-between text-xs font-body text-cream-600">
            <span>Rp 0</span>
            <span className="text-forest-800 font-medium">{formatRupiah(maxPrice)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-body font-semibold text-sm text-forest-800 mb-3">Rating Minimum</h3>
        <div className="space-y-2">
          {[0, 3, 4, 4.5].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" checked={minRating === r} onChange={() => { setMinRating(r); setPage(1); }} className="accent-forest-800" />
              <span className="font-body text-sm">{r === 0 ? 'Semua Rating' : `≥ ${r} bintang`}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={inStock} onChange={e => { setInStock(e.target.checked); setPage(1); }} className="accent-forest-800 w-4 h-4" />
        <span className="font-body text-sm text-bark-800 font-medium">Stok Tersedia</span>
      </label>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold-500 tracking-[0.3em] text-xs font-body uppercase mb-1">Toko Kami</p>
        <h1 className="section-title">Katalog Produk</h1>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-600" />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Cari varietas Aglaonema..." className="input-field pl-10 pr-10" />
          {search && <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-cream-600" /></button>}
        </div>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="input-field w-full sm:w-48">
          {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => setFilterOpen(!filterOpen)} className="btn-secondary sm:hidden">
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filter - desktop */}
        <aside className="hidden sm:block w-52 flex-shrink-0">
          <div className="bg-white border border-cream-300 p-5 rounded-sm">
            <h2 className="font-display font-semibold text-forest-800 mb-4">Filter</h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 sm:hidden" onClick={() => setFilterOpen(false)}>
              <div className="absolute inset-0 bg-black/40" />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="absolute left-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg text-forest-800">Filter</h2>
                  <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5" /></button>
                </div>
                <FilterPanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-forest-800 mb-2">Tidak Ditemukan</p>
              <p className="font-body text-cream-700 text-sm">Coba ubah kata kunci atau filter pencarian</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data?.products?.map((product: any, i: number) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-xs disabled:opacity-40">← Prev</button>
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs font-body font-medium rounded-sm border transition-all ${p === page ? 'bg-forest-800 text-cream-200 border-forest-800' : 'border-cream-300 hover:bg-cream-300'}`}>{p}</button>
                  ))}
                  <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-xs disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
