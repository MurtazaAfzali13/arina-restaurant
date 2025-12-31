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
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/modules/food/hooks/useAdmin';
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



// Status translations in English
const statusTranslations: Record<string, { text: string; color: string; bgColor: string }> = {
    pending: { text: 'Pending Confirmation', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    confirmed: { text: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    preparing: { text: 'Preparing', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    ready: { text: 'Ready for Pickup', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    on_delivery: { text: 'Out for Delivery', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
    delivered: { text: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
    cancelled: { text: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' }
};

const paymentStatusTranslations: Record<string, { text: string; color: string; bgColor: string }> = {
    pending: { text: 'Payment Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    paid: { text: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
    failed: { text: 'Payment Failed', color: 'text-red-700', bgColor: 'bg-red-100' },
    refunded: { text: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' }
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

// Order items display component
function OrderItemsPanel({ items }: { items: OrderItem[] }) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return (
        <div className="mt-4 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="font-medium">Order Items</span>
                        <Badge variant="secondary" className="mr-2">
                            {totalItems} items
                        </Badge>
                    </div>
                    <span className="font-bold text-emerald-600">
                        {totalAmount.toLocaleString('en-US')} USD
                    </span>
                </div>
            </div>
            
            <div className="divide-y">
                {items.map((item) => (
                    <div key={item.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{item.meal_name}</h4>
                                        {item.special_instructions && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Instructions:</span> {item.special_instructions}
                                            </p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                        {item.quantity} qty
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-left ml-4 min-w-[120px]">
                                <p className="text-sm text-gray-600">
                                    {parseFloat(item.meal_price).toLocaleString('en-US')} USD × {item.quantity}
                                </p>
                                <p className="font-bold text-emerald-600 mt-1">
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

// Customer information component
function CustomerInfoPanel({ order }: { order: Order }) {
    return (
        <div className="bg-white border rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500">Customer Name</p>
                            <p className="font-medium">{order.customer_name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium dir-ltr">{order.customer_phone}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-sm">{order.customer_email}</p>
                        </div>
                    </div>
                    {order.delivery_address && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p className="font-medium text-sm">{order.delivery_address}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {order.customer_notes && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Customer Notes</p>
                    <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3">
                        {order.customer_notes}
                    </p>
                </div>
            )}
        </div>
    );
}

// Order summary component
function OrderSummaryPanel({ order }: { order: Order }) {
    return (
        <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Order Summary
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Order Amount</span>
                    <span className="font-medium">{parseFloat(order.total_amount).toLocaleString('en-US')} USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{parseFloat(order.tax_amount).toLocaleString('en-US')} USD</span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-red-600">-{parseFloat(order.discount_amount).toLocaleString('en-US')} USD</span>
                    </div>
                )}
                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-bold">Final Amount</span>
                    <span className="text-xl font-bold text-emerald-600">
                        {parseFloat(order.final_amount).toLocaleString('en-US')} USD
                    </span>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                        <p className="font-medium">{paymentMethodTranslations[order.payment_method] || order.payment_method}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Payment Status</p>
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
            <div className="min-h-screen bg-gray-50 pt-24 pb-8">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-10 w-64 mb-4" />
                    <Skeleton className="h-6 w-48 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-8">
                <div className="container mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                {/* Page header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
                            <p className="text-gray-600">
                                Manage and track orders for branch {branchId}
                            </p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold mt-2">{stats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Confirmation</p>
                                <p className="text-2xl font-bold mt-2">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">In Preparation</p>
                                <p className="text-2xl font-bold mt-2">{stats.preparing}</p>
                            </div>
                            <RefreshCw className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold mt-2">{stats.totalRevenue.toLocaleString('en-US')}</p>
                                <p className="text-xs text-gray-500 mt-1">USD</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Filters and search */}
                <div className="bg-white border rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by order number, customer name, phone, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
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
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order Number</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Order Status</TableHead>
                                    <TableHead>Payment Status</TableHead>
                                    <TableHead>Delivery Type</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            No orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const statusInfo = statusTranslations[order.status];
                                        const paymentStatusInfo = paymentStatusTranslations[order.payment_status];
                                        
                                        return (
                                            <TableRow key={order.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="font-medium">{order.order_number}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{order.customer_name}</div>
                                                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-emerald-600">
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
                                                    <div className="text-sm">
                                                        {deliveryTypeTranslations[order.delivery_type] || order.delivery_type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => showOrderDetails(order)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                                                                    Confirm Order
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                                                    Start Preparation
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'ready')}>
                                                                    Mark as Ready
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                                                    Mark as Delivered
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')}>
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
                <div className="mt-4 text-sm text-gray-500">
                    Showing {filteredOrders.length} orders of {orders.length} orders
                </div>
            </div>

            {/* Order details modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal header */}
                        <div className="border-b px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">Order Details #{selectedOrder.order_number}</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {formatDate(selectedOrder.created_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left column - Customer and order info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <CustomerInfoPanel order={selectedOrder} />
                                    
                                    {/* Order items */}
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        <OrderItemsPanel items={selectedOrder.items} />
                                    ) : (
                                        <div className="bg-gray-50 border rounded-lg p-8 text-center">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">Order items information is not available</p>
                                        </div>
                                    )}

                                    {/* Admin notes */}
                                    {selectedOrder.admin_notes && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-bold text-blue-800 mb-2">Admin Notes</h4>
                                            <p className="text-blue-700">{selectedOrder.admin_notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right column - Summary and actions */}
                                <div className="space-y-6">
                                    <OrderSummaryPanel order={selectedOrder} />
                                    
                                    {/* Status change */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-bold text-lg mb-4">Change Order Status</h4>
                                        <div className="space-y-2">
                                            {Object.entries(statusTranslations).map(([key, value]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => updateOrderStatus(selectedOrder.id, key as Order['status'])}
                                                    className={`w-full text-right p-3 rounded-lg border ${selectedOrder.status === key ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{value.text}</span>
                                                        {selectedOrder.status === key && (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                        <h4 className="font-bold text-lg mb-4">Actions</h4>
                                        <div className="space-y-3">
                                            <button className="w-full flex items-center justify-center gap-2 bg-white border rounded-lg p-3 hover:bg-gray-50">
                                                <Printer className="h-4 w-4" />
                                                Print Invoice
                                            </button>
                                            <button className="w-full flex items-center justify-center gap-2 bg-white border rounded-lg p-3 hover:bg-gray-50">
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