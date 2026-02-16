'use client';

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMeal } from "@/modules/food/hooks/useMeals";
import { useCart } from "@/Contexts/CartContext";

export default function MealDetailPage() {
  const params = useParams();
  const router = useRouter();

  const branch = params?.branch as string;
  const slug = params?.slug as string;

  const { meal, loading, error } = useMeal(branch, slug);
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    if (!meal) return;

    const confirmed = window.confirm(`Add "${meal.name}" to your cart?`);
    if (!confirmed) return;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: meal.id,
        name: meal.name,
        price: meal.price,
        quantity: 1,
        branchId: Number(branch),
        imageUrl: meal.image_url
      },
    });

    alert(`"${meal.name}" added to cart!`);
  };

  if (loading)
    return <p className="text-center text-gray-100">Loading…</p>;

  if (error || !meal)
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error || "Meal not found"}</p>
        <Link href={`/${branch}/menu`} className="text-blue-500 underline">
          Back to menu
        </Link>
      </div>
    );

  return (
    <section className="w-full bg-gray-900">
      <div className="max-w-4xl mx-auto p-20 bg-gray-700 rounded-2xl shadow">

        <Link
          href={`/${branch}/menu`}
          className="text-blue-600 underline mb-4 inline-block cursor-pointer"
        >
          ← Back to menu
        </Link>

        <h1 className="text-3xl font-bold mb-4 text-white">{meal.name}</h1>

        {/* عکس با لینک modal */}
        <button
          onClick={() => router.push(`/${branch}/menu/${slug}/image`, { scroll: false })}
          className="w-full h-80 overflow-hidden rounded-xl shadow focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-transform hover:scale-105"
        >
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </button>

        <p className="mt-4 text-white text-lg">{meal.description}</p>

        <p className="mt-4 text-yellow-500 font-bold text-2xl">
          ${meal.price}
        </p>

        <button
          onClick={handleAddToCart}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Add to Cart
        </button>

      </div>
    </section>
  );
}
