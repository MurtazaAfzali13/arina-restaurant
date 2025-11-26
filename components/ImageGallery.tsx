"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Meal = {
  id: number;
  title: string;
  image: string;
};

export default function ImageGallery() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // داده تستی
  useEffect(() => {
    const sampleMeals: Meal[] = [
      { id: 1, title: "Meal 1", image: "/images/gallery/gallery-1.jpg" },
      { id: 2, title: "Meal 2", image: "/images/gallery/gallery-2.jpg" },
      { id: 3, title: "Meal 3", image: "/images/gallery/gallery-3.jpg" },
      { id: 4, title: "Meal 4", image: "/images/gallery/gallery-4.jpg" },
      { id: 5, title: "Meal 5", image: "/images/gallery/gallery-5.jpg" },
      { id: 5, title: "Meal 5", image: "/images/gallery/gallery-6.jpg" },
      { id: 5, title: "Meal 5", image: "/images/gallery/gallery-7.jpg" },
      { id: 5, title: "Meal 5", image: "/images/gallery/gallery-8.jpg" },
    ];
    setMeals(sampleMeals);
  }, []);

  // Auto Slide
  useEffect(() => {
    if (meals.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % meals.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, meals]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % meals.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + meals.length) % meals.length);

  const visibleSlides = 5;
  const half = Math.floor(visibleSlides / 2);

  const getSlideIndexes = () => {
    if (meals.length === 0) return [];
    const indexes: number[] = [];
    const length = meals.length;
    for (let i = -half; i <= half; i++) {
      indexes.push((currentIndex + i + length) % length);
    }
    return indexes;
  };

  const slideIndexes = getSlideIndexes();

  // اگر هنوز داده نیامده
  if (meals.length === 0) {
    return (
      <section className="py-20 text-center text-gray-500">
        Loading gallery...
      </section>
    );
  }

  return (
    <section id="gallery" className="bg-gray-50 py-16 overflow-hidden">
      <div className="container mx-auto text-center mb-12 px-4">
        <h2 className="text-4xl font-bold mb-2 text-gray-900">Gallery</h2>
        <p className="text-gray-600 text-lg">
          Check <span className="font-semibold text-indigo-600">Our Gallery</span>
        </p>
      </div>

      <div className="container mx-auto relative px-4">
        <div className="flex justify-center items-center overflow-hidden">
          {slideIndexes.map((idx, position) => {
            const meal = meals[idx];
            if (!meal) return null; // ✅ جلوگیری از خطا

            const isCenter = position === half;

            return (
              <div
                key={`${meal.id}-${idx}`}
                className={`flex-shrink-0 relative mx-2 transition-all duration-500 ease-in-out ${
                  isCenter
                    ? "w-72 h-72 sm:w-80 sm:h-80 scale-105 z-10"
                    : "w-56 h-56 sm:w-64 sm:h-64 scale-90 opacity-60"
                }`}
              >
                <Image
                  src={meal.image}
                  alt={meal.title}
                  fill
                  priority
                  className="object-cover rounded-2xl shadow-lg"
                />
                {isCenter && (
                  <div className="absolute bottom-0 w-full bg-black/50 text-white text-center py-2 text-sm font-semibold rounded-b-2xl">
                    {meal.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={prevSlide}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition"
          >
            Prev
          </button>
          <button
            onClick={nextSlide}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition"
          >
            Next
          </button>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 space-x-2">
          {meals.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                idx === currentIndex ? "bg-indigo-600 scale-110" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
