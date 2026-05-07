import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getMembers, reactivateMember } from '../../api/members'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import type { Member } from '../../types'

export const MemberList = () => {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', includeInactive],
    queryFn: () => getMembers(includeInactive)
  })

  const reactivateMutation = useMutation({
    mutationFn: reactivateMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] })
  })

  const filtered = members.filter((m: Member) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    m.familyName?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Membres</h1>
        {(user?.role === 'admin' || user?.role === 'coach') && (
          <Link
            to="/members/nouveau"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            + Nouveau
          </Link>
        )}
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher un membre..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {user?.role === 'admin' && (
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={e => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          Inclure les membres inactifs
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">Aucun membre trouvé</div>
        ) : (
          filtered.map((m: Member) => (
            <div key={m.id} className="relative">
              <Link
                to={`/members/${m.id}`}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 ${!m.isActive ? 'opacity-60' : ''} ${!m.isActive && includeInactive ? 'pr-28' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {m.photo
                    ? <img src={`/uploads/${m.photo}`} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl">👤</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{m.firstName} {m.lastName}</div>
                  <div className="text-xs text-gray-500 truncate">{m.familyName || 'Sans famille'}</div>
                  {!m.isActive && <div className="text-xs text-red-500 font-medium">Inactif</div>}
                </div>
                {m.isActive && (
                  <div className={`text-right flex-shrink-0 ${
                    (m.availableCredits ?? 0) > 0 ? 'text-green-600'
                    : (m.availableCredits ?? 0) < 0 ? 'text-orange-500'
                    : 'text-gray-400'
                  }`}>
                    <div className="font-bold">{m.availableCredits ?? 0}</div>
                    <div className="text-xs">{(m.availableCredits ?? 0) < 0 ? 'dette' : 'crédits'}</div>
                  </div>
                )}
              </Link>
              {!m.isActive && includeInactive && user?.role === 'admin' && (
                <button
                  onClick={(e) => { e.preventDefault(); reactivateMutation.mutate(m.id) }}
                  disabled={reactivateMutation.isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
                >
                  Réactiver
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}