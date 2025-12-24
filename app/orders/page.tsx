'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/modules/food/hooks/useAdmin';

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  final_amount: number;
  created_at: string;
  branch_id: number;
};

type OrderItem = {
  id: string;
  meal_name: string;
  meal_price: number;
  quantity: number;
  subtotal: number;
};

export default function UserOrdersPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;

    // اگر کاربر لاگین نکرده باشد، او را به صفحه لاگین بفرستیم
    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          router.replace('/login');
          return;
        }

        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error('Error fetching user orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, userLoading, router, supabase]);

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      router.replace('/login');
      return;
    }

    const res = await fetch(`/api/order-items/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const items: OrderItem[] = await res.json();
      setOrderItems(prev => ({ ...prev, [orderId]: items }));
    }
  };

  const handleToggle = async (orderId: string) => {
    const nextExpanded = expandedOrderId === orderId ? null : orderId;
    setExpandedOrderId(nextExpanded);
    if (nextExpanded) {
      await loadOrderItems(orderId);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">My Orders</h1>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">My Orders</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
            <Link
              href="/1/menu"
              className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const items = orderItems[order.id];
              return (
                <div
                  key={order.id}
                  className="rounded-xl bg-white p-5 shadow-sm border border-gray-200"
                >
                  <button
                    onClick={() => handleToggle(order.id)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Order #
                          <span className="font-semibold text-gray-800 ml-1">
                            {order.order_number}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          Status:{' '}
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize">
                            {order.status.replace('_', ' ')}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-emerald-600">
                          ${order.final_amount.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700 font-medium">
                          {isExpanded ? 'Hide items' : 'View items'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                      {!items ? (
                        <p className="text-sm text-gray-500">Loading items...</p>
                      ) : items.length === 0 ? (
                        <p className="text-sm text-gray-500">No items for this order.</p>
                      ) : (
                        items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm text-gray-700"
                          >
                            <div>
                              <p className="font-medium">{item.meal_name}</p>
                              <p className="text-xs text-gray-500">
                                ${item.meal_price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold text-emerald-600">
                              ${item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        ))
                      )}
                      <div className="pt-2">
                        <Link
                          href={`/order-confirmation/${order.id}`}
                          className="text-sm font-semibold text-emerald-600 hover:underline"
                        >
                          View full details
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


