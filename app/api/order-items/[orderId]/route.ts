// app/api/order-items/[orderId]/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🔹 دریافت توکن Bearer با await
const getBearerToken = async () => {
  const allHeaders = await headers(); // ⚡ await اضافه شد
  const authHeader = allHeaders.get('Authorization') || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> } // ⚡ Turbopack style
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const token = await getBearerToken(); // ⚡ await اضافه شد
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    // بررسی مالکیت سفارش
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, branch_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (profile.role === 'branch_admin') {
      if (!profile.branch_id || Number(order.branch_id) !== Number(profile.branch_id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      if (order.user_id !== userData.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
    }

    return NextResponse.json(orderItems || []);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
