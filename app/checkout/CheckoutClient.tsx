'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useCart, type CartItem } from '@/Contexts/CartContext';
import { calcTaxAndTotalFromCents, toCents } from '@/lib/pricing';

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  payment_method: 'cash' | 'card' | 'online';
  delivery_type: 'pickup' | 'delivery';
  special_instructions?: string;
};

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchIdParam = searchParams.get('branch');

  const { state, clearAll } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrders, setSuccessOrders] = useState<string[]>([]);
  const isSubmittingRef = useRef(false);

  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    payment_method: 'cash',
    delivery_type: 'pickup',
    special_instructions: ''
  });

  // ✅ انتخاب سبدها
  type BranchEntry = [string, { items: CartItem[]; branchName?: string; lastUpdated?: string }];
  const branchEntries = (branchIdParam
    ? Object.entries(state.branchCarts).filter(
        ([id]) => Number(id) === Number(branchIdParam)
      )
    : Object.entries(state.branchCarts)) as BranchEntry[];

  // 🔄 اگر branch مشخص است ولی سبدش خالی است
  useEffect(() => {
    if (branchIdParam && branchEntries.length === 0) {
      router.push(`/${branchIdParam}/menu`);
    }
  }, [branchIdParam, branchEntries, router]);

  // 💰 totals (precision-safe via cents)
  const itemsSubtotalCents = branchEntries.reduce((sum, [, branch]) => {
    return (
      sum +
      branch.items.reduce(
        (s: number, item: CartItem) => s + toCents(item.price) * item.quantity,
        0
      )
    );
  }, 0);

  const deliveryFeeTotal = form.delivery_type === 'delivery' ? 5 * branchEntries.length : 0;
  const deliveryFeeTotalCents = toCents(deliveryFeeTotal);

  const totals = calcTaxAndTotalFromCents({
    subtotalCents: itemsSubtotalCents,
    deliveryFeeCents: deliveryFeeTotalCents,
  });

  const finalTotal = totals.finalAmount;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccessOrders([]);

    try {
      if (!form.name || !form.phone || !form.email) {
        throw new Error('لطفاً همه فیلدهای ضروری را پر کنید');
      }

      if (form.delivery_type === 'delivery' && !form.address) {
        throw new Error('آدرس برای ارسال الزامی است');
      }

      const orderResults: string[] = [];

      for (const [branchId, branch] of branchEntries) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch_id: Number(branchId),
            items: branch.items.map((item) => ({
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
              address:
                form.delivery_type === 'delivery' ? form.address : undefined
            },
            payment_method: form.payment_method,
            delivery_type: form.delivery_type,
            delivery_fee: deliveryFeeTotal / Math.max(1, branchEntries.length)
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'ثبت سفارش ناموفق بود');
        }

        orderResults.push(data.order_id);
        setSuccessOrders(prev => [...prev, data.order_number]);
      }

      clearAll();
      router.push(`/order-confirmation/${orderResults[0]}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (branchEntries.length === 0) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-600">سبد خرید شما خالی است</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-3">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-2xl bg-gray-900 p-6 shadow-lg border border-gray-700 space-y-6 text-white"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {successOrders.length > 0 && (
            <div className="rounded-lg bg-green-50 p-4 text-green-700 flex items-center gap-2">
              <CheckCircle size={20} />
              سفارش با موفقیت ثبت شد
            </div>
          )}

          {/* فرم ورودی‌ها همان کد قبلی */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 p-4 text-lg font-semibold text-white"
          >
            {loading
              ? 'در حال پردازش...'
              : `ثبت سفارش - $${finalTotal.toFixed(2)}`}
          </button>
        </form>

        {/* SUMMARY */}
        <div className="sticky top-24 rounded-2xl bg-gray-900 p-6 shadow-lg border border-gray-700 text-white">
          <h2 className="mb-4 text-xl font-semibold">خلاصه سفارش</h2>

          {branchEntries.map(([branchId, branch]) => (
            <div key={branchId} className="mb-4 border border-gray-600 rounded-lg p-4 bg-gray-900">
              <h3 className="font-medium mb-2">
                {branch.branchName || `Branch ${branchId}`}
              </h3>
              {branch.items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${((toCents(item.price) * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="border-t border-gray-600 pt-4 flex justify-between text-lg font-bold">
            <span>جمع کل</span>
            <span className="text-emerald-600">
              ${finalTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
