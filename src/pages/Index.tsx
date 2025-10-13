import { HeroSection } from "@/components/HeroSection";
import { ProjectInfo } from "@/components/ProjectInfo";
import { ImageUpload } from "@/components/ImageUpload";
import { RecentClassifications } from "@/components/RecentClassifications";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <HeroSection />
      <ProjectInfo />
      <ImageUpload />
      <RecentClassifications />
      <Footer />
    </div>
  );
};

export default Index;
