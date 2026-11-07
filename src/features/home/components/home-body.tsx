import { getTranslations } from 'next-intl/server'
import { AttoSection } from './atto/atto-section'
import { Closing } from './closing/closing'
import { WorkCycleSection } from './cycle/work-cycle-section'
import { Interlude } from './interlude/interlude'
import { LiveWork } from './live-work/live-work'
import { StackMarquee } from './stack-marquee/stack-marquee'
import { Trajectory } from './trajectory/trajectory'
import { Writing } from './writing/writing'

/** Everything after the opening, resolved on the server in parallel. */
export async function HomeBody({ locale }: { locale: string }) {
  const [t, cycle, interlude, liveWork, trajectory, atto, writing, closing] = await Promise.all([
    getTranslations('hero2026'),
    WorkCycleSection(),
    Interlude(),
    LiveWork(),
    Trajectory(),
    AttoSection(),
    Writing({ locale }),
    Closing(),
  ])

  return (
    <>
      <StackMarquee aiLabel={t('stackAi')} productLabel={t('stackProduct')} />
      {cycle}
      {interlude}
      {liveWork}
      {trajectory}
      {atto}
      {writing}
      {closing}
    </>
  )
}
