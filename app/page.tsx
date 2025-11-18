import Events from "@/components/Event";
import Hero from "@/components/Hero";
import ImageGallery from "@/components/ImageGallery";
import MapPage from "@/components/map/MapMainPage";

import FeaturesSection from "@/components/navbar/Features";


// app/page.tsx
export default function HomePage() {
  return (
    <div >
      <Hero />
      <FeaturesSection />

      <Events />
      <ImageGallery />
      <MapPage />
    </div>
  );
}
