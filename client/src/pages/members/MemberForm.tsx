import { useForm } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createMember, updateMember, getMember } from '../../api/members'
import { getFamilies } from '../../api/families.ts'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useEffect } from 'react'
import type { Family } from '../../types'

interface FormData {
  firstName: string
  lastName: string
  familyId: string
  birthDate: string
  weight: string
}

export const MemberForm = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { familyId: searchParams.get('familyId') || '' }
  })

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id!),
    enabled: isEdit
  })
  const { data: families = [], isLoading: familiesLoading } = useQuery({
    queryKey: ['families'],
    queryFn: getFamilies
  })

  useEffect(() => {
    if (member) {
      reset({
        firstName: member.firstName,
        lastName: member.lastName,
        familyId: member.familyId,
        birthDate: member.birthDate ? String(member.birthDate).split('T')[0] : '',
        weight: member.weight ? String(member.weight) : '',
      })
    }
  }, [member, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        familyId: data.familyId,
        birthDate: data.birthDate || undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined
      }
      return isEdit ? updateMember(id!, payload) : createMember(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      navigate('/members')
    }
  })

  if (memberLoading || familiesLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier le membre' : 'Nouveau membre'}
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input
            {...register('firstName', { required: 'Requis' })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            {...register('lastName', { required: 'Requis' })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Famille *</label>
          <select
            {...register('familyId', { required: 'Requis' })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Sélectionner une famille</option>
            {families.map((f: Family) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {errors.familyId && <p className="text-red-500 text-xs mt-1">{errors.familyId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
          <input
            type="date"
            {...register('birthDate', {
              validate: v => !v || new Date(v) <= new Date() || 'La date ne peut pas être dans le futur'
            })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            {...register('weight', {
              min: { value: 0.1, message: 'Le poids doit être positif' },
              max: { value: 500, message: 'Poids invalide (max 500 kg)' },
              validate: v => !v || !isNaN(parseFloat(v)) || 'Valeur numérique requise'
            })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
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
          {mutation.isPending ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le membre'}
        </button>
      </form>
    </div>
  )
}
