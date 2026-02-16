// app/api/order-items/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.orderId;
    
    // احراز هویت کاربر
    const allHeaders = await headers();
    const authHeader = allHeaders.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // ابتدا بررسی می‌کنیم که کاربر به این سفارش دسترسی دارد
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // اگر کاربر ID وجود دارد و لاگین کرده، بررسی می‌کنیم
    if (order.user_id) {
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData.user?.id !== order.user_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // دریافت آیتم‌های سفارش
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json(orderItems || []);

  } catch (error: any) {
    console.error('Error fetching order items:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}