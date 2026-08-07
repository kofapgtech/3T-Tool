import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Tables } from '@/lib/database.types'

export type SelectableBio = Tables<'business_impact_opportunities'> & {
  multiplier: number
  unit_of_impact: string | null
  narrative: Tables<'bio_narratives'> | null
}

/**
 * Only BIOS catalog strategies whose UNSDG sub-clause has a defined
 * social-value multiplier in social_impact_metrics may be selected for a
 * project or simulation (enforced server-side too, by the
 * projects_guard_bio_multiplier trigger — this hook mirrors that rule in
 * the UI so users aren't offered choices that will be rejected on save).
 *
 * Every strategy in this selectable set also happens to have a narrative
 * business case (Opportunity Statement, Economic/Organizational/Finance/
 * Procurement/Marketing/Social Impact benefit text) in bio_narratives,
 * sourced from the workbook's DATA_BIO/DATA_BIO2 sheets — but that's
 * looked up defensively (may be null) rather than assumed, since the two
 * tables aren't guaranteed to stay in lockstep as more multipliers are
 * added over time.
 */
export function useSelectableBios() {
  return useQuery({
    queryKey: ['selectable-bios'],
    queryFn: async () => {
      const [biosRes, metricsRes, narrativesRes] = await Promise.all([
        supabase.from('business_impact_opportunities').select('*').order('bio_id'),
        supabase.from('social_impact_metrics').select('unsdg_number, multiplier, unit_of_impact'),
        supabase.from('bio_narratives').select('*'),
      ])
      if (biosRes.error) throw biosRes.error
      if (metricsRes.error) throw metricsRes.error
      if (narrativesRes.error) throw narrativesRes.error

      const multiplierByUnsdg = new Map<number, { multiplier: number; unit_of_impact: string | null }>()
      for (const m of metricsRes.data ?? []) {
        if (m.unsdg_number !== null && m.multiplier !== null) {
          multiplierByUnsdg.set(m.unsdg_number, { multiplier: m.multiplier, unit_of_impact: m.unit_of_impact })
        }
      }

      const narrativeByBioId = new Map<number, Tables<'bio_narratives'>>()
      for (const n of narrativesRes.data ?? []) {
        narrativeByBioId.set(n.bio_id, n)
      }

      const selectable: SelectableBio[] = []
      for (const bio of biosRes.data ?? []) {
        if (bio.unsdg_number === null) continue
        const match = multiplierByUnsdg.get(bio.unsdg_number)
        if (match) {
          selectable.push({
            ...bio,
            multiplier: match.multiplier,
            unit_of_impact: match.unit_of_impact,
            narrative: narrativeByBioId.get(bio.bio_id) ?? null,
          })
        }
      }
      return selectable
    },
  })
}
