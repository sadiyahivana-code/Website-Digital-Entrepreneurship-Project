import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, XCircle, Upload, Copy } from 'lucide-react';
import api from '../lib/api';
import { formatRupiah, formatDate } from '../lib/utils';

const bankDetails: Record<string, { account: string; name: string }> = {
  'Transfer Bank BCA': { account: '1234567890', name: 'Aglaonema Nursery' },
  'Transfer Bank Mandiri': { account: '1230004567890', name: 'Aglaonema Nursery' },
  'Transfer Bank BNI': { account: '0123456789', name: 'Aglaonema Nursery' },
  'Transfer Bank BRI': { account: '123401234567890', name: 'Aglaonema Nursery' },
};

function useCountdown(deadline: Date) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return timeLeft;
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [proofFile, setProofFile] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then(r => r.data),
    refetchInterval: 10000,
  });

  const order = data?.order;
  const deadline = order ? new Date(new Date(order.createdAt).getTime() + 24 * 3600000) : new Date();
  const countdown = useCountdown(deadline);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!proofFile) return;
    setUploading(true);
    try {
      await api.post(`/orders/${orderId}/payment-proof`, { paymentProof: proofFile });
      setUploaded(true);
    } catch { }
    setUploading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-8 h-8 border-2 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!order) return <div className="text-center py-20 font-display text-xl">Pesanan tidak ditemukan</div>;

  const bank = bankDetails[order.paymentMethod];
  const isTransfer = !!bank;

  const statusColor: Record<string, string> = {
    WAITING: 'text-amber-600',
    CONFIRMED: 'text-forest-700',
    REJECTED: 'text-red-600',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-2">Pembayaran</h1>
      <p className="font-body text-sm text-cream-700 mb-8">Invoice: <span className="font-semibold text-forest-800">{order.invoiceNumber}</span></p>

      {/* Status */}
      <div className={`flex items-center gap-2 mb-6 p-4 rounded-sm border ${order.paymentStatus === 'CONFIRMED' ? 'bg-green-50 border-green-200' : order.paymentStatus === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
        {order.paymentStatus === 'CONFIRMED' ? <CheckCircle2 className="w-5 h-5 text-forest-700" /> : order.paymentStatus === 'REJECTED' ? <XCircle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
        <div>
          <div className={`font-body font-semibold text-sm ${statusColor[order.paymentStatus]}`}>
            {order.paymentStatus === 'WAITING' ? 'Menunggu Pembayaran' : order.paymentStatus === 'CONFIRMED' ? 'Pembayaran Dikonfirmasi' : 'Pembayaran Ditolak'}
          </div>
          {order.paymentStatus === 'WAITING' && <div className="font-body text-xs text-amber-700">Batas waktu: {countdown}</div>}
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-white border border-cream-300 rounded-sm p-5 mb-6">
        <h2 className="font-display text-base text-forest-800 mb-3">Ringkasan Pesanan</h2>
        <div className="space-y-2 mb-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm font-body">
              <span className="text-bark-800">{item.product.name} x{item.quantity}</span>
              <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-cream-300 pt-3 space-y-1 font-body text-sm">
          <div className="flex justify-between text-cream-700"><span>Ongkos Kirim</span><span>{formatRupiah(order.shippingCost)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-forest-800">{formatRupiah(order.totalAmount)}</span></div>
        </div>
      </div>

      {/* Payment instructions */}
      {order.paymentStatus !== 'CONFIRMED' && (
        <div className="bg-white border border-cream-300 rounded-sm p-5 mb-6">
          <h2 className="font-display text-base text-forest-800 mb-4">Instruksi Pembayaran</h2>

          {order.paymentMethod === 'COD' && (
            <div className="font-body text-sm text-bark-800 space-y-2">
              <p>✅ Pembayaran dilakukan saat barang tiba di lokasi Anda.</p>
              <p>💵 Siapkan uang tunai sebesar <strong>{formatRupiah(order.totalAmount)}</strong></p>
            </div>
          )}

          {order.paymentMethod === 'QRIS' && (
            <div className="text-center">
              <div className="w-48 h-48 bg-cream-300 mx-auto rounded-sm flex items-center justify-center mb-3">
                <span className="font-body text-xs text-cream-600">QR Code Dummy</span>
              </div>
              <p className="font-body text-sm text-bark-800">Scan QR di atas menggunakan aplikasi mobile banking atau e-wallet Anda</p>
              <p className="font-body font-bold text-forest-800 mt-2">{formatRupiah(order.totalAmount)}</p>
            </div>
          )}

          {isTransfer && bank && (
            <div className="space-y-4">
              <div className="bg-cream-200 rounded-sm p-4">
                <p className="text-xs font-body text-cream-600 mb-1">{order.paymentMethod}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-bold text-xl text-forest-800">{bank.account}</p>
                    <p className="font-body text-sm text-bark-700">a.n. {bank.name}</p>
                  </div>
                  <button onClick={() => copyToClipboard(bank.account)} className="btn-secondary text-xs px-3 py-2 gap-1">
                    <Copy className="w-3 h-3" />
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>
              </div>
              <div className="bg-cream-200 rounded-sm p-4">
                <p className="text-xs font-body text-cream-600 mb-1">Jumlah Transfer (Tepat)</p>
                <div className="flex items-center justify-between">
                  <p className="font-body font-bold text-xl text-forest-800">{formatRupiah(order.totalAmount)}</p>
                  <button onClick={() => copyToClipboard(order.totalAmount.toString())} className="btn-secondary text-xs px-3 py-2 gap-1">
                    <Copy className="w-3 h-3" /> Salin
                  </button>
                </div>
              </div>

              {/* Upload proof */}
              {!uploaded ? (
                <div>
                  <p className="font-body text-sm font-medium text-bark-800 mb-2">Upload Bukti Transfer</p>
                  <label className="block border-2 border-dashed border-cream-400 rounded-sm p-6 text-center cursor-pointer hover:border-forest-600 transition-colors">
                    <Upload className="w-8 h-8 text-cream-500 mx-auto mb-2" />
                    <p className="font-body text-sm text-cream-600">{proofFile ? 'File dipilih ✓' : 'Klik untuk pilih foto/screenshot'}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  {proofFile && (
                    <div className="mt-3">
                      <img src={proofFile} alt="Preview" className="w-full max-h-40 object-contain rounded-sm border border-cream-300" />
                      <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full justify-center mt-3 disabled:opacity-60">
                        {uploading ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-sm p-3 text-sm font-body text-forest-700">
                  <CheckCircle2 className="w-4 h-4" /> Bukti pembayaran berhasil dikirim. Sedang diverifikasi admin.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button onClick={() => navigate('/orders')} className="btn-secondary w-full justify-center">
        Lihat Semua Pesanan
      </button>
    </div>
  );
}
