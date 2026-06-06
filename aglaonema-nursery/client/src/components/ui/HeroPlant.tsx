import { motion } from "framer-motion";

// Foto aglaonema asli dari unsplash
const aglaonemaPhotos = [
  "/aglaonema1.png",
  "/aglaonema2.png",
  "/aglaonema3.png",
];

// Partikel kecil melayang
function Particles() {
  const particles = [
    { id: 1, x: 10, y: 20, size: 6, delay: 0, duration: 5 },
    { id: 2, x: 80, y: 60, size: 4, delay: 1, duration: 4 },
    { id: 3, x: 60, y: 15, size: 5, delay: 2, duration: 6 },
    { id: 4, x: 25, y: 70, size: 3, delay: 0.5, duration: 5 },
    { id: 5, x: 90, y: 30, size: 4, delay: 1.5, duration: 4 },
    { id: 6, x: 40, y: 85, size: 6, delay: 3, duration: 5 },
    { id: 7, x: 70, y: 45, size: 3, delay: 0.8, duration: 6 },
    { id: 8, x: 15, y: 50, size: 5, delay: 2.5, duration: 4 },
  ];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, #C9B26B, transparent)",
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

// Daun kecil melayang di sekitar foto
function FloatingLeaves() {
  const leaves = [
    { id: 1, x: -8, y: 20, rotate: -30, delay: 0, color: "#2d6a4f" },
    { id: 2, x: 95, y: 40, rotate: 45, delay: 1, color: "#1B4332" },
    { id: 3, x: 5, y: 70, rotate: -60, delay: 2, color: "#40916c" },
    { id: 4, x: 88, y: 15, rotate: 20, delay: 0.5, color: "#c0392b" },
    { id: 5, x: -5, y: 50, rotate: 70, delay: 1.5, color: "#2d6a4f" },
  ];
  return (
    <>
      {leaves.map((l) => (
        <motion.div
          key={l.id}
          className="absolute pointer-events-none"
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
          animate={{
            y: [0, -15, 0],
            rotate: [l.rotate, l.rotate + 20, l.rotate],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: l.delay,
            ease: "easeInOut",
          }}
        >
          <svg width="32" height="50" viewBox="0 0 32 50">
            <path
              d="M16 48 C16 48 2 30 2 18 C2 8 8 2 16 2 C24 2 30 8 30 18 C30 30 16 48 16 48Z"
              fill={l.color}
              opacity="0.85"
            />
            <path
              d="M16 48 C16 48 16 25 16 2"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

export default function HeroPlant() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      <Particles />
      <FloatingLeaves />

      {/* Lingkaran glow di belakang */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,178,107,0.12) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Foto utama aglaonema — melayang naik turun */}
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -18, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Frame foto dengan border elegan */}
        <div className="relative">
          {/* Border dekoratif */}
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-gold-400/30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -inset-6 rounded-full border border-gold-400/15"
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          {/* Foto tanaman */}
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-forest-700/50 shadow-2xl">
            <img
              src={aglaonemaPhotos[0]}
              alt="Aglaonema Premium"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Badge melayang kiri */}
          <motion.div
            className="absolute -left-16 top-1/3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm px-3 py-2 text-center"
            animate={{ x: [0, -6, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <div className="text-gold-400 font-display font-bold text-lg">
              15+
            </div>
            <div className="text-cream-300 text-xs font-body">Varietas</div>
          </motion.div>

          {/* Badge melayang kanan */}
          <motion.div
            className="absolute -right-16 top-1/2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm px-3 py-2 text-center"
            animate={{ x: [0, 6, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
          >
            <div className="text-gold-400 font-display font-bold text-lg">
              ⭐ 4.9
            </div>
            <div className="text-cream-300 text-xs font-body">Rating</div>
          </motion.div>

          {/* Badge bawah */}
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-forest-700/80 backdrop-blur-sm border border-gold-400/30 rounded-sm px-4 py-2 whitespace-nowrap"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span className="text-gold-400 text-xs font-body font-semibold tracking-widest">
              🌿 PREMIUM COLLECTION
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Foto kecil di pojok — koleksi lain */}
      <motion.div
        className="absolute top-8 right-4 w-20 h-20 rounded-sm overflow-hidden border-2 border-gold-400/40 shadow-lg"
        animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        <img
          src={aglaonemaPhotos[1]}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-16 right-8 w-16 h-16 rounded-sm overflow-hidden border-2 border-gold-400/30 shadow-lg"
        animate={{ y: [0, -6, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        <img
          src={aglaonemaPhotos[2]}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
