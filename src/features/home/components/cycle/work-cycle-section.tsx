import { getMessages } from 'next-intl/server'
import type { CycleCopy } from './cycle.data'
import { WorkCycle } from './work-cycle'

/**
 * Hands the cycle copy to the client component as props, so the `cycle`
 * namespace stays out of the client message payload parsed on hydration.
 */
export async function WorkCycleSection() {
  const messages = await getMessages()
  return <WorkCycle copy={messages.cycle as unknown as CycleCopy} />
}
