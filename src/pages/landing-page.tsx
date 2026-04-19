import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { SplitSection } from '@/components/landing/split-section'
import { AiSection } from '@/components/landing/ai-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { TabsSection } from '@/components/landing/tabs-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CtaSection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'
import { useScrollReveal } from '@/lib/use-scroll-reveal'

export function LandingPage() {
  const containerRef = useScrollReveal()

  return (
    <div ref={containerRef} className="min-h-screen bg-linear-to-b from-teal-50/30 via-white via-50% to-teal-50/40">
      <HeroSection />
      <FeaturesGrid />
      <SplitSection />
      <AiSection />
      <PricingSection />
      <TestimonialsSection />
      <TabsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
