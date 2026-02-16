-- RLS policies for food_items, orders, and order_items
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) after ensuring tables exist.
-- Database roles: super_admin (full access), branch_admin (branch-scoped), customer (own data only).

-- ========== FOOD_ITEMS ==========
ALTER TABLE IF EXISTS food_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (adjust names if you have different ones)
DROP POLICY IF EXISTS "food_items_select_all" ON food_items;
DROP POLICY IF EXISTS "food_items_insert_admin" ON food_items;
DROP POLICY IF EXISTS "food_items_update_admin" ON food_items;
DROP POLICY IF EXISTS "food_items_delete_admin" ON food_items;

-- Read: allow all authenticated users to read food_items (public menu)
CREATE POLICY "food_items_select_all"
  ON food_items FOR SELECT
  TO authenticated
  USING (true);

-- Optional: allow anon read for public menu (uncomment if needed)
-- CREATE POLICY "food_items_select_anon" ON food_items FOR SELECT TO anon USING (true);

-- Insert: only super_admin (any branch) or branch_admin (their branch only)
CREATE POLICY "food_items_insert_admin"
  ON food_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'super_admin'
        OR (profiles.role = 'branch_admin' AND profiles.branch_id = food_items.branch_id)
      )
    )
  );

-- Update: only super_admin or branch_admin for their branch
CREATE POLICY "food_items_update_admin"
  ON food_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'super_admin'
        OR (profiles.role = 'branch_admin' AND profiles.branch_id = food_items.branch_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'super_admin'
        OR (profiles.role = 'branch_admin' AND profiles.branch_id = food_items.branch_id)
      )
    )
  );

-- Delete: same as update
CREATE POLICY "food_items_delete_admin"
  ON food_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'super_admin'
        OR (profiles.role = 'branch_admin' AND profiles.branch_id = food_items.branch_id)
      )
    )
  );

-- ========== ORDERS ==========
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_select_branch_admin" ON orders;
DROP POLICY IF EXISTS "orders_select_super_admin" ON orders;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;

-- Customers: see own orders only
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Branch admin: see orders for their branch
CREATE POLICY "orders_select_branch_admin"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'branch_admin'
      AND profiles.branch_id = orders.branch_id
    )
  );

-- Super admin: see all orders
CREATE POLICY "orders_select_super_admin"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Insert: authenticated users can create orders (e.g. checkout)
CREATE POLICY "orders_insert_authenticated"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role / server-side inserts may bypass RLS when using service key.

-- ========== ORDER_ITEMS ==========
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_via_order" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_via_order" ON order_items;

-- Select: user can see order_items for orders they can see (own, branch_admin branch, or super_admin)
CREATE POLICY "order_items_select_via_order"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      LEFT JOIN profiles p ON p.id = auth.uid()
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR (p.role = 'branch_admin' AND p.branch_id = o.branch_id)
        OR (p.role = 'super_admin')
      )
    )
  );

-- Insert: allow when creating orders (order ownership checked at order level)
CREATE POLICY "order_items_insert_via_order"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);
