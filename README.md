# AgriBoost 🌱

AgriBoost is a modern, full-stack, AI-powered agricultural ecosystem designed to empower farmers, streamline agricultural commerce, and provide actionable growth insights for investors.

## 🛠️ Tech Stack

AgriBoost is built as a single, unified web application. It does not use external microservices or Python.

* **Full-stack Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, and API Routes)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Database & Storage:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, and Supabase Storage)
* **AI & Machine Learning:** [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index) (using the `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` model for crop disease classification)
* **Payment Integration:** [Paystack](https://paystack.com/) (integrated via `react-paystack` for secure transactional commerce)
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS & [Lucide React](https://lucide.dev/) icons
* **Smooth Scrolling:** [Lenis](https://lenis.darkroom.engineering/) for high-performance momentum scrolling

---

## 🚀 Key Features

* **AI Crop Care (Plant Doctor):** Real-time diagnosis of crop diseases. Farmers upload photos of affected crop leaves which are sent directly to the Hugging Face Inference API. The image is saved in Supabase Storage, and the diagnosis score along with detailed recommendations is stored in the Supabase database.
* **Direct Marketplace:** An interactive e-commerce platform allowing farmers to list harvests and buyers to purchase crops directly. Features rich category tagging (Grains & Cereals, Vegetables, Fruits, Legumes, Tubers, Spices, Nuts) and region-based filtering (supporting Ghanaian regions).
* **Farm Management & Geospatial Mapping:** Tools for mapping farmlands, defining crop boundaries, recording GPS coordinates, sizing, and tracking specific crop varieties.
* **Financial Tools & Insights:** A finances dashboard/tracker to monitor income, expenses, loan applications, and equipment funding.
* **Multi-Tier Portals:**
  * **Farmer Portal:** Provides access to the main dashboard, AI crop analysis history, farm mappings, and financial metrics.
  * **Admin Dashboard:** Access-restricted route (`/admin`) for platform monitoring and managing farmers. Access is secure using Next.js Middleware role verification (`user.app_metadata.role === 'admin'`).
  * **Investor/Sponsor Portal:** Dedicated metrics page (`/metrics`) for investors and government agencies to track agricultural productivity, regional stats, and crop yields.

---

## 📂 Project Structure

```bash
agriboost2/
├── app/                  # Next.js App Router Pages and API routes
│   ├── (auth)/           # Authentication flows (login, signup, forgot-password)
│   ├── (dashboard)/      # User dashboards (ai-center, farm, finances, profile)
│   ├── admin/            # Admin control panels and farmer directories
│   ├── api/              # Backend endpoints (e.g., detectDisease route)
│   ├── marketplace/      # E-commerce product browser and detail views
│   └── metrics/          # Sponsor & Investor data visualizations
├── components/           # Reusable React components (farm modals, UI shell, etc.)
│   ├── features/         # Feature-specific modals (add farm, add crop)
│   └── ui/               # Global layout items (Hero, Header, Footer, LenisScroll)
├── lib/                  # Application utility functions and shared database layers
│   ├── data/             # Mock databases and static lists
│   └── supabase/         # Supabase Client, Server, and Middleware configuration
├── public/               # Static assets, logos, and UI icons
├── tailwind.config.ts    # Tailwind styling tokens
└── next.config.ts        # Next.js framework configuration (image remote patterns, build ignores)
```

---

## 💻 Getting Started

Follow these instructions to set up the development environment and run the application locally.

### Prerequisites

* [Node.js](https://nodejs.org/) (version 18.x or 20.x+ recommended)
* npm (or yarn / pnpm)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/agriboost.git
   cd agriboost
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env.local` file at the root of the project and add the following configuration keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key

# Hugging Face Inference API (Required for AI Crop Care)
HUGGINGFACE_API_KEY=your-huggingface-api-token
HF_API_KEY=your-huggingface-api-token
```

### Running Locally

Start the development server with Next.js Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

Compile and run the production-optimized bundle:

```bash
npm run build
npm run start
```
