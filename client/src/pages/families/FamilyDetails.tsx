import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getFamily, deactivateFamily } from '../../api/families'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import type { Member } from '../../types'

export const FamilyDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showDeactivate, setShowDeactivate] = useState(false)
  const isAdmin = user?.role === 'admin'

  const { data: family, isLoading } = useQuery({
    queryKey: ['family', id],
    queryFn: () => getFamily(id!)
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateFamily(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['families'] })
      navigate('/families')
    }
  })

  if (isLoading) return <LoadingSpinner />
  if (!family) return <div className="p-4 text-red-600">Famille introuvable</div>

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {family.email && <span className="mr-4">✉ {family.email}</span>}
            {family.phone && <span>📞 {family.phone}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link
              to={`/families/${id}/modifier`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Modifier
            </Link>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowDeactivate(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Désactiver
            </button>
          )}
        </div>
      </div>

      {/* Membres */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Membres</h2>
          {isAdmin && (
            <Link
              to={`/members/nouveau?familyId=${id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter un membre
            </Link>
          )}
        </div>
        {family.members && family.members.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {family.members.map((m: Member) => (
              <li key={m.id} className="py-3 flex justify-between items-center">
                <Link
                  to={`/members/${m.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {m.firstName} {m.lastName}
                </Link>
                {m.birthDate && (
                  <span className="text-sm text-gray-400">
                    {new Date(m.birthDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">Aucun membre actif</p>
        )}
      </div>

      <ConfirmModal
        open={showDeactivate}
        title="Désactiver la famille"
        message={`Désactiver la famille « ${family.name} » ? Cette action est réversible.`}
        onConfirm={() => deactivateMutation.mutate()}
        onCancel={() => setShowDeactivate(false)}
      />
    </div>
  )
}