# Supabase setup

## RLS policies

Apply the policies so that:

- **food_items**: All users can read; only `super_admin` and `branch_admin` (for their branch) can create/update/delete.
- **orders** / **order_items**: Respect `user_id` for customers, `branch_id` for `branch_admin`, and full access for `super_admin`.

1. Open [Supabase Dashboard](https://app.supabase.com) → your project → **SQL Editor**.
2. Copy the contents of `migrations/rls_policies_food_items_orders.sql`.
3. Run the script.

Ensure your `profiles` table has columns `role` (text: `super_admin` | `branch_admin` | `customer`) and `branch_id` (number, nullable). The app uses these for all role checks and RLS.
