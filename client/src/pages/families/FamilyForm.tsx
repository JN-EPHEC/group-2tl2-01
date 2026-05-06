import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFamily, updateFamily, getFamily } from '../../api/families'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'

interface FormData {
  name: string
  phone: string
  email: string
  address: string
  responsibleFirstName: string
  responsibleLastName: string
  responsibleEmail: string
  responsiblePassword: string
}

export const FamilyForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormData>()

  const responsibleLastName = useWatch({ control, name: 'responsibleLastName' })
  useEffect(() => {
    if (!isEdit && responsibleLastName) {
      setValue('name', `Famille ${responsibleLastName}`)
    }
  }, [responsibleLastName, isEdit, setValue])

  const { data: family, isLoading } = useQuery({
    queryKey: ['family', id],
    queryFn: () => getFamily(id!),
    enabled: isEdit
  })

  useEffect(() => {
    if (family) {
      reset({
        name: family.name,
        phone: family.phone || '',
        email: family.email || '',
        address: family.address || ''
      })
    }
  }, [family, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? updateFamily(id!, { name: data.name, phone: data.phone, email: data.email, address: data.address })
        : createFamily({
            name: data.name,
            phone: data.phone,
            email: data.responsibleEmail,
            address: data.address,
            responsibleFirstName: data.responsibleFirstName,
            responsibleLastName: data.responsibleLastName,
            responsibleEmail: data.responsibleEmail,
            responsiblePassword: data.responsiblePassword,
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['families'] })
      navigate('/families')
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier la famille' : 'Nouvelle famille'}
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
      >
        {/* Nom et email de la famille — uniquement en mode édition */}
        {isEdit && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la famille *</label>
              <input
                {...register('name', { required: 'Requis' })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Famille Dupont"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de la famille</label>
              <input
                {...register('email', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' }
                })}
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            {...register('phone', {
              pattern: { value: /^[0-9\s\+\-\(\)\.]*$/, message: 'Numéro invalide (chiffres uniquement)' },
              minLength: { value: 7, message: 'Numéro trop court' }
            })}
            type="tel"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0477 12 34 56"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <textarea
            {...register('address')}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Responsible user account — only on create */}
        {!isEdit && (
          <>
            <div className="border-t border-gray-100 pt-4">
              <h2 className="font-semibold text-gray-800 mb-1">Compte du responsable</h2>
              <p className="text-xs text-gray-500 mb-3">
                Un compte sera créé pour que le responsable puisse se connecter et suivre la famille.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  {...register('responsibleFirstName', { required: 'Requis' })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean"
                />
                {errors.responsibleFirstName && <p className="text-red-500 text-xs mt-1">{errors.responsibleFirstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  {...register('responsibleLastName', { required: 'Requis' })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dupont"
                />
                {errors.responsibleLastName && <p className="text-red-500 text-xs mt-1">{errors.responsibleLastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de connexion *</label>
              <input
                {...register('responsibleEmail', {
                  required: 'Requis',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' }
                })}
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jean.dupont@email.com"
              />
              {errors.responsibleEmail && <p className="text-red-500 text-xs mt-1">{errors.responsibleEmail.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input
                {...register('responsiblePassword', {
                  required: 'Requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' }
                })}
                type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {errors.responsiblePassword && <p className="text-red-500 text-xs mt-1">{errors.responsiblePassword.message}</p>}
            </div>
          </>
        )}

        {mutation.error && (
          <div className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">
            {(mutation.error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Une erreur est survenue'}
          </div>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {mutation.isPending ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer la famille'}
        </button>
      </form>
    </div>
  )
}