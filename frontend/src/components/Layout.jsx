import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sidebar flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center ring-1 ring-white/10">
              <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-semibold text-white leading-tight tracking-tight">TeamFlow</h1>
              <p className="text-xs text-sidebar-muted">Task Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/dashboard" className={navClass}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={navClass}>
            <FolderKanban className="w-4 h-4" />
            Projects
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700/80">
          <div className="px-4 py-3 mb-2 rounded-lg bg-sidebar-hover/60">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-surface">
        <Outlet />
      </main>
    </div>
  );
}
