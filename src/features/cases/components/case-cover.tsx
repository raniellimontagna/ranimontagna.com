import { type CaseStudy, caseHost } from '../cases.data'
import { BrowserFrame, PhoneFrame, Screen } from './case-frames'

/**
 * A case's first screens, still: the browser with the phone in front of it,
 * as the case page opens. Loops show their first frame here. Decoration: the
 * card link around it names the case.
 */
export function CaseCover({ study, priority }: { study: CaseStudy; priority?: boolean }) {
  return (
    <div className="relative pb-[14%]">
      <div className="w-[86%]">
        <BrowserFrame host={caseHost(study)}>
          <Screen
            media={{ src: study.hero.desk.src }}
            kind="desk"
            alt=""
            sizes="(max-width: 1023px) 86vw, 42vw"
            priority={priority}
          />
        </BrowserFrame>
      </div>
      <div className="absolute right-0 bottom-0 w-[24%]">
        <PhoneFrame>
          <Screen
            media={{ src: study.hero.phone.src }}
            kind="phone"
            alt=""
            sizes="(max-width: 1023px) 24vw, 12vw"
          />
        </PhoneFrame>
      </div>
    </div>
  )
}
