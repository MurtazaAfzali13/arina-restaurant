'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  final_amount: number;
  customer_name: string;
  estimated_delivery: string;
  delivery_type: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  meal_name: string;
  meal_price: number;
  quantity: number;
  subtotal: number;
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // دریافت اطلاعات سفارش
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        if (!orderResponse.ok) {
          throw new Error('Failed to fetch order');
        }
        const orderData = await orderResponse.json();
        setOrder(orderData);

        // دریافت آیتم‌های سفارش
        const itemsResponse = await fetch(`/api/orders/${orderId}/items`);
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          setOrderItems(itemsData);
        }

      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="mt-28 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mt-28 text-center">
        <div className="rounded-full bg-red-100 p-3 inline-block">
          <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Not Found</h1>
        <p className="mt-2 text-gray-600">{error || 'The order you are looking for does not exist.'}</p>
        <Link 
          href="/1/menu" 
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white font-semibold"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="text-center mb-8">
        <div className="rounded-full bg-green-100 p-3 inline-block">
          <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-gray-600">Thank you for your order, {order.customer_name}!</p>
        <p className="text-gray-600">Your order has been received and is being processed.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* جزئیات سفارش */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-semibold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold capitalize bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-semibold">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Type:</span>
              <span className="font-semibold capitalize">{order.delivery_type}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total Amount:</span>
              <span>${order.final_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* آیتم‌های سفارش */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.meal_name}</p>
                  <p className="text-sm text-gray-600">
                    ${item.meal_price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Subtotal:</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax:</span>
              <span>${(order.final_amount - order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-6">
          You will receive an email confirmation shortly. 
          {order.delivery_type === 'delivery' && ' Your food will be delivered within 30-45 minutes.'}
          {order.delivery_type === 'pickup' && ' Your order will be ready for pickup in 20-30 minutes.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="rounded-lg bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/1/menu"
            className="rounded-lg border border-emerald-600 px-6 py-3 text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors"
          >
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
}