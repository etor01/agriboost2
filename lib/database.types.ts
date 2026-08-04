// lib/database.types.ts
// Auto-generated from Supabase project: leaftezdcoitoexsztpj
// Tables: profiles, farmers, buyers, admins, farms, crops, listings,
//         orders, transactions, subscriptions, tasks, crop_diagnostics, activities

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Row types (what you get back from SELECT) ─────────────────────────────────

export interface Profile {
  id: string;
  role: string | null;
  phone: string | null;
  email: string | null;           // added: populated by handle_new_user trigger
  firstname: string | null;
  lastname: string | null;
  location: string | null;
  region: string | null;
  bio: string | null;
  verified_status: boolean;
  verification_status: 'pending' | 'verified' | 'rejected' | string;
  verification_doc_url: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'premium' | string;
  ai_scans_remaining: number;
  subscription_end_date: string | null;
  trial_start_date: string;
  wallet_balance: number;         // AgriBoost wallet — loadable via Paystack
  available_balance: number;      // Farmer's released escrow / available for withdrawal
  created_at: string;
  updated_at: string;
}

export interface Farmer {
  profile_id: string;
  specialization: string | null;
  experience_years: number | null;
  created_at: string;
}

export interface Buyer {
  profile_id: string;
  preferred_categories: string[] | null;
  delivery_address: string | null;
  created_at: string;
}

export interface Admin {
  profile_id: string;
  admin_level: 'super_admin' | 'moderator' | 'support' | string;  // matches schema constraint
  created_at: string;
}

export interface Farm {
  id: string;
  profile_id: string;
  name: string;
  location: string | null;
  region: string | null;
  size_in_acres: number;
  primary_crop: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  established_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  farm_id: string;
  crop_type: string;
  planting_date: string | null;
  estimated_harvest_date: string | null;
  area: number;
  current_growth_stage: string;
  maturity_percentage: number;
  ai_growth_data: Json | null;
  status: 'active' | 'harvested' | 'failed' | string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  profile_id: string;
  crop_id: string | null;
  name: string;
  description: string | null;
  price_per_unit: number;
  unit_type: string;
  quantity: number;
  status: 'active' | 'sold' | 'inactive' | string;
  image_urls: string[] | null;
  rating: number;
  reviews: number;
  is_featured: boolean;
  discount: number;
  delivery_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string | null;
  listing_id: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'processing' | 'confirmed' | 'delivered' | 'cancelled' | string;
  delivery_otp: string | null;
  delivery_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  order_id: string | null;
  profile_id: string | null;
  paystack_reference: string | null;
  amount: number;
  service_name: string | null;
  escrow_held: boolean;
  release_date: string | null;
  farmer_payout_date: string | null;
  status: 'pending' | 'completed' | 'refunded' | string;
  // Wallet & fee breakdown fields
  transaction_type: 'wallet_topup' | 'purchase' | 'escrow_hold' | 'escrow_release' | 'farmer_withdrawal' | 'platform_fee' | string | null;
  delivery_fee: number;          // delivery fee portion (goes to platform)
  platform_fee: number;          // 5% of (subtotal + delivery) — goes to platform
  sales_amount: number;          // amount that goes to farmer after fees
  platform_fee_collected: boolean;
  farmer_balance_credited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'cancelled' | 'expired' | string;
  paystack_subscription_id: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  crop_id: string | null;
  description: string;
  due_date: string | null;
  completed: boolean;
  task_type: string | null;
  priority: 'low' | 'medium' | 'high' | string;
  created_at: string;
  updated_at: string;
}

export interface CropDiagnostic {
  id: string;
  profile_id: string | null;
  crop_id: string | null;
  image_url: string | null;
  ai_result: Json | null;
  status: 'completed' | 'processing' | 'failed' | string;
  created_at: string;
}

export interface Activity {
  id: string;
  profile_id: string | null;
  activity_type:
    | 'crop_created'
    | 'farm_created'
    | 'listing_created'
    | 'scan_performed'
    | 'task_completed'
    | 'payment_received'
    | string;
  title: string;
  description: string | null;
  created_at: string;
}

// ── Insert types (omit server-generated fields) ───────────────────────────────

export type ProfileInsert = Pick<Profile, 'id'> &
  Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type FarmInsert = Omit<Farm, 'id' | 'created_at' | 'updated_at'>;
export type CropInsert = Omit<Crop, 'id' | 'created_at' | 'updated_at'>;
export type ListingInsert = Omit<Listing, 'id' | 'created_at' | 'updated_at'>;
export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type ActivityInsert = Omit<Activity, 'id' | 'created_at'>;

// ── Update types (all fields optional except PK) ──────────────────────────────

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type FarmUpdate = Partial<Omit<Farm, 'id' | 'created_at'>>;
export type CropUpdate = Partial<Omit<Crop, 'id' | 'created_at'>>;
export type ListingUpdate = Partial<Omit<Listing, 'id' | 'created_at'>>;
export type OrderUpdate = Partial<Omit<Order, 'id' | 'created_at'>>;
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'created_at'>>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at'>>;

// ── Joined / enriched shapes used in the UI ───────────────────────────────────

/** Task joined with its parent crop (dashboard query) */
export type TaskWithCrop = Task & {
  crops: Pick<Crop, 'crop_type'> | null;
};
