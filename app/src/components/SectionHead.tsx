import type { SectionCopy } from '../content'

/* section heading: script flourish, title, soft body —
   the enchanted ink (lib/ink.ts) writes every letter of these
   as they scroll into view, exactly like the original tale */
export default function SectionHead({ copy }: { copy: SectionCopy }) {
  return (
    <div className="shead">
      <span className="fl">{copy.fl}</span>
      <h2 dangerouslySetInnerHTML={{ __html: copy.h2 }} />
      <p dangerouslySetInnerHTML={{ __html: copy.p }} />
    </div>
  )
}
