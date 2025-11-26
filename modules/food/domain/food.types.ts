export type Food = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  branch_id: number;
  created_by?: string;
  created_at: string;
};
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  branch_id?: number | null;
  role?: 'super_admin' | 'branch_admin' | 'customer'; // ← اصلاح شد
  created_at?: string;
}


export interface City {
  id: number;
  cityName: string;
  country?: string;   // ⬅ این را optional کن
  emoji?: string;
  notes?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
}
