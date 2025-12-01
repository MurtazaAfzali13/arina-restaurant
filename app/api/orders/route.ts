import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // بررسی اینکه درخواست JSON است
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });

    const { user_id, branch_id, items, customer_info, payment_method, delivery_type } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!branch_id) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!customer_info?.name || !customer_info?.phone || !customer_info?.email) {
      return NextResponse.json(
        { error: 'Customer name, phone, and email are required' },
        { status: 400 }
      );
    }

    // محاسبه مبالغ
    const total_amount = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.meal_price) * Number(item.quantity));
    }, 0);
    
    const tax_amount = total_amount * 0.09;
    const final_amount = total_amount + tax_amount;

    // ایجاد سفارش
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

    if (orderError) {
      console.error('Supabase order error:', orderError);
      throw new Error(`Database error: ${orderError.message}`);
    }

    // ایجاد آیتم‌های سفارش
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      meal_id: item.meal_id,
      meal_name: item.meal_name,
      meal_price: Number(item.meal_price),
      quantity: Number(item.quantity),
      subtotal: Number(item.meal_price) * Number(item.quantity),
      special_instructions: item.special_instructions || null
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Supabase order_items error:', itemsError);
      throw new Error(`Database error: ${itemsError.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      order_id: order.id,
      order_number: order.order_number 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order creation error:', error);
    
    // پاسخ خطای مناسب
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// به فایل موجود اضافه کنید:

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    // اگر userId دارید، سفارشات کاربر را بگیرید
    // اگر ندارید، همه سفارشات را برگردانید (برای ادمین)
    
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json(orders);

  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}