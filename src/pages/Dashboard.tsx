import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DollarSign, TrendingUp, Sparkles, FolderKanban } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatNumber, formatPercent, formatRelativeDays } from '@/lib/format'
import type { Enums, Tables } from '@/lib/database.types'

type ProjectRow = Tables<'projects'>
type SocialValueRow = Tables<'project_social_value'>
type ProjectStatus = Enums<'project_status'>

const TICK_STYLE = { fontSize: 12, fontFamily: 'IBM Plex Mono', fill: '#6B6558' }

const STATUS_PILL: Record<ProjectStatus, string> = {
  Planning: 'bg-copper-50 text-copper-700',
  Active: 'bg-teal-50 text-teal-700',
  Completed: 'bg-ink-100 text-ink-700',
}

export default function Dashboard() {
  const { user } = useAuth()

  const projectsQuery = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ProjectRow[]
    },
  })

  const socialValueQuery = useQuery({
    queryKey: ['dashboard-social-value'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_social_value').select('*')
      if (error) throw error
      return data as SocialValueRow[]
    },
  })

  const projects = projectsQuery.data ?? []
  const socialValues = socialValueQuery.data ?? []

  const totals = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.total_budget ?? 0), 0)
    const totalAllocated = projects.reduce((sum, p) => sum + Number(p.allocated_spend ?? 0), 0)
    const totalSocialValue = socialValues.reduce(
      (sum, sv) => sum + Number(sv.total_social_value_of_ownership ?? 0),
      0,
    )
    const activeCount = projects.filter((p) => p.status === 'Active').length
    const departmentCount = new Set(projects.map((p) => p.lead_department).filter(Boolean)).size
    const sdgCount = new Set(socialValues.map((sv) => sv.unsdg_number).filter((n) => n != null)).size
    const conversionRatio = totalAllocated > 0 ? totalSocialValue / totalAllocated : null
    const utilization = totalBudget > 0 ? totalAllocated / totalBudget : null
    return {
      totalBudget,
      totalAllocated,
      totalSocialValue,
      activeCount,
      departmentCount,
      sdgCount,
      conversionRatio,
      utilization,
    }
  }, [projects, socialValues])

  const chartData = useMemo(() => {
    return projects.slice(0, 8).map((p) => {
      const sv = socialValues.find((s) => s.project_id === p.project_id)
      return {
        name: p.project_name ?? p.project_code ?? `Project ${p.project_id}`,
        'Allocated Spend': Number(p.allocated_spend ?? 0),
        'Social Value': Number(sv?.total_social_value_of_ownership ?? 0),
      }
    })
  }, [projects, socialValues])

  const myRecentProjects = useMemo(
    () => projects.filter((p) => p.created_by === user?.id).slice(0, 10),
    [projects, user?.id],
  )

  const loading = projectsQuery.isLoading || socialValueQuery.isLoading

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Organization Dashboard</h1>
        <p className="text-sm text-ink-500">Procurement spend and social value overview.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <ImpactGauge ratio={totals.conversionRatio} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryCard
                icon={<FolderKanban size={16} className="text-paper" />}
                label="Active Projects"
                value={formatNumber(totals.activeCount, { maximumFractionDigits: 0 })}
                accent="bg-ink"
                valueClass="text-ink-900"
                note={totals.departmentCount > 0 ? `across ${totals.departmentCount} departments` : undefined}
              />
              <SummaryCard
                icon={<DollarSign size={16} className="text-paper" />}
                label="Total Budget"
                value={formatCurrency(totals.totalBudget)}
                accent="bg-copper-600"
                valueClass="text-copper-700"
                note={`${projects.length} projects tracked`}
              />
              <SummaryCard
                icon={<TrendingUp size={16} className="text-paper" />}
                label="Allocated Spend"
                value={formatCurrency(totals.totalAllocated)}
                accent="bg-copper-600"
                valueClass="text-copper-700"
                note={
                  totals.utilization != null
                    ? `${formatPercent(totals.utilization, { maximumFractionDigits: 0 })} of budget committed`
                    : undefined
                }
              />
              <SummaryCard
                icon={<Sparkles size={16} className="text-paper" />}
                label="Social Value Generated"
                value={formatCurrency(totals.totalSocialValue)}
                accent="bg-teal-600"
                valueClass="text-teal-700"
                note={totals.sdgCount > 0 ? `measured across ${totals.sdgCount} UN SDGs` : undefined}
              />
            </div>
          </div>

          <SpendVsSocialValueChart data={chartData} />
          <RecentProjects projects={myRecentProjects} />
        </>
      )}
    </div>
  )
}

function ImpactGauge({ ratio }: { ratio: number | null }) {
  const clamped = ratio === null ? null : Math.min(Math.max(ratio, 0), 3)
  const angle = clamped === null ? -90 : (clamped / 3) * 180 - 90

  return (
    <div className="flex flex-col items-center rounded-lg border border-line bg-white p-4 text-center">
      <span className="self-start text-xs font-semibold uppercase tracking-wide text-ink-400">
        Impact Conversion
      </span>
      <div className="relative mt-3 h-[110px] w-[220px]">
        <div
          className="absolute inset-0 rounded-t-full"
          style={{
            background:
              'conic-gradient(from 270deg at 50% 100%, #B4432E 0deg 60deg, #A6672E 60deg 90deg, #147D6F 90deg 180deg)',
          }}
        />
        <div className="absolute bottom-0 left-1/2 h-20 w-40 -translate-x-1/2 rounded-t-full bg-white" />
        <div
          className="absolute bottom-0 left-1/2 h-[88px] w-0.5 rounded-full bg-ink-900 transition-transform duration-700"
          style={{ transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-ink-900" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <span className="font-mono text-2xl font-semibold tabular-nums text-ink-900">
            {clamped === null ? '—' : `${ratio!.toFixed(2)}×`}
          </span>
        </div>
      </div>
      <div className="mt-1 flex w-[216px] justify-between text-[10px] uppercase tracking-wide text-ink-400">
        <span>0×</span>
        <span>1.5×</span>
        <span>3×</span>
      </div>
      <p className="mt-3 max-w-[26ch] text-xs leading-relaxed text-ink-500">
        {ratio === null ? (
          'Not enough allocated spend recorded yet to calculate a conversion rate.'
        ) : (
          <>
            Every <strong className="text-ink-900">$1</strong> of allocated spend has generated{' '}
            <strong className="text-ink-900">${ratio.toFixed(2)}</strong> in measured social value.
          </>
        )}
      </p>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
  valueClass,
  note,
}: {
  icon: ReactNode
  label: string
  value: string
  accent: string
  valueClass: string
  note?: string
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${accent}`}>{icon}</div>
        <p className="text-sm font-medium text-ink-500">{label}</p>
      </div>
      <p className={`font-mono text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-ink-400">{note}</p>}
    </div>
  )
}

function SpendVsSocialValueChart({
  data,
}: {
  data: { name: string; 'Allocated Spend': number; 'Social Value': number }[]
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">Spend vs. Social Value by Project</h2>
      {data.length === 0 ? (
        <p className="text-sm text-ink-500">No projects yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2DACB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: '#6B6558' }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={TICK_STYLE} tickFormatter={(v) => formatCurrency(v, { maximumFractionDigits: 0 })} />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{ fontFamily: 'IBM Plex Sans', borderColor: '#E2DACB', borderRadius: 6 }}
            />
            <Legend wrapperStyle={{ fontSize: 13, fontFamily: 'IBM Plex Sans' }} />
            <Bar dataKey="Allocated Spend" fill="#A6672E" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Social Value" fill="#147D6F" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function RecentProjects({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">Recent Projects</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-ink-500">
          You haven&rsquo;t created any projects yet. Projects you create will show up here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-400">
                <th className="py-2 pr-4 font-medium">Project</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Department</th>
                <th className="py-2 pr-4 font-medium">Budget</th>
                <th className="py-2 pr-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.project_id} className="border-b border-ink-100 last:border-0">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-ink-900">{p.project_name ?? `Project ${p.project_id}`}</div>
                    {p.project_code && (
                      <div className="font-mono text-xs text-ink-400">{p.project_code}</div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-ink-700">{p.lead_department ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono tabular-nums text-ink-700">{formatCurrency(p.total_budget)}</td>
                  <td className="py-2 pr-4 font-mono tabular-nums text-ink-500">{formatRelativeDays(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
