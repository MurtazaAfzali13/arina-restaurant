import Events from "@/components/Event";
import Hero from "@/components/Hero";
import ImageGallery from "@/components/ImageGallery";


import FeaturesSection from "@/components/navbar/Features";
import Testimonials from "@/components/Testimonials";


// app/page.tsx
export default function HomePage() {
  return (
    <div >
      <Hero />
      <FeaturesSection />
      <Testimonials />
      <Events />
      <ImageGallery />
      
    </div>
  );
}
