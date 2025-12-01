'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/Contexts/CartContext';

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  payment_method: 'cash' | 'card' | 'online';
  delivery_type: 'pickup' | 'delivery';
  special_instructions?: string;
};

export default function CheckoutPage() {
  const { state, totalPrice, dispatch } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    payment_method: 'cash',
    delivery_type: 'pickup',
    special_instructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // قبل از handleSubmit اضافه کنید
console.log('Form data:', form);
console.log('Form validation:', {
  name: !!form.name.trim(),
  phone: !!form.phone.trim(), 
  email: !!form.email.trim(),
  address: form.delivery_type === 'delivery' ? !!form.address.trim() : 'not required'
});

    try {
      const branchId = state.items[0]?.branchId;
      if (!branchId) throw new Error('No items in cart');

      // اعتبارسنجی فرم
      if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
        throw new Error('Please fill in all required fields');
      }

      if (form.delivery_type === 'delivery' && !form.address.trim()) {
        throw new Error('Delivery address is required for delivery orders');
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch_id: branchId,
          items: state.items.map(item => ({
            meal_id: item.id,
            meal_name: item.name,
            meal_price: item.price,
            quantity: item.quantity,
            special_instructions: form.special_instructions
          })),
          customer_info: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.delivery_type === 'delivery' ? form.address : undefined
          },
          payment_method: form.payment_method,
          delivery_type: form.delivery_type
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      // پاک کردن سبد خرید
      state.items.forEach(item => {
        dispatch({
          type: 'REMOVE_ITEM',
          payload: { id: item.id, branchId: item.branchId }
        });
      });

      router.push(`/order-confirmation/${result.order_id}`);

    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  if (state.items.length === 0) {
    return (
      <div className="mt-28 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <button 
          onClick={() => router.push('/1/menu')}
          className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-white"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات مشتری */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-semibold">Customer Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter your email address"
              />
            </div>
          </div>
        </div>

        {/* نوع تحویل */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-semibold">Delivery Method</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery_type"
                value="pickup"
                checked={form.delivery_type === 'pickup'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Pickup
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery_type"
                value="delivery"
                checked={form.delivery_type === 'delivery'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Delivery
            </label>
          </div>

          {form.delivery_type === 'delivery' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Delivery Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleInputChange}
                required={form.delivery_type === 'delivery'}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter your full address for delivery..."
              />
            </div>
          )}
        </div>

        {/* روش پرداخت */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="flex items-center rounded-lg border p-3 hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                name="payment_method"
                value="cash"
                checked={form.payment_method === 'cash'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Cash
            </label>
            <label className="flex items-center rounded-lg border p-3 hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                name="payment_method"
                value="card"
                checked={form.payment_method === 'card'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Credit Card
            </label>
            <label className="flex items-center rounded-lg border p-3 hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                name="payment_method"
                value="online"
                checked={form.payment_method === 'online'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Online
            </label>
          </div>
        </div>

        {/* یادداشت‌ها */}
        <div className="rounded-lg bg-gray-50 p-4">
          <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
          <textarea
            name="special_instructions"
            value={form.special_instructions}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Any special requests or instructions..."
          />
        </div>

        {/* خلاصه سفارش */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="space-y-2">
            {state.items.map((item) => (
              <div key={`${item.id}-${item.branchId}`} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* دکمه ثبت */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}