// DishCard.tsx - نسخه اصلاح شده
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useCart } from '@/Contexts/CartContext';
import { Food } from '../domain/food.types';

interface DishCardProps {
  dish: Food;
  branchSlug?: string;
}

export function DishCard({ dish, branchSlug }: DishCardProps) {
  const { dispatch, state } = useCart();

  // پیدا کردن تعداد موجود در سبد این شعبه
  const existingQuantity = useMemo(() => {
    if (!branchSlug) return 0;
    const branchId = Number(branchSlug);
    const branchCart = state.branchCarts[branchId];
    if (!branchCart) return 0;
    
    const item = branchCart.items.find(item => item.id === dish.id);
    return item?.quantity ?? 0;
  }, [branchSlug, dish.id, state.branchCarts]);

  const addToCart = () => {
    if (!branchSlug) return;

    const branchId = Number(branchSlug);
    
    // ایجاد payload با branchId مشخص
    const cartPayload = {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      branchId: branchId,
      imageUrl: dish.image_url,
    };

    dispatch({ type: "ADD_ITEM", payload: cartPayload });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-gray-800 shadow-md transition-shadow duration-300 hover:shadow-xl">
      <Link href={`/${branchSlug}/menu/${dish.slug}`}>
        <Image
          src={dish.image_url || "/images/meals/1.jpg"}
          alt={dish.name}
          width={400}
          height={224}
          className="h-56 w-full object-cover"
        />
      </Link>

      <div className="flex flex-grow flex-col p-4">
        <h3 className="text-lg font-bold text-gray-100">{dish.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-100">
          {dish.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-lg font-semibold text-green-200">${dish.price}</p>
          <button
            onClick={addToCart}
            className="rounded-full bg-green-500 px-4 py-2 test-sm font-medium font-bold text-white shadow hover:bg-green-700 cursor-pointer transition"
          >
            {existingQuantity > 0 ? `Add more (${existingQuantity})` : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}