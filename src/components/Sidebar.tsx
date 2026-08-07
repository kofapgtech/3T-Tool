import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, FlaskConical, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  procurement_manager: 'Procurement Manager',
  esg_auditor: 'ESG Auditor',
  cpo_viewer: 'CPO Viewer',
  diversity_viewer: 'Supplier Diversity Viewer',
}

function navClass(isActive: boolean) {
  return [
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-teal-600/15 text-teal-300' : 'text-ink-400 hover:bg-white/5 hover:text-paper',
  ].join(' ')
}

export function Sidebar() {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col justify-between bg-ink px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-copper-700 font-display text-sm font-semibold text-paper">
            3T
          </div>
          <span className="font-display text-base font-semibold leading-none text-paper">
            Impact Engine
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/dashboard" className={({ isActive }) => navClass(isActive)}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => navClass(isActive)}>
            <FolderKanban size={16} />
            Projects
          </NavLink>
          <NavLink to="/sandbox" className={({ isActive }) => navClass(isActive)}>
            <FlaskConical size={16} />
            Impact Sandbox
          </NavLink>
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4">
        {session && profile ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-paper">
                {profile.full_name ?? profile.work_email}
              </p>
              <p className="truncate text-xs text-ink-400">{ROLE_LABELS[profile.role] ?? profile.role}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-400 transition hover:bg-white/10 hover:text-paper"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-paper transition hover:bg-white/10"
          >
            <LogIn size={16} />
            Sign in
          </button>
        )}
      </div>
    </aside>
  )
}
