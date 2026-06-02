import { HeroSection } from "@/components/home/hero-section";

/**
 * Home page — starter shell for the supply chain application.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <main className="max-w-content mx-auto flex w-full flex-1 flex-col">
      <HeroSection />
    </main>
  );
}
