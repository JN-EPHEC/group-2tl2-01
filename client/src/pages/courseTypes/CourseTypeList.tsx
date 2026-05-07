import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getCourseTypes, createCourseType, updateCourseType, deactivateCourseType, reactivateCourseType } from '../../api/courseTypes'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useForm } from 'react-hook-form'
import type { CourseType } from '../../types'

interface FormData { name: string; color: string }

export const CourseTypeList = () => {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const { data: courseTypes = [], isLoading } = useQuery({
    queryKey: ['courseTypes', showInactive],
    queryFn: () => getCourseTypes(showInactive)
  })

  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: { color: '#3B82F6' }
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      editId
        ? updateCourseType(editId, data)
        : createCourseType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courseTypes'] })
      setShowForm(false)
      setEditId(null)
      reset()
    }
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateCourseType,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courseTypes'] })
  })

  const reactivateMutation = useMutation({
    mutationFn: reactivateCourseType,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courseTypes'] })
  })

  const startEdit = (ct: CourseType) => {
    setEditId(ct.id)
    setValue('name', ct.name)
    setValue('color', ct.color || '#3B82F6')
    setShowForm(true)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Types de cours</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); reset() }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          + Nouveau
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={e => setShowInactive(e.target.checked)}
          className="rounded"
        />
        Afficher les types désactivés
      </label>

      {showForm && (
        <form
          onSubmit={handleSubmit(d => createMutation.mutate(d))}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
        >
          <h2 className="font-bold text-gray-900">{editId ? 'Modifier' : 'Nouveau type'}</h2>
          <div className="flex gap-3">
            <input
              {...register('name', { required: true })}
              placeholder="Nom du type (ex: Judo)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="color"
              {...register('color')}
              className="w-14 h-12 border border-gray-200 rounded-xl cursor-pointer p-1"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditId(null) }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {createMutation.isPending ? '...' : editId ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {(courseTypes as CourseType[]).map((ct) => (
          <div
            key={ct.id}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 ${!ct.isActive ? 'opacity-60' : ''}`}
          >
            <div
              className="w-4 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: ct.isActive ? (ct.color || '#6B7280') : '#9CA3AF' }}
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{ct.name}</span>
              {!ct.isActive && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Désactivé</span>
              )}
            </div>
            {ct.isActive ? (
              <>
                <button
                  onClick={() => startEdit(ct)}
                  className="text-sm text-blue-600 px-3 py-1.5 hover:bg-blue-50 rounded-lg"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deactivateMutation.mutate(ct.id)}
                  disabled={deactivateMutation.isPending}
                  className="text-sm text-red-500 px-3 py-1.5 hover:bg-red-50 rounded-lg"
                >
                  Désactiver
                </button>
              </>
            ) : (
              <button
                onClick={() => reactivateMutation.mutate(ct.id)}
                disabled={reactivateMutation.isPending}
                className="text-sm text-green-600 px-3 py-1.5 hover:bg-green-50 rounded-lg font-medium"
              >
                Réactiver
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
