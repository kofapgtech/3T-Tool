import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical, LayoutDashboard, LogIn, LogOut, Save } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { useSelectableBios } from '@/lib/useSelectableBios'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import type { Tables } from '@/lib/database.types'

type SimulationRow = Tables<'simulations'>

const BUDGET_PRESETS = [250_000, 1_000_000, 5_000_000, 10_000_000]
const BUDGET_MAX = 10_000_000

/**
 * The public, no-sign-in-required landing experience — this is the app's
 * entry point (`/`). It's a standalone page (its own header/footer, not
 * wrapped in AppShell/Sidebar) so anonymous visitors get a self-contained
 * marketing-style page rather than the internal app chrome. The
 * sign-in-required internal version lives separately at `/sandbox`
 * (src/pages/Sandbox.tsx) — the two are intentionally independent so each
 * can evolve for its own audience without conditional branching.
 *
 * The real workbook (BIOS Tool) models one strategy at a time — you pick a
 * single UNSDG-aligned BIOS strategy, estimate program spend against it,
 * and the tool applies that strategy's fixed impact multiplier to produce
 * a Social Value figure. Net Value Created is a plain derived figure
 * (Social Value − Program Spend), not a separate modeled quantity.
 */
export default function SandboxPublic() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const biosQuery = useSelectableBios()

  const [bioId, setBioId] = useState('')
  const [scenarioName, setScenarioName] = useState('')
  const [programSpend, setProgramSpend] = useState(1_000_000)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Default to the first available strategy so the scorecard, opportunity
  // statement, and benefit grid are populated the moment the page loads.
  useEffect(() => {
    if (!bioId && (biosQuery.data?.length ?? 0) > 0) {
      setBioId(String(biosQuery.data![0].bio_id))
    }
  }, [biosQuery.data, bioId])

  const selectedBio = useMemo(
    () => (biosQuery.data ?? []).find((b) => String(b.bio_id) === bioId),
    [biosQuery.data, bioId],
  )

  const socialValue = selectedBio ? programSpend * selectedBio.multiplier : 0
  const netValue = socialValue - programSpend

  function updateBio(id: string) {
    setBioId(id)
    setSaved(false)
  }

  function updateSpend(value: number) {
    setProgramSpend(value)
    setSaved(false)
  }

  const recentQuery = useQuery({
    queryKey: ['recent-simulations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return data as SimulationRow[]
    },
    enabled: Boolean(session),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('No profile loaded.')
      if (!selectedBio) throw new Error('Select a BIOS strategy first.')
      const { error } = await supabase.from('simulations').insert({
        org_id: profile.org_id,
        bio_id: selectedBio.bio_id,
        scenario_name: scenarioName || null,
        program_spend: programSpend,
        impact_multiplier: selectedBio.multiplier,
        run_by: profile.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setSaved(true)
      setSaveError(null)
      queryClient.invalidateQueries({ queryKey: ['recent-simulations'] })
    },
    onError: (err: Error) => setSaveError(err.message),
  })

  function handleSaveClick() {
    if (!session) {
      navigate('/login', {
        state: { from: '/', message: 'Create an account or sign in to save this scenario.' },
      })
      return
    }
    setSaveError(null)
    saveMutation.mutate()
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
            <FlaskConical size={12} />
            Interactive Simulation
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl">
            Quantify the <span className="text-teal-600">True Value</span> of Your Procurement
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-500">
            Pick a BIOS strategy, set a budget, and see the social value it creates.
            {!session && ' Free to explore — sign in only if you want to save a scenario.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* Left: Define Your Scenario */}
          <div className="rounded-lg border border-line bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">Define Your Scenario</h2>
              <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">
                Live simulation
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Scenario name (optional)</label>
                <input
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g. Q3 supplier diversity push"
                  className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-ink-700">Select primary impact area</label>
                  {selectedBio && (
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                      UNSDG {selectedBio.unsdg_number}
                    </span>
                  )}
                </div>
                <select
                  value={bioId}
                  onChange={(e) => updateBio(e.target.value)}
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="">Select a strategy…</option>
                  {(biosQuery.data ?? []).map((bio) => (
                    <option key={bio.bio_id} value={bio.bio_id}>
                      {bio.business_impact_opportunity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-ink-700">Projected annual budget</label>
                  <div className="flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-1">
                    <span className="text-xs text-ink-400">$</span>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={programSpend}
                      onChange={(e) => updateSpend(Number(e.target.value) || 0)}
                      className="w-28 bg-transparent text-right font-mono text-sm text-ink-900 focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={BUDGET_MAX}
                  step={10000}
                  value={Math.min(programSpend, BUDGET_MAX)}
                  onChange={(e) => updateSpend(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="mt-1 flex justify-between font-mono text-xs text-ink-400">
                  <span>$0</span>
                  <span>{formatCompactCurrency(BUDGET_MAX)}+</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateSpend(preset)}
                      className={`rounded-md border px-2.5 py-1 font-mono text-xs transition ${
                        programSpend === preset
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-line text-ink-500 hover:bg-paper'
                      }`}
                    >
                      {formatCompactCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: results, in order */}
          <div className="flex flex-col gap-6">
            {/* Impact Benefit */}
            {selectedBio?.narrative && (
              <div className="rounded-lg border border-line bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-ink-900">Impact Benefit</h2>
                  {selectedBio.org_strategy && (
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">
                      {selectedBio.org_strategy}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <BenefitCard label="Economic Benefit" text={selectedBio.narrative.economic_benefit} />
                  <BenefitCard label="Organizational Benefit" text={selectedBio.narrative.organizational_benefit} />
                  <BenefitCard
                    label="Finance"
                    text={selectedBio.narrative.finance_benefit}
                    effect={selectedBio.narrative.finance_financial_effect}
                  />
                  <BenefitCard
                    label="Procurement"
                    text={selectedBio.narrative.procurement_benefit}
                    effect={selectedBio.narrative.procurement_financial_effect}
                  />
                  <BenefitCard
                    label="Marketing"
                    text={selectedBio.narrative.marketing_benefit}
                    effect={selectedBio.narrative.marketing_financial_effect}
                  />
                  <BenefitCard
                    label="Social Impact"
                    text={selectedBio.narrative.social_impact_benefit}
                    effect={selectedBio.narrative.social_impact_financial_effect}
                  />
                </div>
              </div>
            )}

            {/* Procurement Impact Scorecard */}
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">Procurement Impact Scorecard</h2>
                {selectedBio && (
                  <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">Live</span>
                )}
              </div>

              {!selectedBio ? (
                <p className="py-8 text-center text-sm text-ink-400">
                  Select a strategy and set a budget to see your impact scorecard.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ScoreTile label="Program Spend" value={formatCurrency(programSpend)} tone="copper" />
                    <ScoreTile label="Social Value" value={formatCurrency(socialValue)} tone="teal" />
                    <ScoreTile label="Net Value Created" value={formatCurrency(netValue)} tone="ink" />
                  </div>

                  <div className="mt-5">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[{ name: 'This scenario', Spend: programSpend, 'Social Value': socialValue }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2DACB" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#6B6558' }} />
                        <YAxis
                          tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#6B6558' }}
                          tickFormatter={(v) => formatCompactCurrency(v)}
                          width={56}
                        />
                        <Tooltip
                          formatter={(v: number) => formatCurrency(v)}
                          contentStyle={{ fontFamily: 'IBM Plex Sans', borderColor: '#E2DACB', borderRadius: 6 }}
                        />
                        <Bar dataKey="Spend" fill="#A6672E" radius={[3, 3, 0, 0]} maxBarSize={64} />
                        <Bar dataKey="Social Value" fill="#147D6F" radius={[3, 3, 0, 0]} maxBarSize={64} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>

            {/* Opportunity Statement */}
            {selectedBio && (
              <div className="rounded-lg border border-line bg-white p-5">
                <h2 className="mb-2 font-display text-lg font-semibold text-ink-900">Opportunity Statement</h2>
                <p className="text-sm leading-relaxed text-ink-600">
                  By allocating{' '}
                  <span className="font-mono font-semibold text-copper-700">{formatCurrency(programSpend)}</span>{' '}
                  toward{' '}
                  <span className="rounded bg-teal-50 px-1.5 py-0.5 font-medium text-teal-700">
                    {selectedBio.business_impact_opportunity}
                  </span>
                  , this scenario is positioned to generate{' '}
                  <span className="font-mono font-semibold text-teal-700">{formatCurrency(socialValue)}</span> in
                  social value — a net value creation of{' '}
                  <span className="rounded bg-teal-50 px-1.5 py-0.5 font-mono font-semibold text-teal-700">
                    {netValue >= 0 ? '+' : ''}
                    {formatCurrency(netValue)}
                  </span>{' '}
                  over direct spend.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scenarios — signed-in users only */}
        {session && (
          <div className="mt-6 rounded-lg border border-line bg-white p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Recent Scenarios</h2>
            {(recentQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-ink-500">No saved scenarios yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-400">
                    <th className="py-2 pr-3 font-medium">Scenario</th>
                    <th className="py-2 pr-3 font-medium">Program Spend</th>
                    <th className="py-2 pr-3 font-medium">Multiplier</th>
                    <th className="py-2 pr-3 font-medium">Social Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentQuery.data ?? []).map((sim) => (
                    <tr key={sim.simulation_id} className="border-b border-ink-100 last:border-0">
                      <td className="py-2 pr-3 font-medium text-ink-900">
                        {sim.scenario_name ?? `Scenario ${sim.simulation_id}`}
                      </td>
                      <td className="py-2 pr-3 font-mono tabular-nums text-copper-700">
                        {formatCurrency(sim.program_spend)}
                      </td>
                      <td className="py-2 pr-3 font-mono tabular-nums text-ink-700">{sim.impact_multiplier}</td>
                      <td className="py-2 pr-3 font-mono tabular-nums text-teal-700">
                        {formatCurrency(sim.social_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Save — final action at the bottom of the page */}
        <div className="mt-6 rounded-lg border border-line bg-white p-6 text-center">
          {saveError && <p className="mb-3 text-sm text-danger">{saveError}</p>}
          {saved && <p className="mb-3 text-sm text-teal-700">Scenario saved.</p>}
          <button
            type="button"
            disabled={!selectedBio || saveMutation.isPending}
            onClick={handleSaveClick}
            className="mx-auto flex items-center justify-center gap-2 rounded-md bg-teal-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-60"
          >
            {session ? <Save size={14} /> : <LogIn size={14} />}
            {session ? (saveMutation.isPending ? 'Saving…' : 'Save scenario') : 'Sign in to save'}
          </button>
          <p className="mt-2 text-xs text-ink-400">
            {session
              ? 'Saved scenarios appear in Recent Scenarios above.'
              : 'Free to explore — sign in only if you want to save this scenario.'}
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function PublicHeader() {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-sm font-semibold text-paper">
              3T
            </div>
            <span className="font-display text-base font-semibold leading-none text-ink-900">Impact Engine</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <span className="flex items-center gap-2 rounded-md bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
              <FlaskConical size={14} />
              Impact Sandbox
            </span>
            {session && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
              >
                <LayoutDashboard size={14} />
                Organization Dashboard
              </Link>
            )}
          </nav>
        </div>

        {session && profile ? (
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-medium text-ink-900 sm:block">
              {profile.full_name ?? profile.work_email}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-white"
          >
            <LogIn size={14} />
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-copper-700 font-display text-xs font-semibold text-paper">
            3T
          </div>
          <span className="font-display text-sm font-semibold text-paper">Impact Engine</span>
        </div>
        <p className="text-xs text-ink-400">Modeling the social value of procurement decisions.</p>
        <span className="text-xs text-ink-400">© {new Date().getFullYear()} 3T Impact Engine</span>
      </div>
    </footer>
  )
}

function ScoreTile({ label, value, tone }: { label: string; value: string; tone: 'ink' | 'teal' | 'copper' }) {
  const toneClass = {
    ink: 'text-ink-900',
    teal: 'text-teal-700',
    copper: 'text-copper-700',
  }[tone]
  return (
    <div className="rounded-md border border-line bg-paper p-3">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}

function BenefitCard({
  label,
  text,
  effect,
}: {
  label: string
  text: string | null | undefined
  effect?: string | null
}) {
  if (!text) return null
  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <p className="text-xs font-semibold text-ink-900">
        {label}
        {effect ? <span className="ml-1.5 font-mono font-normal text-teal-700">{effect}</span> : null}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">{text}</p>
    </div>
  )
}
