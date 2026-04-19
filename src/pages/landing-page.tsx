import { HeroSection } from '@/components/landing/hero-section'
import { LogosBar } from '@/components/landing/logos-bar'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { SplitSection } from '@/components/landing/split-section'
import { AiSection } from '@/components/landing/ai-section'
import { NumbersSection } from '@/components/landing/numbers-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { TabsSection } from '@/components/landing/tabs-section'
import { CtaSection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'
import { useScrollReveal } from '@/lib/use-scroll-reveal'

export function LandingPage() {
  const containerRef = useScrollReveal()

  return (
    <div ref={containerRef} className="min-h-screen">
      <HeroSection />
      <LogosBar />
      <FeaturesGrid />
      <SplitSection />
      <AiSection />
      <NumbersSection />
      <TestimonialsSection />
      <TabsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
