import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { getMember, deactivateMember, changeMemberFamily, uploadMemberPhoto, getMemberAttendances, updateMemberWeight } from '../../api/members'
import { getFamilies } from '../../api/families'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import type { CreditPurchase } from '../../types'

export const MemberDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [editingWeight, setEditingWeight] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isAdmin = user?.role === 'admin'
  const isAdminOrCoach = isAdmin || user?.role === 'coach'
  const isFamily = user?.role === 'family'

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => getMember(id!)
  })

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: getFamilies,
    enabled: showFamilyModal
  })

  const { data: attendances = [], isLoading: historyLoading } = useQuery({
    queryKey: ['member-attendances', id],
    queryFn: () => getMemberAttendances(id!),
    enabled: showHistory
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateMember(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      navigate('/members')
    }
  })

  const changeFamilyMutation = useMutation({
    mutationFn: () => changeMemberFamily(id!, {
      familyId: selectedFamilyId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['member', id] })
      qc.invalidateQueries({ queryKey: ['members'] })
      setShowFamilyModal(false)
    }
  })

  const photoMutation = useMutation({
    mutationFn: (file: File) => uploadMemberPhoto(id!, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['member', id] })
  })

  const weightMutation = useMutation({
    mutationFn: (weight: number | null) => updateMemberWeight(id!, weight),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['member', id] })
      setEditingWeight(false)
    }
  })

  const [weightError, setWeightError] = useState<string | null>(null)

  const handleWeightSave = () => {
    const val = weightInput.trim()
    if (val) {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) { setWeightError('Le poids doit être un nombre positif'); return }
      if (num > 500) { setWeightError('Poids invalide (max 500 kg)'); return }
    }
    setWeightError(null)
    weightMutation.mutate(val ? parseFloat(val) : null)
  }

  const openFamilyModal = () => {
    setSelectedFamilyId(member?.familyId || '')
    setShowFamilyModal(true)
  }

  if (isLoading) return <LoadingSpinner />
  if (!member) return <div className="text-center py-12 text-gray-400">Membre non trouvé</div>

  const creditPurchases = (member as unknown as { creditPurchases?: CreditPurchase[] }).creditPurchases
  const credits = member.availableCredits ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">←</button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h1>
          {!member.isActive && (
            <div className="mt-1">
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactif</span>
            </div>
          )}
        </div>
        {isAdminOrCoach && (
          <Link to={`/members/${id}/modifier`} className="text-sm text-blue-600 font-medium">
            Modifier
          </Link>
        )}
      </div>

      {/* Photo + credits */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-6 items-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            {member.photo
              ? <img src={`/uploads/${member.photo}`} alt="" className="w-full h-full object-cover" />
              : <span className="text-4xl">👤</span>
            }
          </div>
          {isAdminOrCoach && (
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              +
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) photoMutation.mutate(f)
            }}
          />
        </div>
        <div>
          <div className="text-sm text-gray-500">Crédits disponibles</div>
          <div className={`text-4xl font-black ${credits > 0 ? 'text-green-600' : credits < 0 ? 'text-orange-500' : 'text-gray-400'}`}>
            {credits}
          </div>
          {credits < 0 && <div className="text-xs text-orange-500 mt-0.5">⚠️ paiement en attente</div>}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-bold text-gray-900">Informations</h2>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500">Famille:</span>
          <Link to={`/families/${member.familyId}`} className="text-blue-600">
            {(member as any).family?.name || member.familyName || member.familyId}
          </Link>
        </div>
        {member.birthDate && (
          <div className="flex gap-2 text-sm">
            <span className="text-gray-500">Naissance:</span>
            <span>{new Date(member.birthDate).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Poids:</span>
          {editingWeight ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={weightInput}
                onChange={e => { setWeightInput(e.target.value); setWeightError(null) }}
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="kg"
                autoFocus
              />
              <button
                onClick={handleWeightSave}
                disabled={weightMutation.isPending}
                className="text-xs text-white bg-blue-600 px-2 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {weightMutation.isPending ? '…' : 'OK'}
              </button>
              <button
                onClick={() => { setEditingWeight(false); setWeightError(null) }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Annuler
              </button>
            </div>
            {weightError && <p className="text-red-500 text-xs">{weightError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{member.weight ? `${member.weight} kg` : '—'}</span>
              {(isAdminOrCoach || isFamily) && (
                <button
                  onClick={() => { setWeightInput(member.weight ? String(member.weight) : ''); setEditingWeight(true) }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Modifier
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Credit history */}
      {creditPurchases && creditPurchases.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Crédits</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {creditPurchases.slice(0, 5).map((cp: CreditPurchase) => (
              <div key={cp.id} className="flex justify-between p-4 text-sm">
                <div>
                  <div className="font-medium text-green-600">+{cp.amount} cours</div>
                  <div className="text-xs text-gray-400">
                    {new Date(cp.purchaseDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="text-gray-600">Restant: {cp.remaining}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance history */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => setShowHistory(h => !h)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h2 className="font-bold text-gray-900">Historique des présences</h2>
          <span className="text-gray-400 text-sm">{showHistory ? '▲' : '▼'}</span>
        </button>
        {showHistory && (
          <div className="border-t border-gray-100">
            {historyLoading ? (
              <div className="p-6 text-center text-gray-400 text-sm">Chargement…</div>
            ) : attendances.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Aucune présence enregistrée</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {(attendances as any[]).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">
                        {a.course?.courseType?.name ?? '—'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {a.course?.date ? new Date(a.course.date).toLocaleDateString('fr-FR') : '—'}
                        {a.course?.time ? ` · ${a.course.time}` : ''}
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

      {isAdmin && member.isActive && (
        <div className="space-y-3">
          <button
            onClick={openFamilyModal}
            className="w-full py-3 border border-purple-300 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-50"
          >
            Changer de famille
          </button>
          <button
            onClick={() => setShowDeactivate(true)}
            className="w-full py-3 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50"
          >
            Désactiver ce membre
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeactivate}
        title="Désactiver"
        message={`Désactiver ${member.firstName} ${member.lastName} ?`}
        onConfirm={() => deactivateMutation.mutate()}
        onCancel={() => setShowDeactivate(false)}
        isLoading={deactivateMutation.isPending}
      />

      {/* Change family modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Changer de famille</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Famille *</label>
              <select
                value={selectedFamilyId}
                onChange={e => setSelectedFamilyId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une famille…</option>
                {(families as any[]).map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {changeFamilyMutation.error && (
              <p className="text-red-500 text-sm">
                {(changeFamilyMutation.error as any).response?.data?.error || 'Erreur'}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFamilyModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => changeFamilyMutation.mutate()}
                disabled={changeFamilyMutation.isPending || !selectedFamilyId}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
              >
                {changeFamilyMutation.isPending ? '...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}