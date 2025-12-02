'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import type { CartItem } from '@/Contexts/CartContext';
import { useCart } from '@/Contexts/CartContext';

function CartDishCard({ item }: { item: CartItem }) {
  const { dispatch } = useCart();
  

  const removeFromCart = () => {
    const confirmed = window.confirm(
      `Do you want to remove "${item.name}" from your cart?`
    );
    if (!confirmed) return;

    dispatch({
      type: "REMOVE_ITEM",
      payload: { id: item.id, branchId: item.branchId },
    });
  };

  const adjustQuantity = (delta: number) => {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity <= 0) {
      removeFromCart();
      return;
    }

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        id: item.id,
        branchId: item.branchId,
        quantity: nextQuantity,
      },
    });
  };

  return (
    <div className="mb-4 flex items-center gap-4 rounded-2xl bg-gray-100 p-4 shadow-md">
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-lg object-cover"
        />
      )}
      <div className="flex flex-grow flex-col">
        <h3 className="font-bold text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-500">Branch #{item.branchId}</p>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <button
            className="rounded-full bg-green-600 text-black cursor-pointer px-3 py-1 shadow"
            onClick={() => adjustQuantity(-1)}
          >
            -
          </button>
          <span className="font-semibold text-gray-700">
            Qty: {item.quantity}
          </span>
          <button
            className="rounded-full bg-green-600 text-black cursor-pointer px-3 py-1 shadow"
            onClick={() => adjustQuantity(1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={removeFromCart}
        className="rounded-lg bg-red-500 px-3 py-1 text-white transition-colors hover:bg-red-600"
      >
        Remove
      </button>
    </div>
  );
}

export default function CartPage() {
  const { state, totalPrice } = useCart();
  const router=useRouter();
  if (state.items.length === 0) {
    return (
      <div className="mt-28 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link
          href="/1/menu"
          className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      {state.items.map((item) => (
        <CartDishCard key={`${item.id}-${item.branchId}`} item={item} />
      ))}
      <div className="mt-6 flex flex-col items-end gap-3 text-right">
        <p className="text-xl font-semibold">
          Total: ${totalPrice.toFixed(2)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/1/menu"
            className="rounded-xl border border-emerald-600 px-6 py-3 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Add more meals
          </Link>
         
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
            onClick={() => router.push('/cart/checkout')} // تغییر این خط
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
