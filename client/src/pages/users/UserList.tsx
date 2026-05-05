import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getUsers, deactivateUser, reactivateUser, forcePasswordReset } from '../../api/users'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import type { User } from '../../types'

export const UserList = () => {
  const qc = useQueryClient()
  const [confirmReset, setConfirmReset] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  })

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  })

  const resetMutation = useMutation({
    mutationFn: forcePasswordReset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setConfirmReset(null)
    }
  })

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    coach: 'Entraîneur',
    family: 'Famille'
  }
  const roleColor: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    coach: 'bg-green-100 text-green-700',
    family: 'bg-blue-100 text-blue-700'
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <Link to="/users/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
          + Nouveau
        </Link>
      </div>
      <div className="space-y-3">
        {(users as User[]).map((u) => (
          <div
            key={u.id}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${!u.isActive ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">{u.firstName} {u.lastName}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] || 'bg-gray-100 text-gray-700'}`}>
                    {roleLabel[u.role] || u.role}
                  </span>
                  {!u.isActive && <span className="text-xs text-red-500">Inactif</span>}
                  {u.forcePasswordChange && <span className="text-xs text-orange-500">Reset requis</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Link
                  to={`/users/${u.id}/modifier`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2 hover:bg-blue-50 rounded-lg text-center"
                >
                  Modifier
                </Link>
                {u.isActive && (
                  <button
                    onClick={() => setConfirmReset(u.id)}
                    className="text-xs text-orange-500 hover:text-orange-700 font-medium py-1 px-2 hover:bg-orange-50 rounded-lg"
                  >
                    Reset MDP
                  </button>
                )}
                {u.isActive ? (
                  <button
                    onClick={() => deactivateMutation.mutate(u.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium py-1 px-2 hover:bg-red-50 rounded-lg"
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateMutation.mutate(u.id)}
                    className="text-xs text-green-600 hover:text-green-800 font-medium py-1 px-2 hover:bg-green-50 rounded-lg"
                  >
                    Réactiver
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal
        isOpen={confirmReset !== null}
        title="Forcer le reset de mot de passe"
        message="L'utilisateur devra changer son mot de passe à la prochaine connexion."
        variant="warning"
        onConfirm={() => confirmReset && resetMutation.mutate(confirmReset)}
        onCancel={() => setConfirmReset(null)}
        isLoading={resetMutation.isPending}
      />
    </div>
  )
}