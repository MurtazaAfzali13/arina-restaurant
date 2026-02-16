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

export interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_delivery' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method: 'cash' | 'card' | 'online';
    delivery_type: 'pickup' | 'delivery';
    delivery_address: string | null;
    delivery_time: string | null;
    total_amount: string;
    tax_amount: string;
    discount_amount: string;
    final_amount: string;
    customer_notes: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    branch_id: number;
    items?: OrderItem[];
    estimated_delivery?: string;
    completed_at?: string;
}

export interface OrderItem {
    id: string;
    meal_name: string;
    meal_price: string;
    quantity: number;
    subtotal: string;
    special_instructions: string | null;
    meal_id: number;
}