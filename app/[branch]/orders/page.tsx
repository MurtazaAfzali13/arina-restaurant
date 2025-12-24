// app/[branch]/orders/page.tsx
'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    Package,
    DollarSign,
    CheckCircle,
    XCircle,
    RefreshCw,
    ChevronRight,
    Filter,
    ArrowUpDown,
    ShoppingBag
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/modules/food/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';

// نوع داده سفارش
interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_delivery' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method: 'cash' | 'card' | 'online';
    delivery_type: 'pickup' | 'delivery';
    delivery_address: string | null;
    total_amount: string;
    final_amount: string;
    created_at: string;
    branch_id: number;
    items?: OrderItem[];
}

interface OrderItem {
    id: string;
    meal_name: string;
    meal_price: string;
    quantity: number;
    subtotal: string;
    special_instructions: string | null;
}

// 🔥 کامپوننت اصلی منطق
function OrdersContent({ branchId }: { branchId: string }) {
    const router = useRouter();
    const { profile, isBranchAdmin, loading: userLoading } = useUser();
    const supabase = createClientComponentClient();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

    // بررسی دسترسی مدیر شعبه
    useEffect(() => {
        if (!userLoading) {
            const userBranchId = Number(profile?.branch_id);
            const currentBranchId = Number(branchId);

            if (!isBranchAdmin || userBranchId !== currentBranchId) {
                console.warn('⚠️ Unauthorized access attempt');
                router.push('/unauthorized');
            }
        }
    }, [userLoading, isBranchAdmin, profile, branchId, router]);

    // بارگیری سفارشات
    useEffect(() => {
        const fetchOrders = async () => {
            console.log('🔄 fetchOrders called for branch:', branchId);
            
            if (!branchId) {
                console.error('❌ No branchId provided');
                setError('Branch ID is required');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. گرفتن session
                console.log('🔐 Getting session...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.error('❌ Session error:', sessionError);
                    throw sessionError;
                }
                
                if (!session) {
                    console.error('❌ No session found');
                    throw new Error('Please login to continue');
                }
                
                const token = session.access_token;
                console.log('✅ Session token available');

                // 2. فراخوانی API
                const apiUrl = `/api/branches/${branchId}/orders`;
                console.log('🌐 Calling API:', apiUrl);
                
                const ordersRes = await fetch(apiUrl, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-store'
                });

                console.log('📊 API Response status:', ordersRes.status);
                
                if (!ordersRes.ok) {
                    // خواندن پیام خطا
                    const errorText = await ordersRes.text();
                    console.error('❌ API Error response:', errorText);
                    
                    let errorMessage = `Failed to fetch orders (${ordersRes.status})`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                    
                    throw new Error(errorMessage);
                }

                const ordersData: Order[] = await ordersRes.json();
                console.log(`✅ Success! Received ${ordersData.length} orders`);

                // 3. پردازش داده‌ها
                const sortedOrders = [...ordersData].sort((a, b) => {
                    const dateA = new Date(a.created_at).getTime();
                    const dateB = new Date(b.created_at).getTime();
                    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
                });

                const filteredOrders = statusFilter === 'all'
                    ? sortedOrders
                    : sortedOrders.filter(order => order.status === statusFilter);

                // 4. ذخیره سفارشات
                setOrders(filteredOrders);

                // 5. لود آیتم‌ها در پس‌زمینه (اختیاری)
                console.log('🔄 Loading order items in background...');
                filteredOrders.forEach(async (order) => {
                    try {
                        const itemsRes = await fetch(`/api/order-items/${order.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (itemsRes.ok) {
                            const items = await itemsRes.json();
                            setOrders(prev => prev.map(o =>
                                o.id === order.id ? { ...o, items } : o
                            ));
                        }
                    } catch (err) {
                        console.warn(`⚠️ Failed to load items for order ${order.id}:`, err);
                    }
                });

            } catch (err: any) {
                console.error('❌ Error in fetchOrders:', err);
                setError(err.message || 'Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [branchId, statusFilter, sortBy, supabase]);

    // بقیه توابع و JSX مانند قبل...

    // برای تست سریع، ابتدا فقط داده‌های ساده نمایش دهید:
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-10 w-64 mb-4" />
                    <Skeleton className="h-6 w-48 mb-8" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="container mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // نمایش ساده برای تست
    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Orders for Branch {branchId}</h1>
                
                <div className="mb-4">
                    <p className="text-gray-600">
                        {orders.length} orders found
                    </p>
                </div>
                
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg border p-8 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-gray-600">No orders have been placed for this branch.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="bg-white rounded-lg border p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">Order #{order.order_number}</h3>
                                        <p className="text-gray-600 text-sm">{order.customer_name}</p>
                                        <p className="text-gray-600 text-sm">${order.final_amount}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// 🔥 کامپوننت صفحه اصلی
export default function BranchOrdersPage({
    params
}: {
    params: Promise<{ branch: string }>
}) {
    // استفاده از use برای استخراج params
    const resolvedParams = use(params);
    const branchId = resolvedParams.branch;
    
    console.log('📄 Page component - branchId:', branchId);

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 pt-24">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded w-full"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        }>
            <OrdersContent branchId={branchId} />
        </Suspense>
    );
}