import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getOrderCleanupCutoffIso, isOrderExpired } from '@/lib/orderExpiry';
import { calcTaxAndTotalFromCents, fromCents, toCents } from '@/lib/pricing';
import { createHash } from 'crypto';

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

const sha256Hex = (input: string) => {
  return createHash('sha256').update(input).digest('hex');
};

type FingerprintItem = {
  meal_id: number;
  quantity: number;
  meal_price_cents: number;
};

type UnknownRecord = Record<string, unknown>;

function normalizeItemsForFingerprint(items: unknown[]): FingerprintItem[] {
  return (items || [])
    .map((raw) => {
      const item = raw as UnknownRecord;
      const meal_id = Number(item.meal_id);
      const quantity = Number(item.quantity);
      const meal_price_cents = toCents(Number(item.meal_price));
      return { meal_id, quantity, meal_price_cents };
    })
    .filter((i) => i.meal_id > 0 && i.quantity > 0)
    .sort((a, b) => a.meal_id - b.meal_id);
}

function isMissingIdempotencyColumn(error: { message?: string | null; code?: string | null } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42703' ||
    (typeof error.message === 'string' &&
      error.message.toLowerCase().includes('idempotency_key') &&
      error.message.toLowerCase().includes('does not exist'))
  );
}

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

    const {
      branch_id,
      items,
      customer_info,
      payment_method,
      delivery_type,
      delivery_fee,
      idempotency_key,
    } = body;

    if (!Number.isFinite(Number(branch_id)) || Number(branch_id) <= 0) {
      return NextResponse.json({ error: 'Valid branch ID is required' }, { status: 400 });
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

    // Attach user_id from session cookie if present (so `/orders` works for customers).
    const cookieStore = await cookies();
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: sessionData } = await supabaseAuth.auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;

    const scopedUserId = sessionUserId ?? 'anon';

    const itemsFingerprint = normalizeItemsForFingerprint(items as unknown[]);
    const requestedFingerprint = JSON.stringify({
      branch_id: Number(branch_id),
      delivery_type,
      payment_method,
      // Include delivery address only for delivery orders.
      delivery_address: delivery_type === 'delivery' ? customer_info?.address ?? null : null,
      customer_contact: {
        name: customer_info?.name ?? '',
        phone: customer_info?.phone ?? '',
        email: customer_info?.email ?? '',
      },
      items: itemsFingerprint,
    });

    // Idempotency window (seconds). Must be >= typical double-submit time.
    const windowBucket = Math.floor(Date.now() / 30_000);
    const idempotencySuffix =
      typeof idempotency_key === 'string' && idempotency_key.length > 0 && idempotency_key.length <= 128
        ? idempotency_key
        : sha256Hex(requestedFingerprint);

    // Scope key so different users never collide.
    const effectiveIdempotencyKey = `${scopedUserId}:${windowBucket}:${idempotencySuffix}`;

    // Precision-safe money computations in cents.
    const itemsSubtotalCents = itemsFingerprint.reduce(
      (sum: number, item) => sum + item.meal_price_cents * item.quantity,
      0
    );

    const deliveryFee =
      delivery_type === 'delivery'
        ? Number.isFinite(Number(delivery_fee)) && Number(delivery_fee) >= 0
          ? Number(delivery_fee)
          : 5
        : 0;

    const deliveryFeeCents = delivery_type === 'delivery' ? toCents(deliveryFee) : 0;
    const totals = calcTaxAndTotalFromCents({
      subtotalCents: itemsSubtotalCents,
      deliveryFeeCents,
    });

    const supabase = createServiceClient();

    let idempotencyEnabled = true;
    let existingOrder: { id: string; order_number: string; status: string | null; created_at: string | null } | null = null;

    // 1) Idempotency lookup (prevents duplicates & fixes race conditions).
    const { data: existingOrderData, error: existingOrderError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('idempotency_key', effectiveIdempotencyKey)
      .single();

    if (existingOrderError && existingOrderError.code !== 'PGRST116') {
      // PGRST116 = no rows in a single() selection.
      if (isMissingIdempotencyColumn(existingOrderError)) {
        idempotencyEnabled = false;
      } else {
        throw new Error(existingOrderError.message);
      }
    } else {
      existingOrder = existingOrderData;
    }

    if (existingOrder) {
      if (isOrderExpired({ created_at: existingOrder.created_at, status: existingOrder.status })) {
        return NextResponse.json(
          { error: 'Order expired. Please submit again.' },
          { status: 410 }
        );
      }

      // Best-effort: if the order has no items yet, insert them.
      const { data: existingItem } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', existingOrder.id)
        .limit(1);

      if (!existingItem || existingItem.length === 0) {
        const orderItemsToInsert = (items as unknown[]).map((raw) => {
          const item = raw as UnknownRecord;
          const unitCents = toCents(Number(item.meal_price));
          const qty = Number(item.quantity);
          const subtotalCents = unitCents * qty;
          return {
          order_id: existingOrder.id,
          meal_id: Number(item.meal_id),
          meal_name: String(item.meal_name ?? ''),
          meal_price: fromCents(unitCents),
          quantity: qty,
          subtotal: fromCents(subtotalCents),
          special_instructions:
            typeof item.special_instructions === 'string' ? item.special_instructions : null,
          };
        });

        const { error: retryItemsError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert);

        if (retryItemsError) throw new Error(retryItemsError.message);
      }

      return NextResponse.json(
        {
          success: true,
          order_id: existingOrder.id,
          order_number: existingOrder.order_number,
        },
        { status: 200 }
      );
    }

    const orderPayload: Record<string, unknown> = {
      user_id: sessionUserId,
      branch_id: Number(branch_id),
      customer_name: customer_info.name,
      customer_phone: customer_info.phone,
      customer_email: customer_info.email,
      total_amount: totals.totalAmount,
      tax_amount: totals.taxAmount,
      final_amount: totals.finalAmount,
      payment_method,
      delivery_type,
      delivery_address: customer_info.address || null,
      status: 'pending',
      payment_status: 'pending',
    };
    if (idempotencyEnabled) {
      orderPayload.idempotency_key = effectiveIdempotencyKey;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      if (isMissingIdempotencyColumn(orderError)) {
        // Fallback for DBs where migration has not been applied yet.
        idempotencyEnabled = false;
        const { idempotency_key: _idempotencyKey, ...orderPayloadWithoutIdempotency } = orderPayload;
        const { data: orderWithoutIdempotency, error: retryOrderError } = await supabase
          .from('orders')
          .insert(orderPayloadWithoutIdempotency)
          .select()
          .single();

        if (retryOrderError) throw new Error(retryOrderError.message);

        const retryOrderItems = (items as unknown[]).map((raw) => {
          const item = raw as UnknownRecord;
          const unitCents = toCents(Number(item.meal_price));
          const qty = Number(item.quantity);
          const subtotalCents = unitCents * qty;
          return {
            order_id: orderWithoutIdempotency.id,
            meal_id: Number(item.meal_id),
            meal_name: String(item.meal_name ?? ''),
            meal_price: fromCents(unitCents),
            quantity: qty,
            subtotal: fromCents(subtotalCents),
            special_instructions:
              typeof item.special_instructions === 'string' ? item.special_instructions : null,
          };
        });

        const { error: retryItemsError } = await supabase.from('order_items').insert(retryOrderItems);
        if (retryItemsError) {
          await supabase.from('orders').delete().eq('id', orderWithoutIdempotency.id);
          throw new Error(retryItemsError.message);
        }

        return NextResponse.json(
          {
            success: true,
            order_id: orderWithoutIdempotency.id,
            order_number: orderWithoutIdempotency.order_number,
          },
          { status: 201 }
        );
      }

      // Race condition: another request won the idempotency-key insert.
      if (idempotencyEnabled && orderError.code === '23505') {
        const { data: existingAfterInsert } = await supabase
          .from('orders')
          .select('id, order_number, status, created_at')
          .eq('idempotency_key', effectiveIdempotencyKey)
          .single();

        if (!existingAfterInsert) {
          throw new Error('Idempotency conflict but existing order not found');
        }

        if (isOrderExpired({ created_at: existingAfterInsert.created_at, status: existingAfterInsert.status })) {
          return NextResponse.json(
            { error: 'Order expired. Please submit again.' },
            { status: 410 }
          );
        }

        const { data: existingItem } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', existingAfterInsert.id)
          .limit(1);

        if (!existingItem || existingItem.length === 0) {
          const orderItemsToInsert = (items as unknown[]).map((raw) => {
            const item = raw as UnknownRecord;
            const unitCents = toCents(Number(item.meal_price));
            const qty = Number(item.quantity);
            const subtotalCents = unitCents * qty;
            return {
              order_id: existingAfterInsert.id,
              meal_id: Number(item.meal_id),
              meal_name: String(item.meal_name ?? ''),
              meal_price: fromCents(unitCents),
              quantity: qty,
              subtotal: fromCents(subtotalCents),
              special_instructions:
                typeof item.special_instructions === 'string' ? item.special_instructions : null,
            };
          });

          const { error: retryItemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);
          if (retryItemsError) throw new Error(retryItemsError.message);
        }

        return NextResponse.json(
          {
            success: true,
            order_id: existingAfterInsert.id,
            order_number: existingAfterInsert.order_number,
          },
          { status: 200 }
        );
      }

      throw new Error(orderError.message);
    }

    const orderItems = (items as unknown[]).map((raw) => {
      const item = raw as UnknownRecord;
      const unitCents = toCents(Number(item.meal_price));
      const qty = Number(item.quantity);
      const subtotalCents = unitCents * qty;
      return {
        order_id: order.id,
        meal_id: Number(item.meal_id),
        meal_name: String(item.meal_name ?? ''),
        meal_price: fromCents(unitCents),
        quantity: qty,
        subtotal: fromCents(subtotalCents),
        special_instructions:
          typeof item.special_instructions === 'string' ? item.special_instructions : null,
      };
    });

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      // Avoid leaving an unusable order if item insert fails.
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(itemsError.message);
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        error: message,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// 🔹 دریافت سفارش‌ها
export async function GET(_request: NextRequest) {
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

    const cleanupCutoffIso = getOrderCleanupCutoffIso();
    let query = supabase
      .from('orders')
      .select('*')
      .gte('created_at', cleanupCutoffIso)
      .order('created_at', { ascending: false });

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

    const visibleOrders = (orders || []).filter((o) =>
      !isOrderExpired({ created_at: o.created_at, status: o.status })
    );
    return NextResponse.json(visibleOrders);
  } catch (error: unknown) {
    console.error('Get orders error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
