import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import type { Enums, Tables } from '@/lib/database.types'

type ProjectRow = Tables<'projects'>
type CostRow = Tables<'project_costs'>
type BusinessValueRow = Tables<'project_business_value'>
type FinancialsRow = Tables<'project_financials'>
type SocialValueRow = Tables<'project_social_value'>
type SubmissionRow = Tables<'project_submissions'>
type CostCategoryRow = Tables<'cost_categories'>
type BioRow = Tables<'business_impact_opportunities'>
type BioNarrativeRow = Tables<'bio_narratives'>

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const id = Number(projectId)

  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('project_id', id).single()
      if (error) throw error
      return data as ProjectRow
    },
    enabled: Number.isFinite(id),
  })

  const financialsQuery = useQuery({
    queryKey: ['project-financials', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_financials')
        .select('*')
        .eq('project_id', id)
        .maybeSingle()
      if (error) throw error
      return data as FinancialsRow | null
    },
    enabled: Number.isFinite(id),
  })

  const socialValueQuery = useQuery({
    queryKey: ['project-social-value', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_social_value')
        .select('*')
        .eq('project_id', id)
        .maybeSingle()
      if (error) throw error
      return data as SocialValueRow | null
    },
    enabled: Number.isFinite(id),
  })

  const bioQuery = useQuery({
    queryKey: ['project-bio', projectQuery.data?.bio_id],
    queryFn: async () => {
      const bioId = projectQuery.data!.bio_id!
      const [bioRes, narrativeRes] = await Promise.all([
        supabase.from('business_impact_opportunities').select('*').eq('bio_id', bioId).single(),
        supabase.from('bio_narratives').select('*').eq('bio_id', bioId).maybeSingle(),
      ])
      if (bioRes.error) throw bioRes.error
      if (narrativeRes.error) throw narrativeRes.error
      return { bio: bioRes.data as BioRow, narrative: narrativeRes.data as BioNarrativeRow | null }
    },
    enabled: Number.isFinite(id) && Boolean(projectQuery.data?.bio_id),
  })

  if (projectQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading project…</p>
  }

  if (projectQuery.isError || !projectQuery.data) {
    return <p className="text-sm text-red-600">Could not load this project.</p>
  }

  const project = projectQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {project.project_name ?? `Project ${project.project_id}`}
        </h1>
        <p className="text-sm text-slate-500">
          {project.project_code ?? '—'} · {project.lead_department ?? 'No department'}
        </p>
      </div>

      {bioQuery.data && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">BIOS Strategy</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{bioQuery.data.bio.business_impact_opportunity}</p>
          {bioQuery.data.narrative?.opportunity_statement && (
            <p className="mt-2 text-sm text-slate-600">{bioQuery.data.narrative.opportunity_statement}</p>
          )}
        </div>
      )}

      <FinancialsSummary financials={financialsQuery.data} socialValue={socialValueQuery.data} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BusinessValueSection projectId={id} />
        <CostsSection projectId={id} />
      </div>

      <SubmissionsSection projectId={id} orgId={project.org_id} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="tabular-nums text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function FinancialsSummary({
  financials,
  socialValue,
}: {
  financials: FinancialsRow | null | undefined
  socialValue: SocialValueRow | null | undefined
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Financial & Social Value Summary</h2>
      {!financials ? (
        <p className="text-sm text-slate-500">
          Add business value and cost inputs below to compute the project's financials.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total One-Time Cost" value={formatCurrency(financials.total_one_time_cost)} />
          <StatCard label="NPV of Annual Benefits" value={formatCurrency(financials.npv_of_annual_benefits)} />
          <StatCard label="Net TVO" value={formatCurrency(financials.net_tvo)} />
          <StatCard label="TVO per $ Invested" value={formatCurrency(financials.tvo_per_dollar_invested, { maximumFractionDigits: 2 })} />
          <StatCard label="Simple ROI (%)" value={formatPercent(financials.simple_roi_percentage, { maximumFractionDigits: 1 })} />
          <StatCard
            label="Social Value of Ownership"
            value={
              socialValue?.multiplier_missing
                ? 'No multiplier'
                : formatCurrency(socialValue?.total_social_value_of_ownership)
            }
          />
        </div>
      )}
    </div>
  )
}

function BusinessValueSection({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient()

  const bvQuery = useQuery({
    queryKey: ['project-business-value', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_business_value')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()
      if (error) throw error
      return data as BusinessValueRow | null
    },
  })

  const [form, setForm] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const bv = bvQuery.data

  function fieldValue(key: keyof BusinessValueRow, fallback = '0') {
    if (form[key] !== undefined) return form[key]
    if (bv && bv[key] !== null && bv[key] !== undefined) return String(bv[key])
    return fallback
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        project_id: projectId,
        discount_rate: Number(fieldValue('discount_rate', '0.08')),
        initial_capital_cost: Number(fieldValue('initial_capital_cost')),
        implementation_services_cost: Number(fieldValue('implementation_services_cost')),
        training_cost: Number(fieldValue('training_cost')),
        other_one_time_cost: Number(fieldValue('other_one_time_cost')),
        annual_added_revenue_year1: Number(fieldValue('annual_added_revenue_year1')),
        annual_added_revenue_year2: Number(fieldValue('annual_added_revenue_year2')),
        annual_added_revenue_year3: Number(fieldValue('annual_added_revenue_year3')),
        resale_residual_value: Number(fieldValue('resale_residual_value')),
      }
      const { error } = await supabase.from('project_business_value').upsert(payload, { onConflict: 'project_id' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-business-value', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-financials', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-social-value', projectId] })
      setForm({})
    },
    onError: (err: Error) => setError(err.message),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    saveMutation.mutate()
  }

  const inputFields: { key: keyof BusinessValueRow; label: string }[] = [
    { key: 'discount_rate', label: 'Discount rate (e.g. 0.08 = 8%)' },
    { key: 'initial_capital_cost', label: 'Initial / capital cost' },
    { key: 'implementation_services_cost', label: 'Implementation services cost' },
    { key: 'training_cost', label: 'Training cost' },
    { key: 'other_one_time_cost', label: 'Other one-time cost' },
    { key: 'annual_added_revenue_year1', label: 'Annual added revenue — Y1' },
    { key: 'annual_added_revenue_year2', label: 'Annual added revenue — Y2' },
    { key: 'annual_added_revenue_year3', label: 'Annual added revenue — Y3' },
    { key: 'resale_residual_value', label: 'Resale / residual value (Y3)' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Business Value Inputs</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {inputFields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs font-medium text-slate-600">{f.label}</label>
            <input
              type="number"
              step="0.0001"
              value={fieldValue(f.key)}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save business value'}
          </button>
        </div>
      </form>
    </div>
  )
}

function CostsSection({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const costsQuery = useQuery({
    queryKey: ['project-costs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_costs')
        .select('*')
        .eq('project_id', projectId)
        .order('cost_record_id')
      if (error) throw error
      return data as CostRow[]
    },
  })

  const categoriesQuery = useQuery({
    queryKey: ['cost-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cost_categories').select('*').order('category_id')
      if (error) throw error
      return data as CostCategoryRow[]
    },
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Cost Line Items</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <Plus size={14} />
          Add line item
        </button>
      </div>

      {showForm && (
        <CostLineItemForm
          projectId={projectId}
          categories={categoriesQuery.data ?? []}
          onDone={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['project-costs', projectId] })
            queryClient.invalidateQueries({ queryKey: ['project-financials', projectId] })
          }}
        />
      )}

      <div className="mt-3 overflow-x-auto">
        {(costsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No cost line items yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-medium">Line item</th>
                <th className="py-2 pr-3 font-medium">Class</th>
                <th className="py-2 pr-3 font-medium">Baseline (avg/yr)</th>
                <th className="py-2 pr-3 font-medium">Projected (avg/yr)</th>
              </tr>
            </thead>
            <tbody>
              {(costsQuery.data ?? []).map((c) => {
                const baselineAvg = (Number(c.baseline_year1) + Number(c.baseline_year2) + Number(c.baseline_year3)) / 3
                const projectedAvg =
                  (Number(c.projected_year1) + Number(c.projected_year2) + Number(c.projected_year3)) / 3
                return (
                  <tr key={c.cost_record_id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 font-medium text-slate-900">{c.line_item_label}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.classification}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(baselineAvg)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(projectedAvg)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function CostLineItemForm({
  projectId,
  categories,
  onDone,
}: {
  projectId: number
  categories: CostCategoryRow[]
  onDone: () => void
}) {
  const [label, setLabel] = useState('Line Item')
  const [categoryId, setCategoryId] = useState('')
  const [classification, setClassification] = useState<Enums<'cost_classification'>>('Direct')
  const [baselineY1, setBaselineY1] = useState('0')
  const [baselineY2, setBaselineY2] = useState('0')
  const [baselineY3, setBaselineY3] = useState('0')
  const [projectedY1, setProjectedY1] = useState('0')
  const [projectedY2, setProjectedY2] = useState('0')
  const [projectedY3, setProjectedY3] = useState('0')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId) throw new Error('Select a cost category.')
      const { error } = await supabase.from('project_costs').insert({
        project_id: projectId,
        cost_category_id: Number(categoryId),
        classification,
        line_item_label: label || 'Line Item',
        baseline_year1: Number(baselineY1),
        baseline_year2: Number(baselineY2),
        baseline_year3: Number(baselineY3),
        projected_year1: Number(projectedY1),
        projected_year2: Number(projectedY2),
        projected_year3: Number(projectedY3),
      })
      if (error) throw error
    },
    onSuccess: onDone,
    onError: (err: Error) => setError(err.message),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        createMutation.mutate()
      }}
      className="mb-4 flex flex-col gap-2 rounded-lg bg-slate-50 p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Line item label"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Cost category…</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.cost_category_name}
            </option>
          ))}
        </select>
      </div>

      <select
        value={classification}
        onChange={(e) => setClassification(e.target.value as Enums<'cost_classification'>)}
        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="Direct">Direct</option>
        <option value="Indirect">Indirect</option>
      </select>

      <div className="grid grid-cols-3 gap-2">
        <input value={baselineY1} onChange={(e) => setBaselineY1(e.target.value)} type="number" step="0.01" placeholder="Baseline Y1" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
        <input value={baselineY2} onChange={(e) => setBaselineY2(e.target.value)} type="number" step="0.01" placeholder="Baseline Y2" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
        <input value={baselineY3} onChange={(e) => setBaselineY3(e.target.value)} type="number" step="0.01" placeholder="Baseline Y3" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input value={projectedY1} onChange={(e) => setProjectedY1(e.target.value)} type="number" step="0.01" placeholder="Projected Y1" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
        <input value={projectedY2} onChange={(e) => setProjectedY2(e.target.value)} type="number" step="0.01" placeholder="Projected Y2" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
        <input value={projectedY3} onChange={(e) => setProjectedY3(e.target.value)} type="number" step="0.01" placeholder="Projected Y3" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {createMutation.isPending ? 'Saving…' : 'Add'}
        </button>
      </div>
    </form>
  )
}

const AUDIT_STYLES: Record<Enums<'audit_status'>, string> = {
  'Pending Audit': 'bg-amber-50 text-amber-700',
  'In Review': 'bg-blue-50 text-blue-700',
  Verified: 'bg-emerald-50 text-emerald-700',
}

function SubmissionsSection({ projectId, orgId }: { projectId: number; orgId: number | null }) {
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const canAudit = profile?.role === 'esg_auditor' || profile?.role === 'admin'

  const submissionsQuery = useQuery({
    queryKey: ['project-submissions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('project_id', projectId)
        .order('submission_date', { ascending: false })
      if (error) throw error
      return data as SubmissionRow[]
    },
  })

  async function handleReview(submission: SubmissionRow, status: Enums<'audit_status'>) {
    await supabase.from('project_submissions').update({ status }).eq('submission_id', submission.submission_id)
    queryClient.invalidateQueries({ queryKey: ['project-submissions', projectId] })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Submissions</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <Plus size={14} />
          New submission
        </button>
      </div>

      {showForm && orgId !== null && (
        <SubmissionForm
          projectId={projectId}
          orgId={orgId}
          onDone={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['project-submissions', projectId] })
          }}
        />
      )}

      <div className="overflow-x-auto">
        {(submissionsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-medium">Title</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Date</th>
                {canAudit && <th className="py-2 pr-3 font-medium">Review</th>}
              </tr>
            </thead>
            <tbody>
              {(submissionsQuery.data ?? []).map((s) => (
                <tr key={s.submission_id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 font-medium text-slate-900">{s.submission_title}</td>
                  <td className="py-2 pr-3 text-slate-600">{s.category}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatCurrency(s.amount)}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${AUDIT_STYLES[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-slate-500">{formatDate(s.submission_date)}</td>
                  {canAudit && (
                    <td className="py-2 pr-3">
                      <select
                        value={s.status}
                        onChange={(e) => handleReview(s, e.target.value as Enums<'audit_status'>)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="Pending Audit">Pending Audit</option>
                        <option value="In Review">In Review</option>
                        <option value="Verified">Verified</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function SubmissionForm({
  projectId,
  orgId,
  onDone,
}: {
  projectId: number
  orgId: number
  onDone: () => void
}) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Enums<'submission_category'>>('Eco-Services')
  const [amount, setAmount] = useState('0')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('No profile loaded.')
      let evidenceFilePath: string | null = null

      if (file) {
        setUploading(true)
        const path = `${orgId}/${projectId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('submission-evidence').upload(path, file)
        setUploading(false)
        if (uploadError) throw uploadError
        evidenceFilePath = path
      }

      const { error } = await supabase.from('project_submissions').insert({
        org_id: orgId,
        project_id: projectId,
        submission_title: title,
        category,
        amount: Number(amount),
        submitted_by: profile.id,
        submitter_email: profile.work_email,
        evidence_file_path: evidenceFilePath,
      })
      if (error) throw error
    },
    onSuccess: onDone,
    onError: (err: Error) => setError(err.message),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        createMutation.mutate()
      }}
      className="mb-4 flex flex-col gap-2 rounded-lg bg-slate-50 p-3"
    >
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Submission title"
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Enums<'submission_category'>)}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="Eco-Services">Eco-Services</option>
          <option value="Logistics">Logistics</option>
          <option value="Local Goods">Local Goods</option>
          <option value="Technology">Technology</option>
          <option value="Facilities">Facilities</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:bg-white">
        <Upload size={14} />
        {file ? file.name : 'Attach evidence (optional)'}
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || uploading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : createMutation.isPending ? 'Saving…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
