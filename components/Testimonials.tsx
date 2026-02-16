'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import Image from 'next/image'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Saul Goodman',
    role: 'CEO & Founder',
    image: '/images/about/testimonials-1.jpg',
    text: 'Proin iaculis purus consequat sem cure dignissim donec porttitora entum suscipit rhoncus.',
  },
  {
    name: 'Sara Wilsson',
    role: 'Designer',
    image: '/images/about/testimonials-2.jpg',
    text: 'Export tempor illum tamen malis malis eram quae irure esse labore quem cillum quid.',
  },
  {
    name: 'Jena Karlis',
    role: 'Store Owner',
    image: '/images/about/testimonials-3.jpg',
    text: 'Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam.',
  },
  {
    name: 'John Larson',
    role: 'Entrepreneur',
    image: '/images/about/testimonials-4.jpg',
    text: 'Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos export minim fugiat minim velit.',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-200 to-white relative overflow-hidden">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-bold text-gray-800 tracking-wide">TESTIMONIALS</h2>
        <p className="text-gray-600 mt-2 text-lg">
          What Are They{' '}
          <span className="text-indigo-600 font-semibold">Saying About Us</span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          speed={700}
          className="pb-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center justify-center gap-10"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl opacity-40 scale-125"></div>
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={140}
                    height={140}
                    className="rounded-full border-4 border-white shadow-xl relative z-10 object-cover"
                  />
                </div>

                {/* Card */}
                <div className="bg-white shadow-lg rounded-3xl p-8 max-w-xl">
                  <p className="text-gray-600 italic text-lg leading-relaxed relative">
                    <span className="text-5xl text-indigo-400 font-serif absolute -left-6 -top-4">“</span>
                    {t.text}
                    <span className="text-5xl text-indigo-400 font-serif absolute -right-4 -bottom-6">”</span>
                  </p>

                  <h3 className="mt-6 text-2xl font-semibold text-gray-800">{t.name}</h3>
                  <h4 className="text-gray-500 mb-3">{t.role}</h4>

                  <div className="flex text-yellow-400">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.729 1.507 8.165L12 18.896l-7.443 4.304 1.507-8.165L0 9.306l8.332-1.151z" />
                        </svg>
                      ))}
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
