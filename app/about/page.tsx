"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="relative bg-gray-50 min-h-screen overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          src="/video/about.mp4" // مسیر ویدیو
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover brightness-50"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24 text-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            About Our Restaurant
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto text-base md:text-lg">
            Experience the art of fine dining where passion meets flavor. We
            serve fresh ingredients, local produce, and heartwarming hospitality.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src="/images/chef.jpg"
              alt="Our chef"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-gray-100"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-200 mb-6 leading-relaxed text-sm md:text-base">
              Founded in 2010, <span className="font-bold text-yellow-400">Le
              Delice</span> started as a small family restaurant with a dream of
              bringing authentic Mediterranean flavors to the heart of the city.
              Each dish tells a story of tradition, crafted with love and a deep
              respect for the ingredients.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
              Our chefs carefully curate every plate, blending timeless recipes
              with modern techniques. Whether you're here for a romantic dinner,
              a family gathering, or a celebration — we promise an unforgettable
              dining experience.
            </p>
            <Link
              href="/menu"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-full transition-all duration-300"
            >
              Explore Our Menu
            </Link>
          </motion.div>
        </div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-yellow-400">
            Our Mission
          </h2>
          <p className="max-w-3xl mx-auto text-gray-200 text-base md:text-lg">
            To create a space where every guest feels at home, every flavor
            tells a story, and every meal becomes a memory. We believe food is
            not just nourishment — it's a celebration of life.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
