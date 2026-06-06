import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({ rating, size = 16, showValue = false }: Props) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          style={{ width: size, height: size }}
          className={star <= rating ? 'fill-gold-400 text-gold-400' : star - 0.5 <= rating ? 'fill-gold-200 text-gold-400' : 'text-cream-400'}
        />
      ))}
      {showValue && <span className="font-body text-sm text-cream-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}
