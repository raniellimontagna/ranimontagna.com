import { getTranslations } from 'next-intl/server'
import { WorkCycleSection } from './cycle/work-cycle-section'
import { StackMarquee } from './stack-marquee/stack-marquee'

/** What follows the 2026 opening: the stack, then how he works. */
export async function HomeIntro() {
  const t = await getTranslations('hero2026')

  return (
    <>
      <StackMarquee aiLabel={t('stackAi')} productLabel={t('stackProduct')} />
      <WorkCycleSection />
    </>
  )
}
