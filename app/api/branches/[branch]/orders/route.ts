// app/api/branches/[branch]/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🔥 Configهای Next.js
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ branch: string }> } // ⚡ برای Turbopack لازم است
) {
  console.log('🚀 API Route called - /api/branches/[branch]/orders');

  // 🔹 پارامتر branch را از Promise بگیرید
  const { branch } = await context.params;

  if (!branch) {
    return NextResponse.json(
      { error: 'Branch ID is required' },
      { status: 400 }
    );
  }

  try {
    return handleOrdersRequest(request, branch);
  } catch (error: any) {
    console.error('❌ Unhandled API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// 🔹 تابع اصلی برای پردازش سفارشات
async function handleOrdersRequest(request: NextRequest, branch: string) {
  console.log('🔄 Handling request for branch:', branch);

  const branchIdNum = parseInt(branch, 10);
  if (isNaN(branchIdNum)) {
    return NextResponse.json(
      { error: 'Branch ID must be a valid number' },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization header is required with Bearer token' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
  }

  if (profile.role !== 'branch_admin' || !profile.branch_id) {
    return NextResponse.json({ error: 'Access denied. Branch admin role required.' }, { status: 403 });
  }

  if (Number(profile.branch_id) !== branchIdNum) {
    return NextResponse.json(
      { error: `Access denied. You only have access to branch ${profile.branch_id}` },
      { status: 403 }
    );
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('branch_id', branchIdNum)
    .order('created_at', { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: 'Failed to fetch orders from database' }, { status: 500 });
  }

  return NextResponse.json(orders || [], {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
}
