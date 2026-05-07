import { useRef, useState } from 'react'
import { importFamilies, importMembers, ImportResult } from '../api/imports'

interface ImportItem {
  label: string
  description: string
  hint: string
  fn: (file: File) => Promise<ImportResult>
  icon: string
  color: string
}

const importItems: ImportItem[] = [
  {
    label: 'Familles',
    description: 'Importer des familles depuis un fichier Excel',
    hint: 'Colonnes : Nom, Téléphone, Email, Adresse, Statut',
    fn: importFamilies,
    icon: '🏠',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    label: 'Membres',
    description: 'Importer des membres depuis un fichier Excel',
    hint: 'Colonnes : Prénom, Nom, Famille, Date de naissance, Poids (kg), Statut, Autonome',
    fn: importMembers,
    icon: '👥',
    color: 'bg-green-50 border-green-200 text-green-700',
  },
]

interface ItemState {
  loading: boolean
  result: ImportResult | null
  error: string | null
}

export const Import = () => {
  const [states, setStates] = useState<Record<string, ItemState>>(
    Object.fromEntries(importItems.map(i => [i.label, { loading: false, result: null, error: null }]))
  )
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileChange = async (label: string, fn: (file: File) => Promise<ImportResult>, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStates(prev => ({ ...prev, [label]: { loading: true, result: null, error: null } }))
    try {
      const result = await fn(file)
      setStates(prev => ({ ...prev, [label]: { loading: false, result, error: null } }))
    } catch {
      setStates(prev => ({ ...prev, [label]: { loading: false, result: null, error: `Erreur lors de l'import ${label}` } }))
    } finally {
      // Reset input so same file can be re-uploaded
      if (fileInputRefs.current[label]) fileInputRefs.current[label]!.value = ''
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import Excel</h1>
      <p className="text-sm text-gray-500">
        Importez des données depuis un fichier <code>.xlsx</code> exporté depuis ce système. La première ligne doit être l'en-tête.
      </p>

      <div className="grid gap-4">
        {importItems.map(({ label, description, hint, fn, icon, color }) => {
          const state = states[label]
          return (
            <div key={label} className={`rounded-2xl border ${color} p-4 space-y-3`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs opacity-70">{description}</div>
                  <div className="text-xs opacity-50 mt-0.5">{hint}</div>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".xlsx"
                    ref={el => { fileInputRefs.current[label] = el }}
                    onChange={e => handleFileChange(label, fn, e)}
                    className="hidden"
                    id={`file-input-${label}`}
                    disabled={state.loading}
                  />
                  <label
                    htmlFor={`file-input-${label}`}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer border transition-opacity ${
                      state.loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                    } ${color}`}
                  >
                    {state.loading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>📤</span>
                    )}
                    {state.loading ? 'Import...' : 'Choisir fichier'}
                  </label>
                </div>
              </div>

              {state.result && (
                <div className="bg-white/60 rounded-xl px-3 py-2 text-sm space-y-1">
                  <div className="flex gap-4 font-medium">
                    <span className="text-green-700">✓ {state.result.created} créé(s)</span>
                    {state.result.skipped > 0 && (
                      <span className="text-gray-500">— {state.result.skipped} ignoré(s)</span>
                    )}
                  </div>
                  {state.result.errors.length > 0 && (
                    <div className="text-red-600 text-xs space-y-0.5">
                      {state.result.errors.map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {state.error && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded-xl text-sm">
                  {state.error}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
