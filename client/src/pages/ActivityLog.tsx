import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getActivityLog } from '../api/activityLog'
import LoadingSpinner from '../components/LoadingSpinner'
import type { ActivityLogEntry } from '../types'

const actionLabels: Record<string, { label: string; icon: string }> = {
  LOGIN: { label: 'Connexion', icon: '🔐' },
  ADD_CREDITS: { label: 'Ajout crédits', icon: '💳' },
  CREATE_COURSE: { label: 'Cours créé', icon: '📋' },
  ADD_ATTENDANCE: { label: 'Présence ajoutée', icon: '✅' },
  REMOVE_ATTENDANCE: { label: 'Présence supprimée', icon: '❌' },
  UPDATE_PROFILE: { label: 'Profil modifié', icon: '✏️' },
  CHANGE_PASSWORD: { label: 'Mot de passe changé', icon: '🔑' },
  FORCE_PASSWORD_RESET: { label: 'Reset MDP forcé', icon: '⚠️' },
  DEACTIVATE_ACCOUNT: { label: 'Compte désactivé', icon: '🚫' },
  CREATE_USER: { label: 'Utilisateur créé', icon: '👤' },
  CREATE_FAMILY: { label: 'Famille créée', icon: '🏠' },
  CREATE_MEMBER: { label: 'Membre créé', icon: '👥' },
  MAKE_AUTONOMOUS: { label: 'Rendu autonome', icon: '🔓' },
}

export const ActivityLog = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['activity-log', page],
    queryFn: () => getActivityLog(page, 30)
  })

  if (isLoading) return <LoadingSpinner />

  // Normalize response shape — backend may return { data, total, page, limit } or { logs, totalPages }
  const logs: ActivityLogEntry[] = (data as unknown as { logs?: ActivityLogEntry[]; data?: ActivityLogEntry[] })?.logs
    ?? (data as unknown as { data?: ActivityLogEntry[] })?.data
    ?? []
  const totalPages = (data as unknown as { totalPages?: number })?.totalPages
    ?? Math.ceil(((data as unknown as { total?: number })?.total ?? 0) / 30)
    ?? 1

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Journal d'activité</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune activité enregistrée</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log: ActivityLogEntry) => {
              const info = actionLabels[log.action] || { label: log.action, icon: '📌' }
              return (
                <div key={log.id} className="p-4 flex gap-3">
                  <span className="text-2xl flex-shrink-0">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 text-sm">{info.label}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(log.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{log.details}</p>
                    )}
                    {log.user && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {log.user.firstName} {log.user.lastName}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
