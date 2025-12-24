// app/[branch]/cart/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // اضافه کنید
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '@/Contexts/CartContext';

export default function BranchCartPage() {
  const params = useParams(); // استفاده از useParams
  const branch = params.branch as string;
  
  const { state, dispatch } = useCart();
  const router = useRouter();

  // بررسی اینکه branch مقدار دارد
  if (!branch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Branch not found</h1>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 font-semibold text-white"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const branchCart = state.branchCarts[Number(branch)];
  const items = branchCart?.items || [];

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const removeFromCart = (itemId: number) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: { id: itemId, branchId: Number(branch) }
    });
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: itemId, branchId: Number(branch), quantity }
    });
  };

  const clearBranchCart = () => {
    if (confirm(`Clear all items from this branch?`)) {
      dispatch({
        type: "CLEAR_BRANCH",
        payload: { branchId: Number(branch) }
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push(`/${branch}/menu`)}
            className="mb-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            <FiArrowLeft /> Back to Menu
          </button>

          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiShoppingBag className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              {branch === "1" ? "Kabul" : "Herat"} Branch Cart is Empty
            </h2>
            <p className="mb-6 text-gray-500">Add delicious meals from this branch</p>
            <Link
              href={`/${branch}/menu`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              Browse {branch === "1" ? "Kabul" : "Herat"} Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push(`/${branch}/menu`)}
                className="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
              >
                <FiArrowLeft /> Back to Menu
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                {branch === "1" ? "Kabul" : "Herat"} Branch Cart
              </h1>
              <p className="mt-2 text-gray-600">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
              </p>
            </div>
            
            <button
              onClick={clearBranchCart}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <FiTrash2 /> Clear All
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  {item.imageUrl && (
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:text-red-600"
                        title="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <FiMinus />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <FiPlus />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
              
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  href={`/${branch}/menu`}
                  className="block w-full text-center rounded-xl border-2 border-emerald-500 bg-white px-6 py-3 font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  Add More Items
                </Link>
                
                <Link
                  href={`/${branch}/checkout`}
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Checkout - ${totalPrice.toFixed(2)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}