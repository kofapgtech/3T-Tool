import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { useSelectableBios } from '@/lib/useSelectableBios'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Enums, Tables } from '@/lib/database.types'

type ProjectRow = Tables<'projects'>

const STATUS_STYLES: Record<Enums<'project_status'>, string> = {
  Planning: 'bg-slate-100 text-slate-600',
  Active: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-blue-50 text-blue-700',
}

export default function Projects() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const canCreate = profile?.role === 'admin' || profile?.role === 'procurement_manager'

  const projectsQuery = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ProjectRow[]
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Procurement projects and their BIOS strategy.</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {projectsQuery.isLoading ? (
          <p className="p-4 text-sm text-slate-500">Loading projects…</p>
        ) : (projectsQuery.data ?? []).length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No projects yet. Create one to get started.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Allocated Spend</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(projectsQuery.data ?? []).map((p) => (
                <tr
                  key={p.project_id}
                  onClick={() => navigate(`/projects/${p.project_id}`)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{p.project_name ?? `Project ${p.project_id}`}</p>
                    <p className="text-xs text-slate-400">{p.project_code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.lead_department ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(p.total_budget)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(p.allocated_spend)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const biosQuery = useSelectableBios()

  const [projectName, setProjectName] = useState('')
  const [projectCode, setProjectCode] = useState('')
  const [leadDepartment, setLeadDepartment] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [bioId, setBioId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('No profile loaded.')
      const { data, error } = await supabase
        .from('projects')
        .insert({
          org_id: profile.org_id,
          project_name: projectName,
          project_code: projectCode || null,
          lead_department: leadDepartment || null,
          total_budget: totalBudget ? Number(totalBudget) : 0,
          bio_id: bioId ? Number(bioId) : null,
          created_by: profile.id,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects-list'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] })
      navigate(`/projects/${data.project_id}`)
    },
    onError: (err: Error) => {
      // The projects_guard_bio_multiplier trigger raises a clear Postgres
      // exception if the chosen BIOS strategy has no defined multiplier —
      // surface it verbatim since it already explains the problem well.
      setError(err.message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    createMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">New Project</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Project name</label>
            <input
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Project code</label>
              <input
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Lead department</label>
              <input
                value={leadDepartment}
                onChange={(e) => setLeadDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Total budget (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">BIOS strategy</label>
            <select
              value={bioId}
              onChange={(e) => setBioId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select later</option>
              {(biosQuery.data ?? []).map((bio) => (
                <option key={bio.bio_id} value={bio.bio_id}>
                  {bio.business_impact_opportunity} (UNSDG {bio.unsdg_number})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Only strategies with a defined social-value multiplier are shown.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
