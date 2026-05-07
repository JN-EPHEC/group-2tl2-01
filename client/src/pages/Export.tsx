import { useState } from 'react'
import { exportFamilies, exportMembers, exportAttendances, exportCredits, exportActivityLog } from '../api/exports'

const exportItems = [
  {
    label: 'Familles',
    description: 'Liste de toutes les familles avec leurs crédits',
    fn: exportFamilies,
    icon: '🏠',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    label: 'Membres',
    description: 'Liste de tous les membres avec informations',
    fn: exportMembers,
    icon: '👥',
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    label: 'Présences',
    description: 'Historique complet de toutes les présences',
    fn: exportAttendances,
    icon: '✅',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    label: 'Crédits',
    description: 'Historique des achats de crédits',
    fn: exportCredits,
    icon: '💳',
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  {
    label: 'Journal',
    description: 'Journal complet des activités',
    fn: exportActivityLog,
    icon: '📜',
    color: 'bg-gray-50 border-gray-200 text-gray-700'
  },
]

export const Export = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (name: string, fn: () => Promise<void>) => {
    setLoading(name)
    setError(null)
    try {
      await fn()
    } catch {
      setError(`Erreur lors de l'export ${name}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Export Excel</h1>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      <div className="grid gap-3">
        {exportItems.map(({ label, description, fn, icon, color }) => (
          <button
            key={label}
            onClick={() => handleExport(label, fn)}
            disabled={loading !== null}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${color} hover:opacity-80 transition-opacity disabled:opacity-50 text-left`}
          >
            <span className="text-3xl">{icon}</span>
            <div className="flex-1">
              <div className="font-semibold">{label}</div>
              <div className="text-xs opacity-70">{description}</div>
            </div>
            {loading === label ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">📥</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
