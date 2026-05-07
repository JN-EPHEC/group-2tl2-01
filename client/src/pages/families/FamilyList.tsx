import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { getFamilies } from '../../api/families'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import type { Family } from '../../types'

export const FamilyList = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const { data: families = [], isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: getFamilies,
    enabled: user?.role !== 'family',
  })

  if (user?.role === 'family' && user.familyId) {
    return <Navigate to={`/families/${user.familyId}`} replace />
  }

  const filtered = families.filter((f: Family) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Familles</h1>
        {user?.role === 'admin' && (
          <Link
            to="/families/nouveau"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            + Nouvelle famille
          </Link>
        )}
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher une famille..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucune famille trouvée</div>
        ) : (
          filtered.map((f: Family) => (
            <Link
              key={f.id}
              to={`/families/${f.id}`}
              className={`block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${!f.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{f.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {f.memberCount ?? 0} membre(s) · {f.phone || 'Pas de téléphone'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-right ${f.totalCredits > 0 ? 'text-green-600' : f.totalCredits < 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                    <div className="font-bold text-lg">{f.totalCredits}</div>
                    <div className="text-xs">{f.totalCredits < 0 ? 'dette' : 'crédits'}</div>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </div>
              {!f.isActive && <span className="text-xs text-red-500 font-medium">Inactif</span>}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
