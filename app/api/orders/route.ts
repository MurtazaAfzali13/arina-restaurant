import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 🔹 async و await برای headers
const getBearerToken = async () => {
  const allHeaders = await headers(); // ⚡ حتماً await
  const authHeader = allHeaders.get('Authorization') || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

const createServiceClient = () =>
  createClient(supabaseUrl, supabaseServiceKey);

const createRlsClient = (token: string) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

// 🔹 ایجاد سفارش
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    const body = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });

    const { user_id, branch_id, items, customer_info, payment_method, delivery_type } = body;

    if (!branch_id) return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'Items array is required and cannot be empty' }, { status: 400 });
    if (!customer_info?.name || !customer_info?.phone || !customer_info?.email) return NextResponse.json({ error: 'Customer name, phone, and email are required' }, { status: 400 });

    const total_amount = items.reduce((sum: number, item: any) => sum + (Number(item.meal_price) * Number(item.quantity)), 0);
    const tax_amount = total_amount * 0.09;
    const final_amount = total_amount + tax_amount;

    const supabase = createServiceClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null,
        branch_id: Number(branch_id),
        customer_name: customer_info.name,
        customer_phone: customer_info.phone,
        customer_email: customer_info.email,
        total_amount,
        tax_amount,
        final_amount,
        payment_method,
        delivery_type,
        delivery_address: customer_info.address || null,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      meal_id: item.meal_id,
      meal_name: item.meal_name,
      meal_price: Number(item.meal_price),
      quantity: Number(item.quantity),
      subtotal: Number(item.meal_price) * Number(item.quantity),
      special_instructions: item.special_instructions || null
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw new Error(itemsError.message);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
}

// 🔹 دریافت سفارش‌ها
export async function GET(request: NextRequest) {
  try {
    const token = await getBearerToken(); // ⚡ await اضافه شد
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createRlsClient(token);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (profile.role === 'super_admin') {
      // Full access: no filter
    } else if (profile.role === 'branch_admin') {
      if (!profile.branch_id) return NextResponse.json({ error: 'Branch not set for branch admin' }, { status: 403 });
      query = query.eq('branch_id', profile.branch_id);
    } else {
      query = query.eq('user_id', userData.user.id);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
