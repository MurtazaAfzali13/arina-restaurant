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
  role: 'admin' | 'customer';
  phone?: string;
  branch_id?: number | null;
}