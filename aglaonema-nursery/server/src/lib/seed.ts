import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "Aglaonema Red Sumatra",
    category: "Red Series",
    price: 185000,
    stock: 25,
    rating: 4.8,
    sold: 142,
    description:
      "Aglaonema Red Sumatra dengan warna merah menyala yang indah. Cocok untuk dekorasi dalam ruangan, tahan terhadap kondisi cahaya rendah.",
    images: ["/red-sumatra.png"],
  },
  {
    name: "Aglaonema Pink Dalmation",
    category: "Pink Series",
    price: 210000,
    stock: 18,
    rating: 4.9,
    sold: 98,
    description:
      "Motif unik bercak-bercak merah muda di atas daun hijau gelap. Tanaman premium yang sangat dicari kolektor.",
    images: ["/pink-dalmation.png"],
  },
  {
    name: "Aglaonema Silver Queen",
    category: "Silver Series",
    price: 155000,
    stock: 30,
    rating: 4.7,
    sold: 203,
    description:
      "Klasik dan elegan, Silver Queen hadir dengan warna silver keperakan yang mempesona. Mudah dirawat untuk pemula.",
    images: ["/silver-queen.png"],
  },
  {
    name: "Aglaonema Lipstick",
    category: "Red Series",
    price: 245000,
    stock: 12,
    rating: 4.9,
    sold: 67,
    description:
      "Warna merah cerah di seluruh permukaan daun seperti lipstik. Salah satu varietas paling eksotis dan bernilai tinggi.",
    images: ["/lipstick.png"],
  },
  {
    name: "Aglaonema Emerald Bay",
    category: "Green Series",
    price: 125000,
    stock: 45,
    rating: 4.6,
    sold: 318,
    description:
      "Varietas hijau tua dengan kilau zamrud yang memukau. Sangat tahan banting dan cocok untuk berbagai kondisi lingkungan.",
    images: ["/emerald-bay.png"],
  },
  {
    name: "Aglaonema Harlequin",
    category: "Variegated",
    price: 320000,
    stock: 8,
    rating: 5.0,
    sold: 34,
    description:
      "Pola variegata langka dengan kombinasi hijau, kuning, dan merah. Tanaman kolektor yang sangat istimewa.",
    images: ["/Harlequin.png"],
  },
  {
    name: "Aglaonema Cutlass",
    category: "Silver Series",
    price: 145000,
    stock: 22,
    rating: 4.5,
    sold: 156,
    description:
      "Daun panjang dan ramping dengan motif silver yang menawan. Sempurna untuk sudut ruangan yang membutuhkan sentuhan elegan.",
    images: ["/cutlass.png"],
  },
  {
    name: "Aglaonema Red Eagle",
    category: "Red Series",
    price: 195000,
    stock: 15,
    rating: 4.8,
    sold: 89,
    description:
      "Daun merah mengkilap dengan tepi hijau tua. Kombinasi warna yang dramatis dan memukau untuk dekorasi premium.",
    images: ["/red-eagle.png"],
  },
  {
    name: "Aglaonema Pink Moon",
    category: "Pink Series",
    price: 265000,
    stock: 10,
    rating: 4.9,
    sold: 45,
    description:
      "Varietas langka dengan warna pink pastel lembut. Tampilan feminin dan elegan yang sempurna untuk ruang tidur.",
    images: ["/pink-moon.png"],
  },
  {
    name: "Aglaonema Tricolor",
    category: "Variegated",
    price: 285000,
    stock: 7,
    rating: 4.8,
    sold: 52,
    description:
      "Tiga warna dalam satu daun: hijau, merah, dan putih. Tanaman unik yang menjadi pusat perhatian di mana pun diletakkan.",
    images: ["/tricolor.png"],
  },
  {
    name: "Aglaonema Green Papaya",
    category: "Green Series",
    price: 115000,
    stock: 50,
    rating: 4.4,
    sold: 412,
    description:
      "Varietas klasik dengan pola menyerupai pepaya. Sangat populer di kalangan pemula karena mudah dirawat.",
    images: ["/green-papaya.png"],
  },
  {
    name: "Aglaonema Pictum Tricolor",
    category: "Variegated",
    price: 450000,
    stock: 5,
    rating: 5.0,
    sold: 21,
    description:
      "The Holy Grail of Aglaonema! Pola camouflage tiga warna yang sangat langka dan bernilai tinggi bagi kolektor.",
    images: ["/pictum-tricolor.png"],
  },
  {
    name: "Aglaonema Red Ruby",
    category: "Red Series",
    price: 175000,
    stock: 20,
    rating: 4.7,
    sold: 127,
    description:
      "Merah rubi yang kaya dan dalam. Salah satu aglaonema merah favorit dengan warna yang konsisten dan tidak mudah pudar.",
    images: ["/red-ruby.jpg"],
  },
  {
    name: "Aglaonema Wishes",
    category: "Pink Series",
    price: 230000,
    stock: 14,
    rating: 4.8,
    sold: 76,
    description:
      "Pink cerah dengan aksen hijau. Nama yang tepat karena keindahannya memang seperti impian menjadi kenyataan.",
    images: ["/wishes.png"],
  },
  {
    name: "Aglaonema Rotundum",
    category: "Special",
    price: 380000,
    stock: 6,
    rating: 4.9,
    sold: 29,
    description:
      "Spesies asli hutan Sumatra dengan daun bulat dan warna merah marun yang menawan. Koleksi prestisius untuk pecinta botani.",
    images: ["/rotundum.png"],
  },
];

async function main() {
  console.log(" Starting seed...");

  // Admin
  const hashedPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@aglaonema.id" },
    update: {},
    create: {
      name: "Admin Aglaonema",
      email: "admin@aglaonema.id",
      password: hashedPassword,
      role: "ADMIN",
      phone: "08123456789",
    },
  });
  console.log(" Admin created: admin@aglaonema.id / Admin123!");

  // Store
  await prisma.storeLocation.deleteMany();
  await prisma.storeLocation.create({
    data: {
      name: "Aglaonema Nursery - Parung Bogor",
      address:
        "Jl. Desa No.51, RT.3/RW.3, Waru, Kec. Parung, Kabupaten Bogor, Jawa Barat 16330",
      lat: -6.42776,
      lng: 106.7205384,
      phone: "(0251) 8123-456",
      openHours: "Senin–Sabtu: 08.00–17.00 | Minggu: 09.00–15.00",
    },
  });
  console.log(" Store location created");

  // Products
  await prisma.product.deleteMany();
  for (const product of products) {
    const slug = product.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    await prisma.product.create({
      data: { ...product, slug },
    });
  }
  console.log(` ${products.length} products created`);

  console.log(" Seed completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
