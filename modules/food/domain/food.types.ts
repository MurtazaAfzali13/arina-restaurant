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
