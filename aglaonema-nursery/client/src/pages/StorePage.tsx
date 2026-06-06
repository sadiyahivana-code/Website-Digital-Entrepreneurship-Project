import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import api from '../lib/api';

// Custom green marker
const greenIcon = new L.DivIcon({
  html: `<div style="background:#1B4332;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #C9B26B;display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);color:#C9B26B;font-size:14px;">🌿</span>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

export default function StorePage() {
  const { data } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.get('/stores').then(r => r.data),
  });

  const stores = data?.stores || [];
  const defaultCenter: [number, number] = stores[0] ? [stores[0].lat, stores[0].lng] : [-6.4317, 106.7283];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-gold-500 tracking-[0.3em] text-xs font-body uppercase mb-1">Kunjungi Kami</p>
        <h1 className="section-title">Lokasi Toko</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-4">
          {stores.map((store: any) => (
            <div key={store.id} className="bg-white border border-cream-300 rounded-sm p-5">
              <h3 className="font-display font-semibold text-forest-800 text-base mb-3">{store.name}</h3>
              <div className="space-y-2 font-body text-sm">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <span className="text-bark-800 leading-relaxed">{store.address}</span>
                </div>
                <div className="flex gap-2">
                  <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <span className="text-bark-800">{store.phone}</span>
                </div>
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <span className="text-bark-800 leading-relaxed">{store.openHours}</span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps?q=${store.lat},${store.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center mt-4 text-xs"
              >
                <Navigation className="w-3 h-3" /> Rute di Google Maps
              </a>
            </div>
          ))}

          {/* Geolocation button */}
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(pos => {
                window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${defaultCenter[0]},${defaultCenter[1]}`, '_blank');
              });
            }}
            className="btn-primary w-full justify-center text-xs"
          >
            <MapPin className="w-3 h-3" /> Gunakan Lokasi Saya
          </button>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 rounded-sm overflow-hidden border border-cream-300 h-[450px]">
          <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stores.map((store: any) => (
              <Marker key={store.id} position={[store.lat, store.lng]} icon={greenIcon}>
                <Popup>
                  <div className="font-body p-1 min-w-[200px]">
                    <div className="font-semibold text-forest-800 mb-1">{store.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{store.address}</div>
                    <div className="text-xs text-gray-600 mb-1">📞 {store.phone}</div>
                    <div className="text-xs text-gray-600 mb-3">🕐 {store.openHours}</div>
                    <a
                      href={`https://www.google.com/maps?q=${store.lat},${store.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-forest-800 font-semibold hover:underline"
                    >
                      Buka di Google Maps →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
