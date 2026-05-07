import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCourses } from '../../api/courses'
import { getMembers } from '../../api/members'
import { getFamilyMembers } from '../../api/families'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import type { Course, Member } from '../../types'

type Tab = 'courses' | 'members'

export const CourseList = () => {
  const { user } = useAuth()
  const isFamily = user?.role === 'family'
  const [tab, setTab] = useState<Tab>(isFamily ? 'members' : 'courses')
  const [search, setSearch] = useState('')
  const isAdminOrCoach = user?.role === 'admin' || user?.role === 'coach'

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    enabled: !isFamily && tab === 'courses',
  })

  const { data: allMembers = [], isLoading: allMembersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembers(),
    enabled: isAdminOrCoach && tab === 'members',
  })

  const { data: familyMembers = [], isLoading: familyMembersLoading } = useQuery({
    queryKey: ['family-members', user?.familyId],
    queryFn: () => getFamilyMembers(user!.familyId!),
    enabled: isFamily && !!user?.familyId,
  })

  const members: Member[] = isFamily ? (familyMembers as Member[]) : (allMembers as Member[])
  const membersLoading = isFamily ? familyMembersLoading : allMembersLoading

  const grouped = (courses as Course[]).reduce((acc: Record<string, Course[]>, c: Course) => {
    if (!acc[c.date]) acc[c.date] = []
    acc[c.date].push(c)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const filteredMembers = (members as Member[]).filter(m => {
    if (!search) return true
    const name = `${m.firstName} ${m.lastName}`.toLowerCase()
    const family = (m.familyName || '').toLowerCase()
    return name.includes(search.toLowerCase()) || family.includes(search.toLowerCase())
  })

  // Group members alphabetically
  const groupedMembers = filteredMembers.reduce((acc: Record<string, Member[]>, m: Member) => {
    const letter = m.lastName[0]?.toUpperCase() ?? '#'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(m)
    return acc
  }, {})
  const sortedLetters = Object.keys(groupedMembers).sort()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        {isAdminOrCoach && (
          <Link to="/courses/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            + Nouveau cours
          </Link>
        )}
      </div>

      {/* Tabs — masqués pour les familles */}
      {!isFamily && <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab('courses')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'courses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Par cours
        </button>
        <button
          onClick={() => setTab('members')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'members' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Par personne
        </button>
      </div>}

      {/* Par cours */}
      {tab === 'courses' && (
        coursesLoading ? <LoadingSpinner /> :
        sortedDates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-400">Aucun cours enregistré</p>
            {isAdminOrCoach && (
              <Link
                to="/courses/nouveau"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium"
              >
                Créer le premier cours
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </div>
                <div className="space-y-2">
                  {grouped[date].map((c: Course) => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.id}`}
                      className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-3 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.courseType?.color || '#6B7280' }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{c.courseType?.name}</div>
                        <div className="text-sm text-gray-500">
                          {c.time} · {c.attendanceCount ?? 0} présent(s)
                        </div>
                      </div>
                      <span className="text-gray-400">›</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Par personne */}
      {tab === 'members' && (
        membersLoading ? <LoadingSpinner /> : (
          <div className="space-y-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un membre ou une famille…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Aucun membre trouvé</div>
            ) : (
              sortedLetters.map(letter => (
                <div key={letter}>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                    {letter}
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {groupedMembers[letter].map((m: Member) => (
                      <Link
                        key={m.id}
                        to={`/members/${m.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {m.photo
                            ? <img src={`/uploads/${m.photo}`} alt="" className="w-full h-full object-cover" />
                            : <span className="text-sm">👤</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {m.familyName || '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {m.availableCredits !== undefined && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              (m.availableCredits ?? 0) > 0
                                ? 'bg-green-50 text-green-700'
                                : (m.availableCredits ?? 0) < 0
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {m.availableCredits} crédit(s)
                            </span>
                          )}
                          <span className="text-gray-400">›</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}
    </div>
  )
}