'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/modules/food/hooks/useAdmin';

// تایپ‌های جدید مطابق با دیتابیس
type Order = {
  idx: number;
  id: string;
  user_id: string | null;
  branch_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  order_number: string;
  status: string;
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  final_amount: string;
  payment_status: string;
  payment_method: string;
  delivery_type: string;
  delivery_address: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type OrderItem = {
  idx: number;
  id: string;
  order_id: string;
  meal_id: number;
  meal_name: string;
  meal_price: string;
  quantity: number;
  subtotal: string;
  special_instructions: string | null;
  created_at: string;
};

// مپ کردن وضعیت‌ها به فارسی
const statusTranslations: Record<string, { text: string; color: string; bgColor: string }> = {
  pending: { text: 'در انتظار تایید', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  confirmed: { text: 'تایید شده', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  preparing: { text: 'در حال آماده‌سازی', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  ready: { text: 'آماده تحویل', color: 'text-green-700', bgColor: 'bg-green-100' },
  delivered: { text: 'تحویل داده شده', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  cancelled: { text: 'لغو شده', color: 'text-red-700', bgColor: 'bg-red-100' },
  completed: { text: 'تکمیل شده', color: 'text-gray-700', bgColor: 'bg-gray-100' }
};

// مپ کردن روش پرداخت
const paymentMethodTranslations: Record<string, string> = {
  cash: 'نقدی',
  card: 'کارت',
  online: 'آنلاین'
};

// مپ کردن نوع تحویل
const deliveryTypeTranslations: Record<string, string> = {
  delivery: 'تحویل درب منزل',
  pickup: 'تحویل حضوری'
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

    if (!user) {
      router.replace('/login');
      return;
    }

    fetchOrders();
  }, [user, userLoading, router]);

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
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const data: Order[] = await res.json();
      setOrders(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      console.error('Error fetching user orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const res = await fetch(`/api/order-items/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch order items: ${res.status}`);
      }

      const items: OrderItem[] = await res.json();
      setOrderItems(prev => ({ ...prev, [orderId]: items }));
    } catch (error) {
      console.error('Error loading order items:', error);
    }
  };

  const handleToggle = async (orderId: string) => {
    const nextExpanded = expandedOrderId === orderId ? null : orderId;
    setExpandedOrderId(nextExpanded);
    if (nextExpanded) {
      await loadOrderItems(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    return statusTranslations[status] || { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">سفارش‌های من</h1>
          <div className="rounded-xl bg-red-50 border border-red-200 p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سفارش‌های من</h1>
        <p className="text-gray-600 mb-6">تمام سفارش‌های شما در اینجا نمایش داده می‌شوند</p>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">شما هنوز سفارشی ثبت نکرده‌اید</p>
            <p className="text-gray-500 text-sm mb-6">اولین سفارش خود را ثبت کنید</p>
            <Link
              href="/1/menu"
              className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              مشاهده منو و سفارش
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const items = orderItems[order.id];
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <div
                  key={order.id}
                  className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* اطلاعات اصلی سفارش */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            شماره سفارش: 
                            <span className="font-semibold text-gray-800 mr-2">
                              {order.order_number}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* اطلاعات مشتری */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">نام مشتری:</p>
                          <p className="font-medium">{order.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">شماره تماس:</p>
                          <p className="font-medium">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">نحوه تحویل:</p>
                          <p className="font-medium">
                            {deliveryTypeTranslations[order.delivery_type] || order.delivery_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">روش پرداخت:</p>
                          <p className="font-medium">
                            {paymentMethodTranslations[order.payment_method] || order.payment_method}
                          </p>
                        </div>
                      </div>

                      {/* آدرس تحویل */}
                      {order.delivery_address && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-sm">آدرس تحویل:</p>
                          <p className="text-sm font-medium">{order.delivery_address}</p>
                        </div>
                      )}
                    </div>

                    {/* مبلغ و دکمه مشاهده */}
                    <div className="lg:text-right border-t lg:border-t-0 lg:border-r pt-4 lg:pt-0 lg:pr-6 lg:pl-6">
                      <div className="mb-4">
                        <p className="text-gray-500 text-sm">مبلغ کل:</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {parseFloat(order.final_amount).toLocaleString('fa-IR')} تومان
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          شامل مالیات: {parseFloat(order.tax_amount).toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleToggle(order.id)}
                        className="flex items-center justify-center lg:justify-end text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                      >
                        {isExpanded ? (
                          <>
                            بستن جزئیات
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            مشاهده جزئیات
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* جزئیات آیتم‌های سفارش */}
                  {isExpanded && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">جزئیات سفارش</h3>
                      
                      {!items ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                          <p className="text-gray-500 mt-2">در حال بارگذاری...</p>
                        </div>
                      ) : items.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">آیتمی برای این سفارش یافت نشد</p>
                      ) : (
                        <div className="space-y-3">
                          {items.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{item.meal_name}</p>
                                {item.special_instructions && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    توضیحات: {item.special_instructions}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right ml-4">
                                <p className="text-sm text-gray-700">
                                  {item.quantity} × {parseFloat(item.meal_price).toLocaleString('fa-IR')} تومان
                                </p>
                                <p className="font-semibold text-emerald-600 mt-1">
                                  {parseFloat(item.subtotal).toLocaleString('fa-IR')} تومان
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {/* جمع کل */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="text-sm">
                                <p className="text-gray-600">تعداد کل آیتم‌ها:</p>
                                <p className="text-gray-800 font-medium">
                                  {items.reduce((sum, item) => sum + item.quantity, 0)} قلم
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-600 text-sm">جمع کل سفارش:</p>
                                <p className="text-xl font-bold text-emerald-600">
                                  {parseFloat(order.final_amount).toLocaleString('fa-IR')} تومان
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* لینک مشاهده کامل */}
                      <div className="mt-6 flex justify-end">
                        <Link
                          href={`/order-confirmation/${order.id}`}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          مشاهده صفحه کامل سفارش
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
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