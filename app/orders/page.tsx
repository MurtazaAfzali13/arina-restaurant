'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  final_amount: number;
  customer_name: string;
  delivery_type: string;
  created_at: string;
  branch_id: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // در واقعیت اینجا باید از API سفارشات کاربر را بگیرید
        // برای تست از mock data استفاده می‌کنیم
        const mockOrders: Order[] = [
          {
            id: "3102a9e6-aa76-4f68-9c49-2852a5fc5e9b",
            order_number: "ORD-20241125-1234",
            status: "pending",
            total_amount: 45.00,
            final_amount: 49.05,
            customer_name: "jan",
            delivery_type: "pickup",
            created_at: "2025-11-25T12:00:00Z",
            branch_id: 2
          },
          {
            id: "4102a9e6-bb76-4f68-9c49-2852a5fc5e9c",
            order_number: "ORD-20241124-5678",
            status: "delivered",
            total_amount: 32.50,
            final_amount: 35.43,
            customer_name: "jan",
            delivery_type: "delivery",
            created_at: "2025-11-24T15:30:00Z",
            branch_id: 2
          }
        ];
        
        setOrders(mockOrders);
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'on_delivery': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mt-28 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-28 text-center">
        <div className="rounded-full bg-red-100 p-3 inline-block">
          <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Error Loading Orders</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 text-white font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">View your order history and track current orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="rounded-full bg-gray-100 p-3 inline-block">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No orders yet</h2>
          <p className="mt-2 text-gray-600">Start by placing your first order!</p>
          <Link
            href="/1/menu"
            className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.order_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(order.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> 
                      <span className="capitalize"> {order.delivery_type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Branch:</span> #{order.branch_id}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-900">
                      ${order.final_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    href={`/order-confirmation/${order.id}`}
                    className="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
                  >
                    View Details
                  </Link>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => alert('Cancel order functionality coming soon!')}
                      className="rounded-lg border border-red-600 px-4 py-2 text-red-600 font-medium hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress bar for order status */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Order Placed</span>
                  <span>Preparing</span>
                  <span>Ready</span>
                  <span>{order.delivery_type === 'delivery' ? 'Delivered' : 'Picked Up'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-600 w-full' :
                      order.status === 'ready' ? 'bg-purple-600 w-3/4' :
                      order.status === 'preparing' ? 'bg-orange-600 w-1/2' :
                      'bg-yellow-600 w-1/4'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}