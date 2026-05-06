import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { getCourse, addAttendances, removeAttendance } from '../../api/courses'
import { getMembers } from '../../api/members'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import type { Member, Attendance } from '../../types'

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [pendingAdd, setPendingAdd] = useState<Set<string>>(new Set())
  const [pendingRemove, setPendingRemove] = useState<Set<string>>(new Set())
  const isAdminOrCoach = user?.role === 'admin' || user?.role === 'coach'

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!)
  })
  const { data: allMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembers()
  })

  const presentMemberIds = useMemo(
    () => new Set((course?.attendances || []).map((a: Attendance) => a.memberId)),
    [course]
  )

  const addMutation = useMutation({
    mutationFn: (memberIds: string[]) => addAttendances(id!, memberIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] })
      setPendingAdd(new Set())
    }
  })

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeAttendance(id!, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] })
    }
  })

  const toggleAdd = (memberId: string) => {
    setPendingAdd(prev => {
      const next = new Set(prev)
      if (next.has(memberId)) {
        next.delete(memberId)
      } else {
        next.add(memberId)
      }
      return next
    })
  }

  const handleSaveAttendances = () => {
    if (pendingAdd.size > 0) addMutation.mutate([...pendingAdd])
  }

  const handleRemove = (memberId: string) => {
    setPendingRemove(prev => new Set(prev).add(memberId))
    removeMutation.mutate(memberId, {
      onSettled: () => {
        setPendingRemove(prev => {
          const next = new Set(prev)
          next.delete(memberId)
          return next
        })
      }
    })
  }

  const availableMembers = useMemo(() => {
    return (allMembers as Member[]).filter((m) => {
      if (presentMemberIds.has(m.id)) return false
      if (!search) return true
      return `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [allMembers, presentMemberIds, search])

  const presentAttendances: Attendance[] = course?.attendances || []

  if (courseLoading || membersLoading) return <LoadingSpinner />
  if (!course) return <div className="text-center py-12 text-gray-400">Cours non trouvé</div>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl flex-shrink-0">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: course.courseType?.color || '#6B7280' }}
            />
            <h1 className="text-xl font-bold text-gray-900">{course.courseType?.name}</h1>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(course.date + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })} à {course.time}
          </div>
        </div>
        {isAdminOrCoach && (
          <Link to={`/courses/${id}/modifier`} className="text-sm text-blue-600 font-medium">
            Modifier
          </Link>
        )}
      </div>

      {/* Present count badge */}
      <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-3xl font-black text-blue-700">{presentAttendances.length}</span>
          <span className="text-blue-600 ml-2 font-medium">présent(s)</span>
        </div>
        {pendingAdd.size > 0 && (
          <button
            onClick={handleSaveAttendances}
            disabled={addMutation.isPending}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {addMutation.isPending ? '...' : `Valider +${pendingAdd.size}`}
          </button>
        )}
      </div>

      {/* Present list */}
      {presentAttendances.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-green-50 border-b border-green-100">
            <h2 className="font-semibold text-green-800 text-sm">✅ Présents</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {presentAttendances.map((a: Attendance) => (
              <div key={a.id} className="flex items-center gap-3 p-4 min-h-[60px]">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {a.member?.photo
                    ? <img src={`/uploads/${a.member.photo}`} alt="" className="w-full h-full object-cover" />
                    : <span>👤</span>
                  }
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {a.member?.firstName} {a.member?.lastName}
                  </div>
                  <div className={`text-xs ${a.creditPurchaseId ? 'text-green-600' : 'text-orange-500'}`}>
                    {a.creditPurchaseId ? '🟢 Crédité' : '🟡 Sans crédit'}
                  </div>
                </div>
                {isAdminOrCoach && (
                  <button
                    onClick={() => handleRemove(a.memberId)}
                    disabled={pendingRemove.has(a.memberId)}
                    className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add members */}
      {isAdminOrCoach && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">➕ Ajouter des membres</h2>
          </div>
          <div className="p-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {availableMembers.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                {search ? 'Aucun membre trouvé' : 'Tous les membres sont présents'}
              </div>
            ) : (
              availableMembers.map((m: Member) => {
                const isSelected = pendingAdd.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleAdd(m.id)}
                    className={`w-full flex items-center gap-3 p-4 min-h-[60px] transition-colors text-left ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {m.photo
                        ? <img src={`/uploads/${m.photo}`} alt="" className="w-full h-full object-cover" />
                        : <span>👤</span>
                      }
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {m.firstName} {m.lastName}
                      </div>
                      <div className={`text-xs ${(m.availableCredits ?? 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {(m.availableCredits ?? 0) > 0 ? `${m.availableCredits} crédits` : 'Aucun crédit'}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {isSelected ? '✓' : '+'}
                    </div>
                  </button>
                )
              })
            )}
          </div>
          {pendingAdd.size > 0 && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleSaveAttendances}
                disabled={addMutation.isPending}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-60 shadow-md"
              >
                {addMutation.isPending ? 'Enregistrement...' : `✓ Valider ${pendingAdd.size} présence(s)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
