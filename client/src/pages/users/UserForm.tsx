import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, updateUser, getUsers } from '../../api/users'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useEffect } from 'react'
import type { User } from '../../types'

interface FormData {
  email: string
  password: string
  role: string
  firstName: string
  lastName: string
}

export const UserForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isEdit
  })

  useEffect(() => {
    if (isEdit && users.length) {
      const u = (users as User[]).find((u) => u.id === id)
      if (u) {
        reset({
          email: u.email,
          role: u.role,
          firstName: u.firstName,
          lastName: u.lastName,
        })
      }
    }
  }, [users, id, isEdit, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: Record<string, unknown> = {
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      }
      if (!isEdit && data.password) payload.password = data.password
      return isEdit
        ? updateUser(id!, payload as Parameters<typeof updateUser>[1])
        : createUser(payload as unknown as Parameters<typeof createUser>[0])
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(d => mutation.mutate(d))}
        className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            {...register('email', { required: 'Requis' })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              {...register('password', {
                required: !isEdit ? 'Requis' : false,
                minLength: { value: 8, message: 'Min. 8 caractères' }
              })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
          <select
            {...register('role', { required: 'Requis' })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Sélectionner</option>
            <option value="admin">Administrateur</option>
            <option value="coach">Entraîneur</option>
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
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
          {mutation.isPending ? 'Enregistrement...' : isEdit ? 'Enregistrer' : "Créer l'utilisateur"}
        </button>
      </form>
    </div>
  )
}