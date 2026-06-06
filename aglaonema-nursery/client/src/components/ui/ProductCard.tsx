import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRupiah } from '../../lib/utils';
import { useCartStore } from '../../stores/cartStore';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  sold: number;
  category: string;
  createdAt: string;
}

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem);

  const isNew = new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const isHot = product.sold > 100;
  const isOut = product.stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOut) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      images: product.images,
      slug: product.slug,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/products/${product.slug}`} className="block group">
        <div className="card hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Image */}
          <div className="relative overflow-hidden aspect-square bg-cream-300">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOut && <span className="badge-out">Habis</span>}
              {isHot && !isOut && <span className="badge-hot">Terlaris</span>}
              {isNew && !isHot && !isOut && <span className="badge-new">Baru</span>}
            </div>
            {/* Add to cart overlay */}
            {!isOut && (
              <button
                onClick={handleAdd}
                className="absolute bottom-0 left-0 right-0 bg-forest-800/90 text-cream-200 py-3 font-body text-sm font-medium flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                Tambah ke Keranjang
              </button>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-gold-600 font-body font-medium tracking-wide uppercase mb-1">{product.category}</p>
            <h3 className="font-display font-semibold text-forest-800 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-forest-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-cream-400'}`} />
              ))}
              <span className="text-xs text-cream-600 font-body ml-1">({product.sold})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-forest-800 text-base">{formatRupiah(product.price)}</span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs text-amber-600 font-body font-medium">Sisa {product.stock}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
