"use client";

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto container px-6">
        {/* Header */}
        <div className="mx-auto text-center max-w-3xl mb-16">
          <h2 className="font-bold text-4xl mb-4 text-gray-900">Why Choose <span className="text-green-500">Ariana Feast</span></h2>
          <p className="text-gray-600 text-xl">
            Experience the perfect blend of culinary excellence, premium service, and memorable ambiance
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="transition-all rounded-xl p-8 hover:shadow-lg text-center">
            <div className="flex items-center justify-center rounded-full h-16 w-16 mb-4 mx-auto bg-green-100">
              <svg className="text-green-500 h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Crafted with Love</h3>
            <p className="text-gray-600">Every dish is prepared with passion and attention to detail by our expert chefs</p>
          </div>

          {/* Feature 2 */}
          <div className="transition-all rounded-xl p-8 hover:shadow-lg text-center">
            <div className="flex items-center justify-center rounded-full h-16 w-16 mb-4 mx-auto bg-green-100">
              <svg className="text-green-500 h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Fresh Ingredients</h3>
            <p className="text-gray-600">We source only the finest, freshest ingredients from local farms and trusted suppliers</p>
          </div>

          {/* Feature 3 */}
          <div className="transition-all rounded-xl p-8 hover:shadow-lg text-center">
            <div className="flex items-center justify-center rounded-full h-16 w-16 mb-4 mx-auto bg-blue-100">
              <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Fast Service</h3>
            <p className="text-gray-600">Quick and efficient service without compromising on quality or presentation</p>
          </div>

          {/* Feature 4 */}
          <div className="transition-all rounded-xl p-8 hover:shadow-lg text-center">
            <div className="flex items-center justify-center rounded-full h-16 w-16 mb-4 mx-auto bg-purple-100">
              <svg className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Expert Chefs</h3>
            <p className="text-gray-600">Our team of world-class chefs brings years of culinary expertise to every plate</p>
          </div>

          {/* Feature 5 */}
          <div className="transition-all rounded-xl p-8 hover:shadow-lg text-center">
            <div className="flex items-center justify-center rounded-full h-16 w-16 mb-4 mx-auto bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Premium Ambiance</h3>
            <p className="text-gray-600">Elegant dining atmosphere perfect for romantic dinners and special occasions</p>
          </div>

          {/* Feature 6 */}
          <div className="transition-all rounded-xl p-8 hover:shadow-lg text-center">
            <div className="flex items-center justify-center rounded-full h-16 w-16 mb-4 mx-auto bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">24/7 Service</h3>
            <p className="text-gray-600">Available round the clock for all your dining needs and special requests</p>
          </div>
        </div>
      </div>
    </section>
  );
}
