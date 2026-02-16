// app/[branch]/orders/page.tsx
'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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
    ShoppingBag,
    Eye,
    Printer,
    Download,
    Search,
    MoreVertical
} from 'lucide-react';
import { useUser } from '@/modules/food/hooks/useAdmin';
import { SkeletonOrdersTable, SkeletonStatCard } from '@/app/dashboard/components/SkeletonCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { Order } from '@/modules/food/domain/food.types';
import { OrderItem } from '@/modules/food/domain/food.types';

// Status translations – dark navy theme (pending amber, completed/delivered green, cancelled red)
const statusTranslations: Record<string, { text: string; color: string; bgColor: string }> = {
    pending: { text: 'Pending Confirmation', color: 'text-amber-200', bgColor: 'bg-amber-900/50' },
    confirmed: { text: 'Confirmed', color: 'text-blue-200', bgColor: 'bg-blue-900/50' },
    preparing: { text: 'Preparing', color: 'text-violet-200', bgColor: 'bg-violet-900/50' },
    ready: { text: 'Ready for Pickup', color: 'text-orange-200', bgColor: 'bg-orange-900/50' },
    on_delivery: { text: 'Out for Delivery', color: 'text-cyan-200', bgColor: 'bg-cyan-900/50' },
    delivered: { text: 'Delivered', color: 'text-green-200', bgColor: 'bg-green-900/50' },
    completed: { text: 'Completed', color: 'text-green-200', bgColor: 'bg-green-900/50' },
    cancelled: { text: 'Cancelled', color: 'text-red-200', bgColor: 'bg-red-900/50' }
};

const paymentStatusTranslations: Record<string, { text: string; color: string; bgColor: string }> = {
    pending: { text: 'Payment Pending', color: 'text-amber-200', bgColor: 'bg-amber-900/50' },
    paid: { text: 'Paid', color: 'text-green-200', bgColor: 'bg-green-900/50' },
    failed: { text: 'Payment Failed', color: 'text-red-200', bgColor: 'bg-red-900/50' },
    refunded: { text: 'Refunded', color: 'text-slate-200', bgColor: 'bg-slate-700/50' }
};

const paymentMethodTranslations: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    online: 'Online'
};

const deliveryTypeTranslations: Record<string, string> = {
    delivery: 'Delivery',
    pickup: 'Pickup'
};

// Order items display – dark navy theme
function OrderItemsPanel({ items }: { items: OrderItem[] }) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-gray-300" />
                        <span className="font-medium text-gray-100">Order Items</span>
                        <Badge variant="secondary" className="mr-2 bg-gray-700 text-gray-200 border-gray-600">
                            {totalItems} items
                        </Badge>
                    </div>
                    <span className="font-bold text-emerald-400">
                        {totalAmount.toLocaleString('en-US')} USD
                    </span>
                </div>
            </div>
            <div className="divide-y divide-gray-700">
                {items.map((item) => (
                    <div key={item.id} className="px-4 py-3 transition-colors hover:bg-gray-700">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-100">{item.meal_name}</h4>
                                        {item.special_instructions && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                <span className="font-medium">Instructions:</span> {item.special_instructions}
                                            </p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="ml-2 border-gray-600 text-gray-300">
                                        {item.quantity} qty
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-left ml-4 min-w-[120px]">
                                <p className="text-sm text-gray-400">
                                    {parseFloat(item.meal_price).toLocaleString('en-US')} USD × {item.quantity}
                                </p>
                                <p className="font-bold text-emerald-400 mt-1">
                                    {parseFloat(item.subtotal).toLocaleString('en-US')} USD
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Customer information – dark navy theme
function CustomerInfoPanel({ order }: { order: Order }) {
    return (
        <div className="rounded-lg p-4 mb-4 border border-gray-700 bg-gray-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-100">
                <User className="h-5 w-5 text-gray-400" />
                Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm text-gray-400">Customer Name</p>
                            <p className="font-medium text-gray-100">{order.customer_name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm text-gray-400">Phone Number</p>
                            <p className="font-medium dir-ltr text-gray-100">{order.customer_phone}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm text-gray-400">Email</p>
                            <p className="font-medium text-sm text-gray-100">{order.customer_email}</p>
                        </div>
                    </div>
                    {order.delivery_address && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                            <div>
                                <p className="text-sm text-gray-400">Delivery Address</p>
                                <p className="font-medium text-sm text-gray-100">{order.delivery_address}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {order.customer_notes && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Customer Notes</p>
                    <p className="text-sm rounded p-3 border border-amber-900/50 bg-amber-900/20 text-amber-200">
                        {order.customer_notes}
                    </p>
                </div>
            )}
        </div>
    );
}

// Order summary – dark navy theme
function OrderSummaryPanel({ order }: { order: Order }) {
    return (
        <div className="rounded-lg p-4 border border-gray-700 bg-gray-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-100">
                <DollarSign className="h-5 w-5 text-gray-400" />
                Order Summary
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Order Amount</span>
                    <span className="font-medium text-gray-100">{parseFloat(order.total_amount).toLocaleString('en-US')} USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Tax</span>
                    <span className="font-medium text-gray-100">{parseFloat(order.tax_amount).toLocaleString('en-US')} USD</span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">Discount</span>
                        <span className="font-medium text-red-300">-{parseFloat(order.discount_amount).toLocaleString('en-US')} USD</span>
                    </div>
                )}
                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300 font-bold">Final Amount</span>
                    <span className="text-xl font-bold text-emerald-400">
                        {parseFloat(order.final_amount).toLocaleString('en-US')} USD
                    </span>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-100">{paymentMethodTranslations[order.payment_method] || order.payment_method}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Payment Status</p>
                        <Badge
                            className={paymentStatusTranslations[order.payment_status]?.bgColor + " " + paymentStatusTranslations[order.payment_status]?.color}
                        >
                            {paymentStatusTranslations[order.payment_status]?.text || order.payment_status}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main component logic
function OrdersContent({ branchId }: { branchId: string }) {
    const router = useRouter();
    const { profile, isBranchAdmin, loading: userLoading } = useUser();
    const supabase = createClientComponentClient();

    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Check branch admin access
    useEffect(() => {
        if (!userLoading && profile) {
            const userBranchId = Number(profile?.branch_id);
            const currentBranchId = Number(branchId);

            if (!isBranchAdmin || userBranchId !== currentBranchId) {
                console.warn('⚠️ Unauthorized access attempt');
                router.push('/unauthorized');
            }
        }
    }, [userLoading, isBranchAdmin, profile, branchId, router]);

    // Load orders
    const fetchOrders = async () => {
        if (!branchId) return;

        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('Please log in to your account');
            }

            const token = session.access_token;

            const ordersRes = await fetch(`/api/branches/${branchId}/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });

            if (!ordersRes.ok) {
                const errorText = await ordersRes.text();
                throw new Error(`Error fetching orders: ${ordersRes.status}`);
            }

            const ordersData: Order[] = await ordersRes.json();

            // Sort by date (newest first)
            const sortedOrders = ordersData.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setOrders(sortedOrders);
            setFilteredOrders(sortedOrders);

            // Load items for each order
            for (const order of sortedOrders) {
                try {
                    const itemsRes = await fetch(`/api/order-items/${order.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (itemsRes.ok) {
                        const items = await itemsRes.json();
                        setOrders(prev => prev.map(o =>
                            o.id === order.id ? { ...o, items } : o
                        ));
                        setFilteredOrders(prev => prev.map(o =>
                            o.id === order.id ? { ...o, items } : o
                        ));
                    }
                } catch (err) {
                    console.warn(`Error loading items for order ${order.id}:`, err);
                }
            }

        } catch (err: any) {
            console.error('❌ Error in fetchOrders:', err);
            setError(err.message || 'Error loading orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [branchId]);

    // Filter orders based on search and status
    useEffect(() => {
        let result = orders;

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(order => order.status === statusFilter);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(order =>
                order.order_number.toLowerCase().includes(query) ||
                order.customer_name.toLowerCase().includes(query) ||
                order.customer_phone.includes(query) ||
                order.customer_email.toLowerCase().includes(query)
            );
        }

        setFilteredOrders(result);
    }, [searchQuery, statusFilter, orders]);

    // Date format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Update order status
    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Update status in state
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
                setFilteredOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));

                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch (err) {
            console.error('Error updating order status:', err);
        }
    };

    // Show order details
    const showOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.final_amount), 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 pt-24 pb-8">
                <div className="container mx-auto px-4 space-y-6">

                    {/* Title skeleton */}
                    <div className="space-y-3">
                        <div className="h-10 w-64 rounded animate-pulse bg-gray-800" />
                        <div className="h-6 w-48 rounded animate-pulse bg-gray-800" />
                    </div>

                    {/* Stat cards skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <SkeletonStatCard key={i} />
                        ))}
                    </div>

                    {/* Orders table skeleton */}
                    <SkeletonOrdersTable rows={6} />

                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 pt-24 pb-8">
                <div className="container mx-auto px-4">
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-200 mb-2">Error</h2>
                        <p className="text-red-300 mb-4">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-red-800 text-red-200 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Page header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
                            <p className="text-gray-300">
                                Manage and track orders for branch {branchId}
                            </p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold mt-2 text-white">{stats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Pending Confirmation</p>
                                <p className="text-2xl font-bold mt-2 text-white">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">In Preparation</p>
                                <p className="text-2xl font-bold mt-2 text-white">{stats.preparing}</p>
                            </div>
                            <RefreshCw className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Revenue</p>
                                <p className="text-2xl font-bold mt-2 text-white">{stats.totalRevenue.toLocaleString('en-US')}</p>
                                <p className="text-xs text-gray-400 mt-1">USD</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Filters and search */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by order number, customer name, phone, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-10 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-100">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending Confirmation</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="preparing">In Preparation</SelectItem>
                                    <SelectItem value="ready">Ready for Pickup</SelectItem>
                                    <SelectItem value="on_delivery">Out for Delivery</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Orders table */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-900">
                                <TableRow className="border-gray-700 hover:bg-gray-800">
                                    <TableHead className="text-gray-300">Order Number</TableHead>
                                    <TableHead className="text-gray-300">Customer</TableHead>
                                    <TableHead className="text-gray-300">Order Date</TableHead>
                                    <TableHead className="text-gray-300">Total Amount</TableHead>
                                    <TableHead className="text-gray-300">Order Status</TableHead>
                                    <TableHead className="text-gray-300">Payment Status</TableHead>
                                    <TableHead className="text-gray-300">Delivery Type</TableHead>
                                    <TableHead className="text-gray-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow className="border-gray-700 hover:bg-gray-700">
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                                            No orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const statusInfo = statusTranslations[order.status];
                                        const paymentStatusInfo = paymentStatusTranslations[order.payment_status];

                                        return (
                                            <TableRow key={order.id} className="border-gray-700 hover:bg-gray-700">
                                                <TableCell>
                                                    <div className="font-medium text-gray-100">{order.order_number}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-100">{order.customer_name}</div>
                                                        <div className="text-sm text-gray-400">{order.customer_phone}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-300">
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-emerald-400">
                                                        {parseFloat(order.final_amount).toLocaleString('en-US')} USD
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${statusInfo.bgColor} ${statusInfo.color}`}
                                                    >
                                                        {statusInfo.text}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${paymentStatusInfo.bgColor} ${paymentStatusInfo.color}`}
                                                    >
                                                        {paymentStatusInfo.text}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-300">
                                                        {deliveryTypeTranslations[order.delivery_type] || order.delivery_type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => showOrderDetails(order)}
                                                            className="text-gray-300 hover:text-white hover:bg-gray-600"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-600">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-100">
                                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-gray-700" />
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'confirmed')} className="hover:bg-gray-700">
                                                                    Confirm Order
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')} className="hover:bg-gray-700">
                                                                    Start Preparation
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'ready')} className="hover:bg-gray-700">
                                                                    Mark as Ready
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')} className="hover:bg-gray-700">
                                                                    Mark as Delivered
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-gray-700" />
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')} className="hover:bg-gray-700">
                                                                    Cancel Order
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-400">
                    Showing {filteredOrders.length} orders of {orders.length} orders
                </div>
            </div>

            {/* Order details modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
                        {/* Modal header */}
                        <div className="border-b border-gray-700 px-6 py-4 bg-gray-900">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Order Details #{selectedOrder.order_number}</h3>
                                    <p className="text-gray-300 text-sm mt-1">
                                        {formatDate(selectedOrder.created_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-200"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-800">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left column - Customer and order info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <CustomerInfoPanel order={selectedOrder} />

                                    {/* Order items */}
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        <OrderItemsPanel items={selectedOrder.items} />
                                    ) : (
                                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
                                            <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                            <p className="text-gray-300">Order items information is not available</p>
                                        </div>
                                    )}

                                    {/* Admin notes */}
                                    {selectedOrder.admin_notes && (
                                        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
                                            <h4 className="font-bold text-blue-200 mb-2">Admin Notes</h4>
                                            <p className="text-blue-300">{selectedOrder.admin_notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right column - Summary and actions */}
                                <div className="space-y-6">
                                    <OrderSummaryPanel order={selectedOrder} />

                                    {/* Status change */}
                                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                        <h4 className="font-bold text-lg mb-4 text-white">Change Order Status</h4>
                                        <div className="space-y-2">
                                            {Object.entries(statusTranslations).map(([key, value]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => updateOrderStatus(selectedOrder.id, key as Order['status'])}
                                                    className={`w-full text-right p-3 rounded-lg border ${selectedOrder.status === key 
                                                        ? 'border-blue-700 bg-blue-900/30' 
                                                        : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={selectedOrder.status === key ? 'text-blue-200' : 'text-gray-200'}>
                                                            {value.text}
                                                        </span>
                                                        {selectedOrder.status === key && (
                                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                        <h4 className="font-bold text-lg mb-4 text-white">Actions</h4>
                                        <div className="space-y-3">
                                            <button className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-700 text-gray-200">
                                                <Printer className="h-4 w-4" />
                                                Print Invoice
                                            </button>
                                            <button className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-700 text-gray-200">
                                                <Download className="h-4 w-4" />
                                                Download Report
                                            </button>
                                        </div>
                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main page component
export default function BranchOrdersPage({
    params
}: {
    params: Promise<{ branch: string }>
}) {
    const resolvedParams = use(params);
    const branchId = resolvedParams.branch;

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 pt-24">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-800 rounded w-64 mb-4"></div>
                        <div className="h-6 bg-gray-800 rounded w-48 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-800 rounded w-full"></div>
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