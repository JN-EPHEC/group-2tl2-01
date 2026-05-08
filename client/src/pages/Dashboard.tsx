import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCourses } from '../api/courses'
import { getMembers } from '../api/members'
import { getFamilies, getFamily, getFamilyAttendances } from '../api/families'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

function FamilyDashboard() {
  const { user } = useAuth()
  const familyId = user!.familyId!

  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => getFamily(familyId),
  })

  const { data: attendances = [], isLoading: attendancesLoading } = useQuery({
    queryKey: ['family-attendances', familyId],
    queryFn: () => getFamilyAttendances(familyId),
  })

  if (familyLoading || attendancesLoading) return <LoadingSpinner />

  const credits = (family as any)?.totalCredits ?? 0
  const members = family?.members ?? []
  const recentAttendances = (attendances as any[]).slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.firstName} 👋</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-500 mt-1">Membres</div>
        </div>
        <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100`}>
          <div className={`text-3xl font-bold ${credits > 0 ? 'text-green-600' : credits < 0 ? 'text-orange-500' : 'text-gray-400'}`}>
            {credits}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {credits < 0 ? 'Paiement en attente' : 'Crédits disponibles'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Dernières présences</h2>
          <Link to="/courses" className="text-sm text-blue-600">Voir tout</Link>
        </div>
        {recentAttendances.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune présence enregistrée</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAttendances.map((a: any) => (
              <Link
                key={a.id}
                to={`/members/${a.member?.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {a.member?.firstName} {a.member?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {a.course?.courseType?.name} · {a.course?.date ? new Date(a.course.date).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.creditPurchaseId ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                    {a.creditPurchaseId ? 'Crédit' : 'Dette'}
                  </span>
                  <span className="text-gray-400">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const isAdminOrCoach = user?.role === 'admin' || user?.role === 'coach'
  const today = new Date().toISOString().split('T')[0]

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  })
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembers(),
  })
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: getFamilies,
  })

  const todayCourses = courses.filter((c) => c.date === today)
  const recentCourses = courses.slice(0, 5)

  if (coursesLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.firstName} 👋</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-500 mt-1">Membres actifs</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-green-600">{families.length}</div>
          <div className="text-sm text-gray-500 mt-1">Familles</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-purple-600">{todayCourses.length}</div>
          <div className="text-sm text-gray-500 mt-1">Cours aujourd'hui</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-orange-500">{courses.length}</div>
          <div className="text-sm text-gray-500 mt-1">Cours total</div>
        </div>
      </div>

      {isAdminOrCoach && (
        <Link
          to="/courses/nouveau"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Nouveau cours
        </Link>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Derniers cours</h2>
          <Link to="/courses" className="text-sm text-blue-600">Voir tout</Link>
        </div>
        {recentCourses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun cours enregistré</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCourses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">{c.courseType?.name}</div>
                  <div className="text-xs text-gray-500">{c.date} à {c.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{c.attendanceCount ?? 0} présents</span>
                  <span className="text-gray-400">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'family') return <FamilyDashboard />
  return <AdminDashboard />
}