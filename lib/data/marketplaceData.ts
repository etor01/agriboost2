// lib/data/marketplaceData.ts
// 100 seeded dummy crop listings for MVP demo

export type Listing = {
  id: string;
  title: string;
  price: number;
  unit: string;
  quantity_available: number;
  location: string;
  image_urls: string[];
  category: string;
  description: string;
  rating: number;
  reviews: number;
  farmer_name: string;
  farmer_avatar: string;
  is_verified: boolean;
  is_featured: boolean;
  discount?: number; // percentage off
  harvest_date: string;
  delivery_available: boolean;
  min_order: number;
};

const CATEGORIES = [
  "Grains & Cereals",
  "Vegetables",
  "Fruits",
  "Legumes & Pulses",
  "Tubers & Roots",
  "Spices & Herbs",
  "Nuts & Seeds",
];

const REGIONS = [
  "Ashanti Region",
  "Greater Accra",
  "Volta Region",
  "Northern Region",
  "Brong-Ahafo",
  "Eastern Region",
  "Western Region",
  "Central Region",
  "Upper East",
  "Upper West",
];

// Unsplash crop image pool
const IMAGES: Record<string, string[]> = {
  "Grains & Cereals": [
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
    "https://images.unsplash.com/photo-1620086095906-6d3a86fc3ff1?w=600&q=80",
    "https://images.unsplash.com/photo-1601593768799-76b56a7a0073?w=600&q=80",
    "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=600&q=80",
  ],
  Vegetables: [
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
    "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&q=80",
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
    "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80",
  ],
  Fruits: [
    "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&q=80",
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&q=80",
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80",
    "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&q=80",
  ],
  "Legumes & Pulses": [
    "https://images.unsplash.com/photo-1515543904379-3d757bbe96f7?w=600&q=80",
    "https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&q=80",
    "https://images.unsplash.com/photo-1543053986-3d50b1af1bcb?w=600&q=80",
  ],
  "Tubers & Roots": [
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
    "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=600&q=80",
    "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=600&q=80",
  ],
  "Spices & Herbs": [
    "https://images.unsplash.com/photo-1596547609652-9cf5d8c76ea2?w=600&q=80",
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
    "https://images.unsplash.com/photo-1506368083636-6defb67639e2?w=600&q=80",
  ],
  "Nuts & Seeds": [
    "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=600&q=80",
    "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=600&q=80",
    "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80",
  ],
};

const FARMER_NAMES = [
  "Kwame Asante","Akosua Mensah","Kofi Boateng","Ama Darko","Yaw Owusu",
  "Abena Frimpong","Kojo Amoah","Efua Sarpong","Kweku Adjei","Adwoa Kyei",
  "Nana Osei","Akua Amponsah","Fiifi Quaye","Maame Boateng","Ebo Antwi",
  "Serwaa Ntim","Kwadwo Asare","Akosua Poku","Yaa Asante","Kofi Agyeman",
];

const DESCRIPTIONS: Record<string, string[]> = {
  "Grains & Cereals": [
    "Sun-dried and carefully sorted. Harvested fresh from our farm. Perfect for both household and commercial use. Grown without harmful pesticides.",
    "Premium quality grain harvested at peak maturity. Naturally dried for optimal storage. Ideal for mills, breweries, and direct consumption.",
  ],
  Vegetables: [
    "Fresh-picked from the farm. No artificial preservatives. Delivered within 24 hours of harvest to ensure maximum freshness and nutritional value.",
    "Organically grown using traditional farming methods. Rich in vitamins and minerals. Sourced directly from small-scale farmers.",
  ],
  Fruits: [
    "Tree-ripened for superior sweetness and taste. Harvested at peak season. Rich in antioxidants and natural sugars. No waxing or chemical treatments.",
    "Fresh seasonal fruit from well-maintained orchards. Hand-picked with care. Excellent for juice production, direct consumption, or food processing.",
  ],
  "Legumes & Pulses": [
    "Hand-cleaned and sun-dried. High protein content. Sourced from drought-resistant crops grown in the Northern savanna belt. Excellent shelf life.",
    "Naturally grown legumes with no artificial additives. Rich in fiber and plant protein. Cleaned and graded for uniform size.",
  ],
  "Tubers & Roots": [
    "Firm and starchy roots freshly dug from fertile soils. Size-graded for uniform cooking. A staple for Ghanaian homes and restaurants.",
    "Premium quality tubers harvested from well-irrigated farms. Naturally sweet and starchy. Available in bulk for food vendors and processors.",
  ],
  "Spices & Herbs": [
    "Sun-dried and naturally cured. Packed with essential oils and aroma. Sourced from heritage varieties grown in the forest belt of Ghana.",
    "Freshly dried herbs with full flavor retention. No artificial coloring or chemicals. Perfect for cooking, herbal remedies, and spice blending.",
  ],
  "Nuts & Seeds": [
    "Naturally dried and cleaned. Rich in healthy fats and minerals. Ideal for confectionery, cooking oil production, and direct snacking.",
    "Premium seeds sourced from certified farms. High germination rate and nutritional density. Packed carefully to retain freshness.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickImg(cat: string, i: number): string {
  const imgs = IMAGES[cat] || IMAGES["Vegetables"];
  return imgs[i % imgs.length];
}

function seedRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const RAW_CROPS: {
  title: string;
  category: string;
  unit: string;
  basePrice: number;
}[] = [
  // Grains & Cereals (15)
  { title: "White Maize (Obuobi)", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 180 },
  { title: "Yellow Maize (Corn)", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 165 },
  { title: "Local Rice (Ofada)", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 320 },
  { title: "Basmati Rice", category: "Grains & Cereals", unit: "bag (25kg)", basePrice: 280 },
  { title: "Millet (Fonio)", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 145 },
  { title: "Sorghum (Dawa)", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 130 },
  { title: "Wheat Grain", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 310 },
  { title: "Oats (Rolled)", category: "Grains & Cereals", unit: "kg", basePrice: 12 },
  { title: "Barley Grain", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 220 },
  { title: "Guinea Corn", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 140 },
  { title: "Corn Flour (Processed)", category: "Grains & Cereals", unit: "kg", basePrice: 8 },
  { title: "Brown Rice (Local)", category: "Grains & Cereals", unit: "bag (50kg)", basePrice: 290 },
  { title: "Teff Grain", category: "Grains & Cereals", unit: "kg", basePrice: 22 },
  { title: "Quinoa (Imported Seed)", category: "Grains & Cereals", unit: "kg", basePrice: 35 },
  { title: "Popcorn Maize", category: "Grains & Cereals", unit: "bag (25kg)", basePrice: 120 },

  // Vegetables (15)
  { title: "Fresh Tomatoes (Roma)", category: "Vegetables", unit: "crate (20kg)", basePrice: 85 },
  { title: "Garden Eggs (Eggplant)", category: "Vegetables", unit: "bag (10kg)", basePrice: 45 },
  { title: "Okra (Nkuruma)", category: "Vegetables", unit: "kg", basePrice: 7 },
  { title: "Pepper (Habanero)", category: "Vegetables", unit: "kg", basePrice: 15 },
  { title: "Cabbage (Fresh Head)", category: "Vegetables", unit: "piece", basePrice: 6 },
  { title: "Carrot (Nante)", category: "Vegetables", unit: "kg", basePrice: 9 },
  { title: "Lettuce (Iceberg)", category: "Vegetables", unit: "head", basePrice: 4 },
  { title: "Spring Onion", category: "Vegetables", unit: "bundle", basePrice: 3 },
  { title: "Green Beans (French)", category: "Vegetables", unit: "kg", basePrice: 10 },
  { title: "Cucumber (Fresh)", category: "Vegetables", unit: "kg", basePrice: 5 },
  { title: "Spinach (Alefu)", category: "Vegetables", unit: "bundle", basePrice: 4 },
  { title: "Sweet Pepper (Bell)", category: "Vegetables", unit: "kg", basePrice: 20 },
  { title: "Onion Bulbs (Dry)", category: "Vegetables", unit: "bag (50kg)", basePrice: 240 },
  { title: "Garlic Bulbs", category: "Vegetables", unit: "kg", basePrice: 25 },
  { title: "Bitter Melon (Nyanya)", category: "Vegetables", unit: "kg", basePrice: 8 },

  // Fruits (15)
  { title: "Pineapple (Sugar Loaf)", category: "Fruits", unit: "crate (20 pcs)", basePrice: 120 },
  { title: "Mango (Kent)", category: "Fruits", unit: "crate (20kg)", basePrice: 95 },
  { title: "Pawpaw (Papaya)", category: "Fruits", unit: "piece", basePrice: 8 },
  { title: "Avocado (Hass)", category: "Fruits", unit: "crate (30 pcs)", basePrice: 180 },
  { title: "Banana (Cavendish)", category: "Fruits", unit: "bunch", basePrice: 12 },
  { title: "Watermelon", category: "Fruits", unit: "piece", basePrice: 20 },
  { title: "Orange (Navel)", category: "Fruits", unit: "bag (50 pcs)", basePrice: 65 },
  { title: "Coconut (Fresh)", category: "Fruits", unit: "piece", basePrice: 5 },
  { title: "Plantain (Ripe)", category: "Fruits", unit: "bunch", basePrice: 15 },
  { title: "Soursop (Graviola)", category: "Fruits", unit: "kg", basePrice: 18 },
  { title: "Passion Fruit", category: "Fruits", unit: "kg", basePrice: 22 },
  { title: "Guava (Fresh)", category: "Fruits", unit: "kg", basePrice: 7 },
  { title: "Lime (Key Lime)", category: "Fruits", unit: "bag (100 pcs)", basePrice: 45 },
  { title: "African Star Apple (Agbalumo)", category: "Fruits", unit: "kg", basePrice: 12 },
  { title: "Jackfruit", category: "Fruits", unit: "piece", basePrice: 35 },

  // Legumes & Pulses (12)
  { title: "Cowpeas (Black-Eye Beans)", category: "Legumes & Pulses", unit: "bag (50kg)", basePrice: 350 },
  { title: "Groundnuts (Roasted)", category: "Legumes & Pulses", unit: "bag (50kg)", basePrice: 420 },
  { title: "Groundnuts (Raw Shelled)", category: "Legumes & Pulses", unit: "bag (50kg)", basePrice: 380 },
  { title: "Soybeans (Grade A)", category: "Legumes & Pulses", unit: "bag (50kg)", basePrice: 290 },
  { title: "Brown Beans (Honey Beans)", category: "Legumes & Pulses", unit: "bag (50kg)", basePrice: 410 },
  { title: "Bambara Beans (Aboboi)", category: "Legumes & Pulses", unit: "bag (50kg)", basePrice: 300 },
  { title: "Lentils (Red Split)", category: "Legumes & Pulses", unit: "kg", basePrice: 14 },
  { title: "Chickpeas (Dried)", category: "Legumes & Pulses", unit: "kg", basePrice: 16 },
  { title: "Pigeon Peas (Dried)", category: "Legumes & Pulses", unit: "bag (25kg)", basePrice: 175 },
  { title: "Kidney Beans (Dark Red)", category: "Legumes & Pulses", unit: "kg", basePrice: 15 },
  { title: "Sesame Seeds (Beni)", category: "Legumes & Pulses", unit: "kg", basePrice: 28 },
  { title: "Sunflower Seeds", category: "Legumes & Pulses", unit: "kg", basePrice: 12 },

  // Tubers & Roots (13)
  { title: "White Yam (Pona)", category: "Tubers & Roots", unit: "tuber (avg 3kg)", basePrice: 25 },
  { title: "Cocoyam (Taro)", category: "Tubers & Roots", unit: "bag (50kg)", basePrice: 180 },
  { title: "Cassava (Fresh)", category: "Tubers & Roots", unit: "bag (50kg)", basePrice: 95 },
  { title: "Sweet Potato (Orange)", category: "Tubers & Roots", unit: "bag (50kg)", basePrice: 130 },
  { title: "Sweet Potato (White)", category: "Tubers & Roots", unit: "bag (50kg)", basePrice: 110 },
  { title: "Irish Potato", category: "Tubers & Roots", unit: "bag (50kg)", basePrice: 220 },
  { title: "Water Yam (Puna)", category: "Tubers & Roots", unit: "bag (50kg)", basePrice: 160 },
  { title: "Ginger Root (Fresh)", category: "Tubers & Roots", unit: "kg", basePrice: 18 },
  { title: "Turmeric Root", category: "Tubers & Roots", unit: "kg", basePrice: 22 },
  { title: "Cassava Flour (Processed)", category: "Tubers & Roots", unit: "kg", basePrice: 6 },
  { title: "Plantain (Unripe Green)", category: "Tubers & Roots", unit: "bunch", basePrice: 10 },
  { title: "Yam Flour (Fufu)", category: "Tubers & Roots", unit: "kg", basePrice: 9 },
  { title: "Arrowroot (Dry)", category: "Tubers & Roots", unit: "kg", basePrice: 20 },

  // Spices & Herbs (15)
  { title: "Prekese (Aidan Fruit)", category: "Spices & Herbs", unit: "kg", basePrice: 30 },
  { title: "Grains of Selim (Hwentea)", category: "Spices & Herbs", unit: "kg", basePrice: 45 },
  { title: "Dried Chili Pepper (Shito Base)", category: "Spices & Herbs", unit: "kg", basePrice: 25 },
  { title: "Coriander Seeds", category: "Spices & Herbs", unit: "kg", basePrice: 20 },
  { title: "Black Pepper (Dried)", category: "Spices & Herbs", unit: "kg", basePrice: 55 },
  { title: "Cinnamon Bark (Local)", category: "Spices & Herbs", unit: "kg", basePrice: 40 },
  { title: "Cloves (Dried)", category: "Spices & Herbs", unit: "kg", basePrice: 65 },
  { title: "Basil (Fresh)", category: "Spices & Herbs", unit: "bundle", basePrice: 5 },
  { title: "Mint Leaves (Fresh)", category: "Spices & Herbs", unit: "bundle", basePrice: 4 },
  { title: "Moringa Powder", category: "Spices & Herbs", unit: "kg", basePrice: 35 },
  { title: "Bay Leaves (Dried)", category: "Spices & Herbs", unit: "pack (100g)", basePrice: 10 },
  { title: "Ashanti Pepper (Uziza)", category: "Spices & Herbs", unit: "kg", basePrice: 48 },
  { title: "Ehuru (African Nutmeg)", category: "Spices & Herbs", unit: "kg", basePrice: 38 },
  { title: "Thyme (Dried)", category: "Spices & Herbs", unit: "kg", basePrice: 30 },
  { title: "Lemongrass (Fresh)", category: "Spices & Herbs", unit: "bundle", basePrice: 6 },

  // Nuts & Seeds (15)
  { title: "Shea Butter (Raw)", category: "Nuts & Seeds", unit: "kg", basePrice: 40 },
  { title: "Shea Nuts (Dried)", category: "Nuts & Seeds", unit: "bag (50kg)", basePrice: 260 },
  { title: "Palm Kernel Nuts", category: "Nuts & Seeds", unit: "bag (50kg)", basePrice: 200 },
  { title: "Coconut Oil (Virgin)", category: "Nuts & Seeds", unit: "liter", basePrice: 30 },
  { title: "Tiger Nuts (Ofio)", category: "Nuts & Seeds", unit: "kg", basePrice: 15 },
  { title: "Cashew Nuts (Raw)", category: "Nuts & Seeds", unit: "kg", basePrice: 45 },
  { title: "Cashew Nuts (Processed)", category: "Nuts & Seeds", unit: "kg", basePrice: 80 },
  { title: "Pumpkin Seeds (Agushi)", category: "Nuts & Seeds", unit: "kg", basePrice: 22 },
  { title: "Chia Seeds", category: "Nuts & Seeds", unit: "kg", basePrice: 38 },
  { title: "Flaxseeds (Linseed)", category: "Nuts & Seeds", unit: "kg", basePrice: 25 },
  { title: "Watermelon Seeds (Egusi)", category: "Nuts & Seeds", unit: "kg", basePrice: 20 },
  { title: "Kola Nut (White)", category: "Nuts & Seeds", unit: "kg", basePrice: 55 },
  { title: "Locust Beans (Dawadawa)", category: "Nuts & Seeds", unit: "kg", basePrice: 35 },
  { title: "Macadamia Nuts", category: "Nuts & Seeds", unit: "kg", basePrice: 95 },
  { title: "Soybean Oil (Crude)", category: "Nuts & Seeds", unit: "liter", basePrice: 18 },
];

export const DUMMY_LISTINGS: Listing[] = RAW_CROPS.map((crop, i) => {
  const r = (n: number) => seedRandom(i * 37 + n);
  const farmerIndex = Math.floor(r(1) * FARMER_NAMES.length);
  const regionIndex = Math.floor(r(2) * REGIONS.length);
  const imgArr = IMAGES[crop.category] || IMAGES["Vegetables"];
  const imgIndex = Math.floor(r(3) * imgArr.length);
  const descArr = DESCRIPTIONS[crop.category] || DESCRIPTIONS["Vegetables"];
  const descIndex = Math.floor(r(4) * descArr.length);
  const qty = 5 + Math.floor(r(5) * 200);
  const hasDiscount = r(6) > 0.75;
  const discount = hasDiscount ? [5, 10, 15, 20][Math.floor(r(7) * 4)] : undefined;
  const isFeatured = r(8) > 0.8;
  const isVerified = r(9) > 0.4;
  const rating = parseFloat((3.5 + r(10) * 1.5).toFixed(1));
  const reviews = 3 + Math.floor(r(11) * 120);
  const priceVariance = 0.85 + r(12) * 0.3;
  const price = parseFloat((crop.basePrice * priceVariance).toFixed(2));

  const harvestYear = 2025;
  const harvestMonth = 1 + Math.floor(r(13) * 12);
  const harvestDay = 1 + Math.floor(r(14) * 28);
  const harvestDate = `${harvestYear}-${String(harvestMonth).padStart(2, "0")}-${String(harvestDay).padStart(2, "0")}`;

  return {
    id: `listing-${i + 1}`,
    title: crop.title,
    price,
    unit: crop.unit,
    quantity_available: qty,
    location: REGIONS[regionIndex],
    image_urls: [imgArr[imgIndex]],
    category: crop.category,
    description: descArr[descIndex],
    rating,
    reviews,
    farmer_name: FARMER_NAMES[farmerIndex],
    farmer_avatar: `https://i.pravatar.cc/150?img=${(farmerIndex % 70) + 1}`,
    is_verified: isVerified,
    is_featured: isFeatured,
    discount,
    harvest_date: harvestDate,
    delivery_available: r(15) > 0.35,
    min_order: 1 + Math.floor(r(16) * 4),
  };
});

export const ALL_CATEGORIES = ["All", ...CATEGORIES];

export const REGIONS_FILTER = ["All Regions", ...REGIONS];
