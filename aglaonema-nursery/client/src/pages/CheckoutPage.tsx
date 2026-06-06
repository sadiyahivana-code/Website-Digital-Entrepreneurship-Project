import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { formatRupiah } from "../lib/utils";
import api from "../lib/api";

const shippingOptions = [
  { id: "JNE Regular", label: "JNE Regular", price: 15000, eta: "3-5 hari" },
  { id: "JNE Express", label: "JNE Express", price: 25000, eta: "1-2 hari" },
  { id: "SiCepat", label: "SiCepat", price: 18000, eta: "2-3 hari" },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [shipping, setShipping] = useState(shippingOptions[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shippingCost = totalPrice() >= 300000 ? 0 : shipping.price;
  const total = totalPrice() + shippingCost;

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError("Mohon lengkapi semua data pengiriman");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const shippingAddress = `${form.name}, ${form.phone}\n${form.address}, ${form.city}, ${form.province} ${form.postalCode}`;
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress,
        shippingMethod: shipping.id,
        paymentMethod: "Midtrans",
        notes,
      });

      // Get Midtrans token
      const { data: paymentData } = await api.post("/payment/create-token", {
        orderId: data.order.id,
      });

      // Open Midtrans Snap
      (window as any).snap.pay(paymentData.token, {
        onSuccess: () => {
          clearCart();
          navigate(`/orders/${data.order.id}`);
        },
        onPending: () => {
          clearCart();
          navigate(`/orders/${data.order.id}`);
        },
        onError: () => {
          setError("Pembayaran gagal, silakan coba lagi");
        },
        onClose: () => {
          setError("Pembayaran dibatalkan");
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping form */}
          <div className="bg-white border border-cream-300 rounded-sm p-6">
            <h2 className="font-display text-lg text-forest-800 mb-4">
              Data Pengiriman
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-body font-medium text-bark-700 mb-1">
                  Nama Penerima *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-body font-medium text-bark-700 mb-1">
                  Nomor HP *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="input-field"
                  placeholder="08xxx"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-body font-medium text-bark-700 mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="input-field resize-none h-20"
                  placeholder="Jalan, nomor rumah, RT/RW, kelurahan"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-bark-700 mb-1">
                  Kota *
                </label>
                <input
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Kota / Kabupaten"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-bark-700 mb-1">
                  Provinsi
                </label>
                <input
                  value={form.province}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, province: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Provinsi"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-bark-700 mb-1">
                  Kode Pos
                </label>
                <input
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, postalCode: e.target.value }))
                  }
                  className="input-field"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Shipping method */}
          <div className="bg-white border border-cream-300 rounded-sm p-6">
            <h2 className="font-display text-lg text-forest-800 mb-4">
              Metode Pengiriman
            </h2>
            <div className="space-y-3">
              {shippingOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all ${shipping.id === opt.id ? "border-forest-800 bg-forest-50" : "border-cream-300 hover:border-forest-400"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={shipping.id === opt.id}
                      onChange={() => setShipping(opt)}
                      className="accent-forest-800"
                    />
                    <div>
                      <div className="font-body font-semibold text-sm">
                        {opt.label}
                      </div>
                      <div className="text-xs text-cream-600 font-body">
                        Estimasi {opt.eta}
                      </div>
                    </div>
                  </div>
                  <span className="font-body font-semibold text-sm text-forest-800">
                    {totalPrice() >= 300000 ? (
                      <span className="text-forest-600">Gratis</span>
                    ) : (
                      formatRupiah(opt.price)
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-cream-300 rounded-sm p-6">
            <label className="block font-display text-base text-forest-800 mb-2">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field resize-none h-20"
              placeholder="Instruksi khusus untuk pengemasan atau pengiriman..."
            />
          </div>
        </div>

        {/* Right: Summary */}
        <div className="bg-white border border-cream-300 rounded-sm p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg text-forest-800 mb-4">
            Ringkasan
          </h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-2 text-xs font-body"
              >
                <img
                  src={
                    item.product.images[0] ||
                    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=100"
                  }
                  className="w-10 h-10 object-cover rounded-sm"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-bark-900 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-cream-600">
                    {item.quantity}x {formatRupiah(item.product.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-300 pt-4 space-y-2 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-cream-700">Subtotal</span>
              <span>{formatRupiah(totalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream-700">Ongkir</span>
              <span>
                {shippingCost === 0 ? "Gratis" : formatRupiah(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-cream-300">
              <span>Total</span>
              <span className="text-forest-800">{formatRupiah(total)}</span>
            </div>
          </div>
          {error && (
            <p className="text-red-600 text-xs font-body mt-3">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center mt-5 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
