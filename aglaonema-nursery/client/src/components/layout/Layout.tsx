import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Package,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setUserDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
    navigate("/");
  };

  const count = totalItems();

  return (
    <div className="min-h-screen flex flex-col bg-cream-200">
      {/* Top bar */}
      <div className="bg-forest-800 text-cream-200 text-xs text-center py-2 font-body tracking-widest">
        GRATIS ONGKIR untuk pembelian di atas Rp 300.000 • Pengiriman ke seluruh
        Indonesia
      </div>

      {/* Navbar */}
      <header className="bg-cream-200 border-b border-cream-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-display font-bold text-forest-800 text-base leading-tight">
                  Aglaonema Nursery
                </div>
                <div className="text-gold-500 text-xs font-body tracking-widest leading-tight">
                  Since 2026
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                ["/", "Beranda"],
                ["/products", "Katalog"],
                ["/stores", "Lokasi"],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="font-body text-sm text-bark-950 hover:text-forest-800 transition-colors font-medium tracking-wide"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 hover:bg-cream-300 rounded-full transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-forest-800" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-400 text-bark-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* User */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 hover:bg-cream-300 rounded-full px-2 py-1 transition-colors"
                  >
                    <div className="w-8 h-8 bg-forest-200 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-forest-800 font-bold text-sm">
                          {user.name[0]}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:block font-body text-sm font-medium text-forest-800 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-forest-600" />
                  </button>
                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-cream-300 rounded-sm shadow-lg py-1 z-50"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream-200 font-body text-bark-950"
                        >
                          <User className="w-4 h-4" /> Profil Saya
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream-200 font-body text-bark-950"
                        >
                          <Package className="w-4 h-4" /> Pesanan Saya
                        </Link>
                        <div className="border-t border-cream-300 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream-200 font-body text-red-600"
                        >
                          <LogOut className="w-4 h-4" /> Keluar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-xs px-4 py-2">
                  Masuk / Daftar
                </Link>
              )}

              {/* Mobile menu */}
              <button
                className="md:hidden p-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-cream-300 bg-cream-200"
            >
              <div className="px-4 py-4 space-y-3">
                {[
                  ["/", "Beranda"],
                  ["/products", "Katalog"],
                  ["/stores", "Lokasi"],
                  ["/orders", "Pesanan"],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="block font-body text-sm text-bark-950 hover:text-forest-800 py-1"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-forest-900 text-cream-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo.png"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-display font-bold text-cream-200 text-base leading-tight">
                    Aglaonema Nursery
                  </div>
                  <div className="text-gold-400 text-xs font-body tracking-widest">
                    Ivana-Deni. Since 2026
                  </div>
                </div>
              </div>
              <p className="font-body text-sm text-cream-400 leading-relaxed max-w-xs">
                Menyediakan tanaman Aglaonema premium pilihan terbaik untuk
                mempercantik rumah dan ruangan Anda.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-cream-200 mb-3 text-sm tracking-wide">
                Navigasi
              </h4>
              <ul className="space-y-2">
                {[
                  ["/", "Beranda"],
                  ["/products", "Katalog"],
                  ["/stores", "Lokasi Toko"],
                ].map(([to, label]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="font-body text-sm text-cream-400 hover:text-gold-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-cream-200 mb-3 text-sm tracking-wide">
                Kontak
              </h4>
              <ul className="space-y-2 font-body text-sm text-cream-400">
                <li>📍 Parung, Bogor, Jawa Barat</li>
                <li>📞 (+62) 85797159921</li>
                <li>✉️ hello@aglaonema.id</li>
                <li>🕐 Sen–Sab: 08.00–17.00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-forest-700 mt-8 pt-6 text-center font-body text-xs text-cream-500">
            © {new Date().getFullYear()} Aglaonema Nursery
          </div>
        </div>
      </footer>
    </div>
  );
}
