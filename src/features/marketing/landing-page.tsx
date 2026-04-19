import { HeroSection } from '@/features/marketing/sections/hero-section'
import { FeaturesGrid } from '@/features/marketing/sections/features-grid'
import { SplitSection } from '@/features/marketing/sections/split-section'
import { AiSection } from '@/features/marketing/sections/ai-section'
import { TestimonialsSection } from '@/features/marketing/sections/testimonials-section'
import { TabsSection } from '@/features/marketing/sections/tabs-section'
import { PricingSection } from '@/features/marketing/sections/pricing-section'
import { CtaSection } from '@/features/marketing/sections/cta-section'
import { Footer } from '@/features/marketing/sections/footer'
import { useScrollReveal } from '@/shared/hooks/use-scroll-reveal'

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
