import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFamily = user?.role === 'family';

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-30">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">CS</span>
        </div>
        <span className="font-bold text-gray-900">Club Sportif</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" className={navLinkClass}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          Tableau de bord
        </NavLink>

        <NavLink to="/courses" className={navLinkClass}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Historique
        </NavLink>

        {!isFamily && (
          <NavLink to="/members" className={navLinkClass}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Membres
          </NavLink>
        )}

        {!isFamily && (
          <NavLink to="/families" className={navLinkClass}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Familles
          </NavLink>
        )}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</span>
            </div>

            <NavLink to="/course-types" className={navLinkClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Types de cours
            </NavLink>

            <NavLink to="/users" className={navLinkClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Utilisateurs
            </NavLink>

            <NavLink to="/activity-log" className={navLinkClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Journal d'activité
            </NavLink>

            <NavLink to="/export" className={navLinkClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exports
            </NavLink>

            <NavLink to="/import" className={navLinkClass}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 4l4-4m0 0l4 4m-4-4V4" />
              </svg>
              Imports
            </NavLink>
          </>
        )}

        <div className="pt-3 pb-1 px-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mon compte</span>
        </div>
        <NavLink to="/account" className={navLinkClass}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Mon compte
        </NavLink>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}