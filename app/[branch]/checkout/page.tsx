// app/[branch]/checkout/page.tsx
// lastupdate: 2024-12-24
'use client';

import { use } from 'react'; // اضافه کنید
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FiCheckCircle, 
  FiArrowLeft, 
  FiShoppingBag, 
  FiCreditCard, 
  FiTruck, 
  FiMapPin, 
  FiUser 
} from 'react-icons/fi';
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

export default function BranchCheckoutPage({ 
  params 
}: { 
  params: Promise<{ branch: string }> 
}) {
  const { branch } = use(params); // استفاده از use
  const router = useRouter();
  const { state, dispatch } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    order_number: string;
    order_id: string;
  } | null>(null);

  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    payment_method: 'cash',
    delivery_type: 'pickup',
    special_instructions: ''
  });

  // بررسی اینکه branchId مقدار دارد
  if (!branch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Branch not found</h1>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 font-semibold text-white"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const branchName = branch === "1" ? "Kabul" : branch === "2" ? "Herat" : `Branch ${branch}`;
  const branchCart = state.branchCarts[Number(branch)];
  const items = branchCart?.items || [];
  
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = form.delivery_type === 'delivery' ? 5 : 0;
  const finalTotal = totalPrice + deliveryFee;

  // اگر سبد این شعبه خالی باشد، برگرد به منو
  useEffect(() => {
    if (items.length === 0 && !successOrder) {
      router.push(`/${branch}/menu`);
    }
  }, [items, branch, router, successOrder]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // اعتبارسنجی
      if (!form.name.trim()) throw new Error('Name is required');
      if (!form.phone.trim()) throw new Error('Phone number is required');
      if (!form.email.trim()) throw new Error('Email is required');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (form.delivery_type === 'delivery' && !form.address.trim()) {
        throw new Error('Delivery address is required');
      }

      // ارسال سفارش
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: Number(branch),
          branch_name: branchName,
          items: items.map(item => ({
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
            address: form.delivery_type === 'delivery' ? form.address : null
          },
          payment_method: form.payment_method,
          delivery_type: form.delivery_type,
          delivery_fee: deliveryFee,
          total_amount: finalTotal,
          order_date: new Date().toISOString()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      // موفقیت
      setSuccessOrder({
        order_number: data.order_number,
        order_id: data.order_id
      });
      
      // پاک کردن سبد این شعبه
      dispatch({
        type: "CLEAR_BRANCH",
        payload: { branchId: Number(branch) }
      });

      setTimeout(() => {
        router.push(`/order-confirmation/${data.order_id}?branch=${branch}`);
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !successOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24">
        <div className="container mx-auto px-4 text-center">
          <FiShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Please add items to your cart first</p>
          <button
            onClick={() => router.push(`/${branch}/menu`)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 font-semibold text-white hover:shadow-lg transition-shadow"
          >
            <FiArrowLeft /> Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${branch}/cart`)}
            className="mb-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FiArrowLeft /> Back to Cart
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">
            {branchName} Branch Checkout
          </h1>
          <p className="mt-2 text-gray-600">
            Complete your order from {branchName} branch
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Error</span>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {successOrder && (
          <div className="mb-6 rounded-lg bg-green-50 p-6 text-green-700 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold">Order Placed Successfully!</h3>
            </div>
            <p className="mb-2">
              <span className="font-semibold">Order Number:</span> #{successOrder.order_number}
            </p>
            <p className="text-sm text-green-600">
              You will be redirected to order confirmation page in a few seconds...
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* فرم سفارش */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* بخش اطلاعات مشتری */}
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiUser className="text-emerald-500" /> Customer Information
                </h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      disabled={loading || successOrder !== null}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      required
                      disabled={loading || successOrder !== null}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading || successOrder !== null}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              {/* بخش نوع تحویل */}
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiTruck className="text-emerald-500" /> Delivery Method
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    form.delivery_type === 'pickup' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${(loading || successOrder) ? 'cursor-not-allowed opacity-70' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FiShoppingBag className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-sm text-gray-500">Collect from branch</div>
                        <div className="text-xs text-emerald-600 mt-1">No delivery fee</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="delivery_type"
                      value="pickup"
                      checked={form.delivery_type === 'pickup'}
                      onChange={handleInputChange}
                      disabled={loading || successOrder !== null}
                      className="h-5 w-5 text-emerald-500 disabled:cursor-not-allowed"
                    />
                  </label>
                  
                  <label className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    form.delivery_type === 'delivery' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${(loading || successOrder) ? 'cursor-not-allowed opacity-70' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiTruck className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Delivery</div>
                        <div className="text-sm text-gray-500">Deliver to your address</div>
                        <div className="text-xs text-blue-600 mt-1">+ $5.00 delivery fee</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="delivery_type"
                      value="delivery"
                      checked={form.delivery_type === 'delivery'}
                      onChange={handleInputChange}
                      disabled={loading || successOrder !== null}
                      className="h-5 w-5 text-emerald-500 disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                {form.delivery_type === 'delivery' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      required
                      disabled={loading || successOrder !== null}
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your complete delivery address..."
                    />
                  </div>
                )}
              </div>

              {/* بخش روش پرداخت */}
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiCreditCard className="text-emerald-500" /> Payment Method
                </h2>
                
                <div className="grid gap-3">
                  {(['cash', 'card', 'online'] as const).map(method => (
                    <label 
                      key={method} 
                      className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        form.payment_method === method 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${(loading || successOrder) ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          method === 'cash' ? 'bg-green-100' :
                          method === 'card' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          <FiCreditCard className={`${
                            method === 'cash' ? 'text-green-600' :
                            method === 'card' ? 'text-blue-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <span className="font-medium capitalize">{method}</span>
                          {method === 'cash' && (
                            <div className="text-xs text-gray-500">Pay when receiving</div>
                          )}
                          {method === 'card' && (
                            <div className="text-xs text-gray-500">Credit/Debit Card</div>
                          )}
                          {method === 'online' && (
                            <div className="text-xs text-gray-500">Online payment</div>
                          )}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment_method"
                        value={method}
                        checked={form.payment_method === method}
                        onChange={handleInputChange}
                        disabled={loading || successOrder !== null}
                        className="h-5 w-5 text-emerald-500 disabled:cursor-not-allowed"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* بخش یادداشت‌ها */}
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="special_instructions"
                  value={form.special_instructions}
                  onChange={handleInputChange}
                  disabled={loading || successOrder !== null}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 p-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Any special requests or instructions for your order..."
                />
              </div>

              {/* دکمه نهایی */}
              <button
                type="submit"
                disabled={loading || successOrder !== null}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 p-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Order...
                  </span>
                ) : successOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiCheckCircle /> Order Placed Successfully!
                  </span>
                ) : (
                  `Place Order - $${finalTotal.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* خلاصه سفارش */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              {/* اطلاعات شعبه */}
              <div className="mb-4 p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{branchName} Branch</h3>
                    <p className="text-sm text-gray-600">Order from {branchName}</p>
                  </div>
                </div>
              </div>
              
              {/* آیتم‌های سفارش */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    {item.imageUrl && (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-semibold text-emerald-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* جمع کل */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                
                {form.delivery_type === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">$5.00</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* نکات */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-2">Important Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Orders are processed within 30 minutes</li>
                  <li>• {form.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'} time: 45-60 minutes</li>
                  <li>• For any changes, contact {branchName} branch</li>
                  <li>• You will receive order confirmation via email</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}