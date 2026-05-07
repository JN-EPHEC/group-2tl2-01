import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getFamily, addCredits, deactivateFamily, getFamilyAttendances, updateFamilyContact } from '../../api/families'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import type { Member, CreditPurchase } from '../../types'

export const FamilyDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [creditAmount, setCreditAmount] = useState(10)
  const [creditNote, setCreditNote] = useState('')
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [showAttendances, setShowAttendances] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [contactError, setContactError] = useState<string | null>(null)
  const isAdmin = user?.role === 'admin'
  const isAdminOrCoach = isAdmin || user?.role === 'coach'
  const isFamily = user?.role === 'family'

  const { data: family, isLoading } = useQuery({
    queryKey: ['family', id],
    queryFn: () => getFamily(id!)
  })

  const { data: familyAttendances = [], isLoading: attendancesLoading } = useQuery({
    queryKey: ['family-attendances', id],
    queryFn: () => getFamilyAttendances(id!),
    enabled: showAttendances
  })

  const creditsMutation = useMutation({
    mutationFn: () => addCredits(id!, { amount: creditAmount, note: creditNote }),
    onSuccess: () => {
      // Invalide la famille ET la liste des membres (leurs crédits sont liés)
      qc.invalidateQueries({ queryKey: ['family', id] })
      qc.invalidateQueries({ queryKey: ['members'] })
      setShowCreditsModal(false)
      setCreditNote('')
    }
  })

  const contactMutation = useMutation({
    mutationFn: (payload: { phone?: string; email?: string }) => updateFamilyContact(id!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family', id] })
      setEditingPhone(false)
      setEditingEmail(false)
      setContactError(null)
    },
    onError: (err: any) => {
      setContactError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    }
  })

  const savePhone = () => {
    const v = phoneInput.trim()
    if (v && !/^[0-9\s\+\-\(\)\.]+$/.test(v)) { setContactError('Numéro invalide (chiffres uniquement)'); return }
    if (v && v.length < 7) { setContactError('Numéro trop court'); return }
    setContactError(null)
    contactMutation.mutate({ phone: v || '' })
  }

  const saveEmail = () => {
    const v = emailInput.trim()
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setContactError('Email invalide'); return }
    setContactError(null)
    contactMutation.mutate({ email: v || '' })
  }

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateFamily(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['families'] })
      navigate('/families')
    }
  })

  if (isLoading) return <LoadingSpinner />
  if (!family) return <div className="text-center py-12 text-gray-400">Famille non trouvée</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
          {!family.isActive && <span className="text-xs text-red-500 font-medium">Inactif</span>}
        </div>
        {isAdmin && (
          <Link to={`/families/${id}/modifier`} className="text-sm text-blue-600 font-medium">
            Modifier
          </Link>
        )}
      </div>

      {/* Credits */}
      {(() => {
        const c = family.totalCredits
        const bg    = c > 0 ? 'bg-green-50 border-green-200'   : c < 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
        const color = c > 0 ? 'text-green-600'                 : c < 0 ? 'text-orange-500'                : 'text-gray-500'
        return (
          <div className={`rounded-2xl p-6 text-center border ${bg}`}>
            <div className={`text-5xl font-black ${color}`}>{c}</div>
            <div className="text-gray-600 mt-1">
              {c < 0 ? '⚠️ solde négatif — paiement en attente' : 'crédits disponibles'}
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowCreditsModal(true)}
                className="mt-3 bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-green-700"
              >
                + Ajouter des crédits
              </button>
            )}
          </div>
        )
      })()}

      {/* Info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-bold text-gray-900">Informations</h2>

        {/* Téléphone */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-12 flex-shrink-0">Tél:</span>
          {editingPhone ? (
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => { setPhoneInput(e.target.value); setContactError(null) }}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0477 12 34 56"
                  autoFocus
                />
                <button onClick={savePhone} disabled={contactMutation.isPending} className="text-xs text-white bg-blue-600 px-2 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {contactMutation.isPending ? '…' : 'OK'}
                </button>
                <button onClick={() => { setEditingPhone(false); setContactError(null) }} className="text-xs text-gray-500 hover:text-gray-700">Annuler</button>
              </div>
              {contactError && <p className="text-red-500 text-xs">{contactError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{family.phone || <span className="text-gray-400 italic">Non renseigné</span>}</span>
              {isFamily && (
                <button onClick={() => { setPhoneInput(family.phone || ''); setEditingPhone(true) }} className="text-xs text-blue-500 hover:text-blue-700">Modifier</button>
              )}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-12 flex-shrink-0">Email:</span>
          {editingEmail ? (
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setContactError(null) }}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="exemple@email.com"
                  autoFocus
                />
                <button onClick={saveEmail} disabled={contactMutation.isPending} className="text-xs text-white bg-blue-600 px-2 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {contactMutation.isPending ? '…' : 'OK'}
                </button>
                <button onClick={() => { setEditingEmail(false); setContactError(null) }} className="text-xs text-gray-500 hover:text-gray-700">Annuler</button>
              </div>
              {contactError && <p className="text-red-500 text-xs">{contactError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{family.email || <span className="text-gray-400 italic">Non renseigné</span>}</span>
              {isFamily && (
                <button onClick={() => { setEmailInput(family.email || ''); setEditingEmail(true) }} className="text-xs text-blue-500 hover:text-blue-700">Modifier</button>
              )}
            </div>
          )}
        </div>

        {family.address && (
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500 w-12 flex-shrink-0">Adresse:</span>
            <span>{family.address}</span>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            Membres ({family.members?.length ?? 0})
          </h2>
          {(isAdmin || user?.role === 'coach') && (
            <Link to={`/members/nouveau?familyId=${id}`} className="text-sm text-blue-600 font-medium">
              + Ajouter
            </Link>
          )}
        </div>
        {!family.members || family.members.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">Aucun membre</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {family.members.map((m: Member) => (
              <Link
                key={m.id}
                to={`/members/${m.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{m.firstName} {m.lastName}</div>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Credit history */}
      {family.creditHistory && family.creditHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Historique des crédits</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {family.creditHistory.slice(0, 10).map((cp: CreditPurchase) => (
              <div key={cp.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">+{cp.amount} cours</div>
                  <div className="text-xs text-gray-500">
                    {cp.note || 'Sans note'} · {new Date(cp.purchaseDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Restant: {cp.remaining}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance history */}
      {isAdminOrCoach && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setShowAttendances(h => !h)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <h2 className="font-bold text-gray-900">Historique des présences</h2>
            <span className="text-gray-400 text-sm">{showAttendances ? '▲' : '▼'}</span>
          </button>
          {showAttendances && (
            <div className="border-t border-gray-100">
              {attendancesLoading ? (
                <div className="p-6 text-center text-gray-400 text-sm">Chargement…</div>
              ) : (familyAttendances as any[]).length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">Aucune présence enregistrée</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {(familyAttendances as any[]).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {a.member?.firstName} {a.member?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {a.course?.courseType?.name ?? '—'} ·{' '}
                          {a.course?.date ? new Date(a.course.date).toLocaleDateString('fr-FR') : '—'}
                          {a.course?.time ? ` ${a.course.time}` : ''}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${a.creditPurchaseId ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                        {a.creditPurchaseId ? 'Crédit' : 'Dette'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isAdmin && family.isActive && (
        <button
          onClick={() => setShowDeactivate(true)}
          className="w-full py-3 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50"
        >
          Désactiver cette famille
        </button>
      )}

      {/* Credits modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold">Ajouter des crédits</h2>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Nombre de cours</label>
              <div className="flex gap-2">
                {[10, 20, 30].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCreditAmount(n)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border ${
                      creditAmount === n
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    +{n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Note (optionnel)</label>
              <input
                value={creditNote}
                onChange={e => setCreditNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Paiement espèces"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreditsModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => creditsMutation.mutate()}
                disabled={creditsMutation.isPending}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
              >
                {creditsMutation.isPending ? '...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeactivate}
        title="Désactiver la famille"
        message={`Voulez-vous désactiver ${family.name} ?`}
        onConfirm={() => deactivateMutation.mutate()}
        onCancel={() => setShowDeactivate(false)}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  )
}
