import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { FileDown, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { formatRupiah, formatDate, formatShortDate } from '../lib/utils';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, borderBottom: '2px solid #1B4332', paddingBottom: 16 },
  logo: { fontSize: 20, color: '#1B4332', fontFamily: 'Helvetica-Bold' },
  logoSub: { fontSize: 9, color: '#C9B26B', letterSpacing: 3 },
  storeInfo: { fontSize: 8, color: '#666', textAlign: 'right', lineHeight: 1.5 },
  infoBox: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  infoCard: { flex: 1, backgroundColor: '#F8F4EE', padding: 12, borderRadius: 2 },
  infoLabel: { fontSize: 7, color: '#999', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { fontSize: 10, color: '#1B4332', fontFamily: 'Helvetica-Bold' },
  sectionTitle: { fontSize: 9, color: '#1B4332', fontFamily: 'Helvetica-Bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1B4332', padding: '6 8' },
  tableHeaderText: { color: '#F8F4EE', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #EDE4D3', padding: '6 8' },
  tableRowAlt: { backgroundColor: '#FDFCFA' },
  tableText: { fontSize: 8, color: '#2D1B00' },
  col1: { width: '5%' }, col2: { width: '45%' }, col3: { width: '15%', textAlign: 'center' }, col4: { width: '17%', textAlign: 'right' }, col5: { width: '18%', textAlign: 'right' },
  totalsContainer: { alignItems: 'flex-end', marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginBottom: 4 },
  totalLabel: { fontSize: 8, color: '#666' },
  totalValue: { fontSize: 8, color: '#2D1B00' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, backgroundColor: '#1B4332', padding: '6 8', marginTop: 4, borderRadius: 2 },
  grandTotalLabel: { fontSize: 10, color: '#F8F4EE', fontFamily: 'Helvetica-Bold' },
  grandTotalValue: { fontSize: 10, color: '#C9B26B', fontFamily: 'Helvetica-Bold' },
  watermark: { position: 'absolute', top: 280, left: 80, fontSize: 72, color: '#1B4332', opacity: 0.08, transform: 'rotate(-35deg)', fontFamily: 'Helvetica-Bold' },
  footer: { borderTop: '1px solid #EDE4D3', paddingTop: 12, marginTop: 24, fontSize: 7, color: '#999', textAlign: 'center', lineHeight: 1.8 },
});

function InvoicePDF({ order }: { order: any }) {
  const isPaid = order.paymentStatus === 'CONFIRMED' || order.status === 'DELIVERED';
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {isPaid && <Text style={pdfStyles.watermark}>LUNAS</Text>}
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.logo}>🌿 Aglaonema Nursery</Text>
            <Text style={pdfStyles.logoSub}>PREMIUM PLANT STORE</Text>
          </View>
          <View>
            <Text style={pdfStyles.storeInfo}>Jl. Desa No.51, Waru, Parung, Bogor 16330</Text>
            <Text style={pdfStyles.storeInfo}>(0251) 8123-456 | hello@aglaonema.id</Text>
            <Text style={pdfStyles.storeInfo}>www.aglaonema.id</Text>
          </View>
        </View>

        <View style={pdfStyles.infoBox}>
          <View style={pdfStyles.infoCard}>
            <Text style={pdfStyles.infoLabel}>Nomor Invoice</Text>
            <Text style={pdfStyles.infoValue}>{order.invoiceNumber}</Text>
            <Text style={[pdfStyles.infoLabel, { marginTop: 6 }]}>Tanggal</Text>
            <Text style={pdfStyles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={pdfStyles.infoCard}>
            <Text style={pdfStyles.infoLabel}>Status Pembayaran</Text>
            <Text style={[pdfStyles.infoValue, { color: isPaid ? '#1B4332' : '#D97706' }]}>{isPaid ? 'LUNAS' : 'MENUNGGU'}</Text>
            <Text style={[pdfStyles.infoLabel, { marginTop: 6 }]}>Metode Bayar</Text>
            <Text style={pdfStyles.infoValue}>{order.paymentMethod}</Text>
          </View>
          <View style={pdfStyles.infoCard}>
            <Text style={pdfStyles.infoLabel}>Penerima</Text>
            <Text style={pdfStyles.infoValue}>{order.user?.name}</Text>
            <Text style={[pdfStyles.infoLabel, { marginTop: 6 }]}>Alamat Kirim</Text>
            <Text style={[pdfStyles.infoValue, { fontSize: 7, lineHeight: 1.4 }]}>{order.shippingAddress}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Detail Produk</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col1]}>No</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col2]}>Nama Produk</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col3]}>Qty</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col4]}>Harga Satuan</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col5]}>Subtotal</Text>
          </View>
          {order.items.map((item: any, i: number) => (
            <View key={item.id} style={[pdfStyles.tableRow, i % 2 !== 0 ? pdfStyles.tableRowAlt : {}]}>
              <Text style={[pdfStyles.tableText, pdfStyles.col1]}>{i + 1}</Text>
              <Text style={[pdfStyles.tableText, pdfStyles.col2]}>{item.product.name}</Text>
              <Text style={[pdfStyles.tableText, pdfStyles.col3]}>{item.quantity}</Text>
              <Text style={[pdfStyles.tableText, pdfStyles.col4]}>{formatRupiah(item.price)}</Text>
              <Text style={[pdfStyles.tableText, pdfStyles.col5]}>{formatRupiah(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalsContainer}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Subtotal</Text>
            <Text style={pdfStyles.totalValue}>{formatRupiah(order.totalAmount - order.shippingCost)}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Ongkos Kirim ({order.shippingMethod})</Text>
            <Text style={pdfStyles.totalValue}>{formatRupiah(order.shippingCost)}</Text>
          </View>
          <View style={pdfStyles.grandTotalRow}>
            <Text style={pdfStyles.grandTotalLabel}>TOTAL</Text>
            <Text style={pdfStyles.grandTotalValue}>{formatRupiah(order.totalAmount)}</Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Terima kasih telah berbelanja di Aglaonema Nursery!{'\n'}
          Untuk pertanyaan, hubungi kami di (0251) 8123-456 atau hello@aglaonema.id{'\n'}
          Jl. Desa No.51, Waru, Kec. Parung, Kabupaten Bogor, Jawa Barat 16330
        </Text>
      </Page>
    </Document>
  );
}

const statusLabel: Record<string, { label: string; color: string; step: number }> = {
  PENDING: { label: 'Menunggu Pembayaran', color: 'bg-amber-100 text-amber-700', step: 1 },
  PAID: { label: 'Pembayaran Diterima', color: 'bg-blue-100 text-blue-700', step: 2 },
  PROCESSING: { label: 'Sedang Diproses', color: 'bg-purple-100 text-purple-700', step: 3 },
  SHIPPED: { label: 'Dalam Pengiriman', color: 'bg-indigo-100 text-indigo-700', step: 4 },
  DELIVERED: { label: 'Pesanan Selesai', color: 'bg-green-100 text-green-700', step: 5 },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-600', step: 0 },
};

const timeline = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  });

  const order = data?.order;

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-8 h-8 border-2 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!order) return <div className="text-center py-20 font-display text-xl">Pesanan tidak ditemukan</div>;

  const st = statusLabel[order.status];
  const currentStep = st.step;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm font-body text-cream-700 hover:text-forest-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pesanan
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-800">{order.invoiceNumber}</h1>
          <p className="font-body text-sm text-cream-600 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-sm text-xs font-body font-semibold ${st.color}`}>{st.label}</span>
          <PDFDownloadLink
            document={<InvoicePDF order={order} />}
            fileName={`Invoice-${order.invoiceNumber}-${formatShortDate(order.createdAt).replace(/\//g, '-')}.pdf`}
          >
            {({ loading }) => (
              <button className="btn-secondary text-xs px-3 py-2 gap-1">
                <FileDown className="w-3 h-3" />
                {loading ? 'Menyiapkan...' : 'Unduh Invoice'}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white border border-cream-300 rounded-sm p-6 mb-6">
          <h2 className="font-display text-base text-forest-800 mb-5">Status Pengiriman</h2>
          <div className="flex items-center">
            {timeline.map((step, i) => {
              const done = currentStep > i;
              const active = currentStep === i + 1;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex flex-col items-center ${i < timeline.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-body transition-all ${done || active ? 'bg-forest-800 text-cream-200' : 'bg-cream-300 text-cream-600'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-body mt-1 text-center leading-tight ${active ? 'text-forest-800 font-semibold' : 'text-cream-600'}`} style={{ fontSize: '10px' }}>
                      {statusLabel[step]?.label.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                  {i < timeline.length - 1 && <div className={`flex-1 h-0.5 mx-2 -mt-5 ${done ? 'bg-forest-700' : 'bg-cream-300'}`} />}
                </div>
              );
            })}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 bg-cream-200 p-3 rounded-sm text-sm font-body">
              <span className="text-cream-600">No. Resi: </span>
              <span className="font-semibold text-forest-800">{order.trackingNumber}</span>
              <span className="ml-2 text-cream-600">({order.shippingMethod})</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-cream-300 rounded-sm p-6 mb-6" id="invoice">
        <h2 className="font-display text-base text-forest-800 mb-4">Produk yang Dipesan</h2>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <img src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=100'} alt={item.product.name} className="w-14 h-14 object-cover rounded-sm flex-shrink-0" />
              <div className="flex-1">
                <div className="font-body font-medium text-sm text-bark-900">{item.product.name}</div>
                <div className="text-xs text-cream-600 font-body">{item.quantity}x {formatRupiah(item.price)}</div>
              </div>
              <div className="font-body font-bold text-sm text-forest-800">{formatRupiah(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-cream-300 mt-4 pt-4 space-y-2 font-body text-sm">
          <div className="flex justify-between text-cream-700"><span>Ongkos Kirim</span><span>{formatRupiah(order.shippingCost)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-forest-800">{formatRupiah(order.totalAmount)}</span></div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-cream-300 rounded-sm p-5">
        <h2 className="font-display text-base text-forest-800 mb-2">Alamat Pengiriman</h2>
        <p className="font-body text-sm text-bark-800 whitespace-pre-line">{order.shippingAddress}</p>
        {order.notes && <p className="font-body text-sm text-cream-600 mt-2 italic">Catatan: {order.notes}</p>}
      </div>
    </div>
  );
}
