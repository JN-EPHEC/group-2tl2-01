import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'

interface FormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ChangePassword = () => {
  const { changePassword, user } = useAuth()
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>()

  const isForced = user?.forcePasswordChange === true

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/courses'), 1500)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setApiError(err.response?.data?.error || 'Erreur lors du changement de mot de passe')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        {!isForced && (
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          {isForced ? 'Changement de mot de passe requis' : 'Changer mon mot de passe'}
        </h1>
      </div>

      {isForced && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          ⚠️ Votre administrateur vous demande de changer votre mot de passe avant de continuer.
        </div>
      )}

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-6 text-center text-green-700">
          <div className="text-3xl mb-2">✅</div>
          <div className="font-semibold">Mot de passe modifié avec succès !</div>
          <div className="text-sm mt-1 text-green-600">Redirection en cours…</div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel *</label>
            <input
              type="password"
              autoComplete="current-password"
              {...register('currentPassword', { required: 'Requis' })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe *</label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('newPassword', { required: 'Requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Requis',
                validate: v => v === watch('newPassword') || 'Les mots de passe ne correspondent pas'
              })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          {apiError && (
            <div className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{apiError}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      )}
    </div>
  )
}