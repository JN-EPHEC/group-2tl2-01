import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import Badge from './Badge';

interface LayoutProps {
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/courses': 'Cours',
  '/members': 'Membres',
  '/families': 'Familles',
  '/course-types': 'Types de cours',
  '/users': 'Utilisateurs',
  '/activity-log': "Journal d'activité",
  '/export': 'Exports',
  '/change-password': 'Changer mon mot de passe',
};

const roleBadgeVariant = (role: string) => {
  if (role === 'admin') return 'danger';
  if (role === 'coach') return 'info';
  return 'default';
};

const roleLabel = (role: string) => {
  if (role === 'admin') return 'Admin';
  if (role === 'coach') return 'Coach';
  return 'Famille';
};

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const title =
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ??
    'Club Sportif';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Top header (mobile) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center px-4 gap-3">
        {location.pathname !== '/dashboard' && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-900 truncate">{title}</h1>
        <div className="flex items-center gap-2">
          {user && (
            <Badge variant={roleBadgeVariant(user.role) as 'danger' | 'info' | 'default'}>
              {roleLabel(user.role)}
            </Badge>
          )}
          <button
            onClick={logout}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Déconnexion"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop top bar */}
      <div className="hidden lg:flex fixed top-0 left-60 right-0 h-14 bg-white border-b border-gray-200 z-20 items-center px-6 gap-3">
        <h1 className="flex-1 text-base font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          {user && (
            <Badge variant={roleBadgeVariant(user.role) as 'danger' | 'info' | 'default'}>
              {roleLabel(user.role)}
            </Badge>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:ml-60 pt-14 pb-20 lg:pb-6 min-h-screen">
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      <MobileNavbar />
    </div>
  );
}
