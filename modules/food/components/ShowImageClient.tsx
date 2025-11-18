'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Food as Meal } from "@/modules/food/domain/food.types";

type ShowImageClientProps = {
  item: Meal;
};

export default function ShowImageClient({ item }: ShowImageClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex flex-col items-center mt-6">
      {/* تصویر غذا */}
      <button 
        onClick={openModal}
        className="focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-2xl transition-all hover:scale-105"
        aria-label={`View larger image of ${item.name}`}
      >
        <Image
          src={item.image_url || "/images/meals/1.jpg"}
          alt={item.name}
          width={400}
          height={280}
          className="rounded-2xl shadow-xl cursor-pointer object-cover transition-transform duration-300"
          quality={85}
          priority
        />
      </button>

      {/* نام غذا */}
      <p className="text-lg mt-4 text-gray-800 dark:text-gray-100 font-semibold text-center max-w-md px-4">
        {item.name}
      </p>

      {/* توضیحات کوتاه */}
      {item.description && (
        <p className="text-gray-600 mt-2 text-center max-w-lg px-4">
          {item.description}
        </p>
      )}

      {/* Modal برای نمایش تصویر بزرگ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-3xl w-full rounded-xl overflow-hidden bg-white">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 text-2xl font-bold hover:text-gray-800"
              aria-label="Close image modal"
            >
              ✕
            </button>
            <Image
              src={item.image_url || "/images/meals/1.jpg"}
              alt={item.name}
              width={800}
              height={560}
              className="object-cover w-full h-auto"
              quality={90}
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
