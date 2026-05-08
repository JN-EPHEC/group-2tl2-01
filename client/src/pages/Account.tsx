import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getFamily, updateFamilyContact } from '../api/families'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const Account = () => {
  const { user, changePassword } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [familyEmailInput, setFamilyEmailInput] = useState('')
  const [editingFamilyEmail, setEditingFamilyEmail] = useState(false)
  const [familyEmailError, setFamilyEmailError] = useState('')
  const [familyPhoneInput, setFamilyPhoneInput] = useState('')
  const [editingFamilyPhone, setEditingFamilyPhone] = useState(false)
  const [familyPhoneError, setFamilyPhoneError] = useState('')
  const [familyContactSuccess, setFamilyContactSuccess] = useState(false)

  const isFamily = user?.role === 'family'

  const { data: family } = useQuery({
    queryKey: ['family', user?.familyId],
    queryFn: () => getFamily(user!.familyId!),
    enabled: isFamily && !!user?.familyId,
  })

  const familyContactMutation = useMutation({
    mutationFn: (payload: { email?: string; phone?: string }) => updateFamilyContact(user!.familyId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family', user?.familyId] })
      setEditingFamilyEmail(false)
      setEditingFamilyPhone(false)
      setFamilyEmailError('')
      setFamilyPhoneError('')
      setFamilyContactSuccess(true)
      setTimeout(() => setFamilyContactSuccess(false), 3000)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Erreur lors de la mise à jour'
      setFamilyEmailError(msg)
      setFamilyPhoneError(msg)
    }
  })

  const saveFamilyEmail = () => {
    const v = familyEmailInput.trim()
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setFamilyEmailError('Email invalide')
      return
    }
    setFamilyEmailError('')
    familyContactMutation.mutate({ email: v })
  }

  const saveFamilyPhone = () => {
    const v = familyPhoneInput.trim()
    if (v && !/^[0-9\s\+\-\(\)\.]+$/.test(v)) {
      setFamilyPhoneError('Numéro invalide (chiffres uniquement)')
      return
    }
    if (v && v.length < 7) {
      setFamilyPhoneError('Numéro trop court')
      return
    }
    setFamilyPhoneError('')
    familyContactMutation.mutate({ phone: v })
  }

  const passwordForm = useForm<PasswordForm>()

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordError('')
    setPasswordSuccess(false)
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      setPasswordSuccess(true)
      passwordForm.reset()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setPasswordError(err.response?.data?.error || 'Erreur lors du changement de mot de passe')
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-1">
        <div className="text-sm text-gray-500">Connecté en tant que</div>
        <div className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</div>
        <div className="text-sm text-gray-500">{user?.email}</div>
      </div>

      {/* Coordonnées famille */}
      {isFamily && family && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900">Coordonnées</h2>

          {familyContactSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              ✅ Coordonnées mises à jour
            </div>
          )}

          {/* Téléphone — modifiable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            {editingFamilyPhone ? (
              <div className="space-y-2">
                <input
                  type="tel"
                  value={familyPhoneInput}
                  onChange={e => { setFamilyPhoneInput(e.target.value); setFamilyPhoneError('') }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0477 12 34 56"
                  autoFocus
                />
                {familyPhoneError && <p className="text-red-500 text-xs">{familyPhoneError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveFamilyPhone}
                    disabled={familyContactMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    {familyContactMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => { setEditingFamilyPhone(false); setFamilyPhoneError('') }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                  {family.phone || <span className="italic text-gray-400">Non renseigné</span>}
                </div>
                <button
                  onClick={() => { setFamilyPhoneInput(family.phone || ''); setEditingFamilyPhone(true) }}
                  className="text-sm text-blue-600 font-medium hover:text-blue-800 whitespace-nowrap"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>

          {/* Email famille — modifiable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de la famille</label>
            {editingFamilyEmail ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={familyEmailInput}
                  onChange={e => { setFamilyEmailInput(e.target.value); setFamilyEmailError('') }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="exemple@email.com"
                  autoFocus
                />
                {familyEmailError && <p className="text-red-500 text-xs">{familyEmailError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveFamilyEmail}
                    disabled={familyContactMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    {familyContactMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => { setEditingFamilyEmail(false); setFamilyEmailError('') }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                  {family.email || <span className="italic text-gray-400">Non renseigné</span>}
                </div>
                <button
                  onClick={() => { setFamilyEmailInput(family.email || ''); setEditingFamilyEmail(true) }}
                  className="text-sm text-blue-600 font-medium hover:text-blue-800 whitespace-nowrap"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mot de passe */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-900">Mot de passe</h2>
        {passwordSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            ✅ Mot de passe modifié avec succès
          </div>
        )}
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel *</label>
            <input
              type="password"
              autoComplete="current-password"
              {...passwordForm.register('currentPassword', { required: 'Requis' })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe *</label>
            <input
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('newPassword', {
                required: 'Requis',
                minLength: { value: 6, message: 'Minimum 6 caractères' }
              })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('confirmPassword', {
                required: 'Requis',
                validate: v => v === passwordForm.watch('newPassword') || 'Les mots de passe ne correspondent pas'
              })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          {passwordError && <div className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{passwordError}</div>}
          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {passwordForm.formState.isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}