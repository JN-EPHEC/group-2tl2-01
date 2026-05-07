import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCourse, updateCourse, getCourse } from '../../api/courses'
import { getCourseTypes } from '../../api/courseTypes'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useEffect } from 'react'
import type { CourseType } from '../../types'

interface FormData {
  date: string
  time: string
  courseTypeId: string
  notes: string
}

export const CourseForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    }
  })

  const { data: courseTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['courseTypes'],
    queryFn: () => getCourseTypes()
  })
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id!),
    enabled: isEdit
  })

  useEffect(() => {
    if (course) {
      reset({
        date: course.date,
        time: course.time,
        courseTypeId: course.courseTypeId,
        notes: course.notes || ''
      })
    }
  }, [course, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? updateCourse(id!, { date: data.date, time: data.time, courseTypeId: data.courseTypeId, notes: data.notes })
        : createCourse({ date: data.date, time: data.time, courseTypeId: data.courseTypeId, notes: data.notes }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      navigate(isEdit ? `/courses/${id}` : `/courses/${data.id}`)
    }
  })

  if (typesLoading || courseLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier le cours' : 'Nouveau cours'}
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de cours *</label>
          <div className="grid grid-cols-2 gap-2">
            {(courseTypes as CourseType[]).map((ct) => (
              <label key={ct.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={ct.id}
                  {...register('courseTypeId', { required: 'Requis' })}
                  className="peer sr-only"
                />
                <div className="peer-checked:ring-2 peer-checked:ring-blue-500 border border-gray-200 rounded-xl p-3 flex items-center gap-2 hover:bg-gray-50">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ct.color || '#6B7280' }} />
                  <span className="text-sm font-medium">{ct.name}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.courseTypeId && (
            <p className="text-red-500 text-xs mt-1">{errors.courseTypeId.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              {...register('date', { required: 'Requis' })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
            <input
              type="time"
              {...register('time', { required: 'Requis' })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        {mutation.error && (
          <div className="text-red-500 text-sm">
            {(mutation.error as { response?: { data?: { error?: string } } }).response?.data?.error}
          </div>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {mutation.isPending ? '...' : isEdit ? 'Enregistrer' : 'Créer et prendre les présences'}
        </button>
      </form>
    </div>
  )
}