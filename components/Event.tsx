'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import Image from 'next/image'
import { motion } from 'framer-motion'

const events = [
  {
    title: 'Custom Parties',
    price: '$99',
    description:
      'Quo corporis voluptas ea ad. Consectetur inventore sapiente ipsum voluptas eos omnis facere.',
    image: '/images/gallery/events-1.jpg',
  },
  {
    title: 'Private Parties',
    price: '$289',
    description:
      'In delectus sint qui et enim. Facere nemo vero est ut dolores ea assumenda et.',
    image: '/images/gallery/events-2.jpg',
  },
  {
    title: 'Birthday Parties',
    price: '$499',
    description:
      'Laborum aperiam atque omnis minus omnis est qui assumenda quos.',
    image: '/images/gallery/events-3.jpg',
  },
  {
    title: 'Wedding Parties',
    price: '$899',
    description:
      'Esse quisquam ducimus officia ipsum ut quibusdam maxime.',
    image: '/images/gallery/events-4.jpg',
  },
]

export default function Events() {
  return (
    <section id="events" className="pb-6 bg-gray-200 relative overflow-hidden">
      {/* Section Title */}
      {/* <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800 tracking-wide">EVENTS</h2>
        <p className="text-gray-600 mt-2 text-lg">
          Our <span className="text-indigo-600 font-semibold">Special Occasions</span>
        </p>
      </div> */}

      {/* Swiper */}
      <div className="w-full">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          speed={700}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          spaceBetween={0} // ⬅️ فاصله بین عکس‌ها حذف شد
          className="!m-0 !p-0"
        >
          {events.map((event, i) => (
            <SwiperSlide key={i} className="!m-0 !p-0">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative overflow-hidden group"
              >
                {/* Background Image */}
                <div className="relative h-[400px] w-full">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1200px) 33vw, 100vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all duration-300"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
                  <h3 className="text-2xl font-semibold mb-1">{event.title}</h3>
                  <div className="text-indigo-300 font-bold text-lg mb-3">{event.price}</div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
