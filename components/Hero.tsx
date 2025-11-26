'use client';

import { Users, Clock, Coffee } from "lucide-react";
import Image from "next/image";

const stats = [
  { value: "25+", label: "Years", icon: Clock, bgColor: "bg-green-100", iconColor: "text-green-500" },
  { value: "50k+", label: "Customers", icon: Users, bgColor: "bg-emerald-100", iconColor: "text-emerald-500" },
  { value: "200+", label: "Dishes", icon: Coffee, bgColor: "bg-yellow-100", iconColor: "text-yellow-500" },
];

export default function Hero() {
  return (
    <section
      id="banner"
      className="relative flex items-center justify-center min-h-screen bg-[url('/images/restaurant/banner.jpg')] px-6 md:px-20 bg-cover bg-center bg-fixed text-white"
    >
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 800 800">
          <defs>
            <pattern id="food-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" strokeWidth="1" fill="none" stroke="#f97316" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#food-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto py-20">
        <div className="flex flex-col-reverse lg:flex-row items-center min-h-[80vh]">
          {/* --- LEFT CONTENT --- */}
          <div className="lg:w-1/2 mb-16 lg:mb-0 text-center lg:text-left">
            <div className="inline-block mb-6">
              <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-gray-800">Badge Text</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-100">Title</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                Highlight
              </span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl max-w-xl leading-relaxed mb-8 mx-auto lg:mx-0">
              Short description goes here for your hero section.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <a
                href="#"
                className="px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-transform"
              >
                Primary Button
              </a>
              <a
                href="#"
                className="px-8 py-4 text-gray-200 rounded-full font-semibold border-2 border-gray-200 hover:bg-gray-900 hover:text-white transition-colors"
              >
                Secondary Button
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-6 rounded-full bg-white shadow-md"
                  >
                    <div className={`flex items-center justify-center h-16 w-16 rounded-full ${stat.bgColor} mb-2`}>
                      <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- RIGHT CONTENT (Floating Image) --- */}
          <div className="relative lg:w-1/2 flex justify-center lg:justify-end mb-10 lg:mb-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto animate-[float_6s_ease-in-out_infinite]">
              <Image
                src="/images/logo/menu-item-1.png"
                alt="Hero Image"
                className="relative z-10 w-full rounded-2xl shadow-2xl object-cover rounded-full"
                width={500}
                height={500}
              />

              {/* Decorative Circles */}
              <div className="absolute -left-6 -top-6 h-16 w-16 bg-green-200 rounded-full opacity-70 blur-md animate-ping" />
              <div className="absolute -right-8 -bottom-8 h-24 w-24 bg-emerald-200 rounded-full opacity-60 blur-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Floating Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}
