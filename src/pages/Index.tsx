import { HeroSection } from "@/components/HeroSection";
import { ImageUpload } from "@/components/ImageUpload";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <HeroSection />
      <ImageUpload />
      <Footer />
    </div>
  );
};

export default Index;
