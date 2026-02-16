"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, Users, Clock, Award, Heart, ChevronRight } from "lucide-react";

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const floatingAnimation = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // فقط در کلاینت particles را رندر کن
  const Particles = () => {
    if (!isClient) return null;

    return (
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Animated Background */}
      <div className="absolute inset-0">

        <div className="absolute inset-0 overflow-hidden">
          {isMobile ? (
            <img
              src="/images/about/about1.png"
              alt="About background"
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <img
              src="/images/about/about2.png"
              alt="About background"
              className="w-full h-full object-cover opacity-40"
            />
          )}
        </div>


        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>

        {/* Floating Particles - فقط در کلاینت */}
        <Particles />
      </div>

      {/* بقیه کد بدون تغییر */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center text-white max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl"
              >
                <Star className="w-12 h-12 text-white" fill="currentColor" />
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Ariana Feast
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-200 font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                Where Tradition Meets Excellence
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-wrap justify-center gap-6 mb-12"
            >
              {[
                { icon: Users, text: "5000+ Happy Customers" },
                { icon: Clock, text: "Since 2010" },
                { icon: Award, text: "Award Winning" },
                { icon: Heart, text: "Family Owned" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="w-5 h-5 text-yellow-400" />
                  <span className="text-white text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <Link
                href="/menu"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
              >
                Explore Our Menu
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-yellow-400 rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* بقیه sections بدون تغییر */}
        {/* Story Section, Mission & Values, CTA Section */}
        {/* ... */}
      </div>
    </div>
  );
}