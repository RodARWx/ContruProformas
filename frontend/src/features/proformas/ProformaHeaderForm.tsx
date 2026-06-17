import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Section, Select, Switch, TextArea } from '../../components/ui'
import { useProformaDraft } from '../../context/ProformaDraftContext'
import { fetchCustomers } from '../../features/customers/customersApi'
import {
  checkProformaIdAvailability,
  fetchNextProformaId,
  getIdConflictMessage,
} from '../../features/proformas/proformasApi'
import { fetchProfiles } from '../../features/profiles/profilesApi'
import { getApiErrorMessage } from '../../lib/api'
import { notify } from '../../lib/toast'
import type { Customer } from '../../types/customer'
import type { Profile } from '../../types/profile'

export function ProformaHeaderForm() {
  const {
    header,
    editingProformaId,
    isReadOnly,
    headerFieldErrors,
    setHeader,
    setHeaderFieldErrors,
  } = useProformaDraft()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoadingRefs, setIsLoadingRefs] = useState(true)
  const [isCheckingId, setIsCheckingId] = useState(false)
  const [idConflictMessage, setIdConflictMessage] = useState<string | undefined>()

  const isIdLocked = Boolean(editingProformaId)
  const disabled = isReadOnly || isLoadingRefs

  const loadSuggestedId = useCallback(async () => {
    try {
      const { suggestedId } = await fetchNextProformaId()
      setHeader({ suggestedId, idProforma: header.idProforma || suggestedId })
      return suggestedId
    } catch (error) {
      notify.error('No se pudo obtener el ID sugerido', getApiErrorMessage(error))
      return header.suggestedId
    }
  }, [header.idProforma, header.suggestedId, setHeader])

  useEffect(() => {
    if (editingProformaId) {
      void Promise.all([fetchCustomers(), fetchProfiles()])
        .then(([customerList, profileList]) => {
          setCustomers(customerList)
          setProfiles(profileList)
        })
        .catch((error) => {
          notify.error('Error al cargar datos', getApiErrorMessage(error))
        })
        .finally(() => setIsLoadingRefs(false))
      return
    }

    let cancelled = false

    async function loadReferences() {
      setIsLoadingRefs(true)
      try {
        const [customerList, profileList, nextId] = await Promise.all([
          fetchCustomers(),
          fetchProfiles(),
          fetchNextProformaId(),
        ])

        if (cancelled) return

        setCustomers(customerList)
        setProfiles(profileList)

        setHeader((current) => ({
          suggestedId: nextId.suggestedId,
          idProforma: current.idProforma || nextId.suggestedId,
        }))
      } catch (error) {
        if (!cancelled) {
          notify.error('Error al cargar datos', getApiErrorMessage(error))
        }
      } finally {
        if (!cancelled) setIsLoadingRefs(false)
      }
    }

    void loadReferences()

    return () => {
      cancelled = true
    }
  }, [editingProformaId, setHeader])

  const applyCustomer = useCallback(
    (customerId: string) => {
      const selected = customers.find((item) => String(item.id) === customerId)
      if (!selected) {
        setHeader({
          customerId: '',
          nombreCliente: '',
          rucCedula: '',
          direccion: '',
        })
        return
      }

      setHeader({
        customerId: selected.id,
        nombreCliente: selected.nombreCliente,
        rucCedula: selected.rucCedula,
        direccion: selected.direccion ?? '',
      })
    },
    [customers, setHeader],
  )

  const verifyIdAvailability = useCallback(
    async (idProforma: string, suggestedId = header.suggestedId) => {
      if (isIdLocked) return true

      const trimmed = idProforma.trim()
      if (!trimmed) {
        setIdConflictMessage(undefined)
        return true
      }

      setIsCheckingId(true)
      try {
        const availability = await checkProformaIdAvailability(trimmed)
        if (availability === 'available') {
          setIdConflictMessage(undefined)
          return true
        }

        const message = getIdConflictMessage(trimmed, availability, suggestedId)
        setIdConflictMessage(message)
        setHeaderFieldErrors({ idProforma: message })
        notify.warning('ID no disponible', message)
        return false
      } catch (error) {
        notify.error('No se pudo validar el ID', getApiErrorMessage(error))
        return false
      } finally {
        setIsCheckingId(false)
      }
    },
    [header.suggestedId, isIdLocked, setHeaderFieldErrors],
  )

  async function handleUseSuggestedId() {
    const suggestedId = header.suggestedId || (await loadSuggestedId())
    if (!suggestedId) return

    setHeader({ idProforma: suggestedId })
    setIdConflictMessage(undefined)
    setHeaderFieldErrors({})
    void verifyIdAvailability(suggestedId, suggestedId)
  }

  const selectedProfile = profiles.find((item) => item.id === header.profileId)
  const idError = headerFieldErrors.idProforma ?? idConflictMessage

  return (
    <div className="space-y-8">
      <Section
        title="Identificación"
        description={
          isIdLocked
            ? 'El ID no puede cambiarse al editar un borrador existente.'
            : 'ID sugerido por el servidor, editable manualmente.'
        }
      >
        <Card>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              label="ID de proforma"
              value={header.idProforma}
              onChange={(event) => {
                setHeader({ idProforma: event.target.value })
                setIdConflictMessage(undefined)
                setHeaderFieldErrors({})
              }}
              onBlur={() => void verifyIdAvailability(header.idProforma)}
              error={idError}
              hint={
                header.suggestedId
                  ? `Sugerido por el servidor: ${header.suggestedId}`
                  : undefined
              }
              required
              disabled={disabled || isCheckingId || isIdLocked}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleUseSuggestedId()}
              disabled={disabled || isCheckingId || isIdLocked || !header.suggestedId}
            >
              Usar sugerido
            </Button>
          </div>
        </Card>
      </Section>

      <Section title="Proyecto y cliente">
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Proyecto"
                placeholder="Nombre del proyecto"
                value={header.nombreProyecto}
                onChange={(event) =>
                  setHeader({ nombreProyecto: event.target.value })
                }
                error={headerFieldErrors.nombreProyecto}
                required
                disabled={disabled}
              />
            </div>

            <Select
              label="Cliente"
              placeholder={
                isLoadingRefs ? 'Cargando clientes…' : 'Seleccione un cliente'
              }
              value={header.customerId ? String(header.customerId) : ''}
              onChange={(event) => applyCustomer(event.target.value)}
              options={customers.map((customer) => ({
                value: String(customer.id),
                label: customer.nombreCliente,
              }))}
              error={headerFieldErrors.customerId}
              required
              disabled={disabled}
            />

            <Input
              label="RUC / Cédula"
              value={header.rucCedula}
              onChange={(event) => setHeader({ rucCedula: event.target.value })}
              error={headerFieldErrors.rucCedula}
              hint="Se completa al elegir un cliente del catálogo."
              required
              disabled={disabled}
            />

            <div className="sm:col-span-2">
              <Input
                label="Dirección"
                value={header.direccion}
                onChange={(event) => setHeader({ direccion: event.target.value })}
                error={headerFieldErrors.direccion}
                required
                disabled={disabled}
              />
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Condiciones comerciales">
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Monto del contrato"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0"
              value={header.montoContrato}
              onChange={(event) =>
                setHeader({ montoContrato: event.target.value })
              }
              error={headerFieldErrors.montoContrato}
              hint="Solo en el frontend; no se envía al backend."
              required
              disabled={disabled}
            />

            <Input
              label="Tiempo de ejecución (días)"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="Ej. 30"
              value={header.tiempoEjecucion}
              onChange={(event) =>
                setHeader({ tiempoEjecucion: event.target.value })
              }
              error={headerFieldErrors.tiempoEjecucion}
              required
              disabled={disabled}
            />

            <Input
              label="Fecha"
              type="date"
              value={header.fecha}
              onChange={(event) => setHeader({ fecha: event.target.value })}
              error={headerFieldErrors.fecha}
              required
              disabled={disabled}
            />

            <div className="sm:col-span-2">
              <TextArea
                label="Notas y condiciones"
                placeholder="Validez de la oferta, garantías, observaciones…"
                value={header.notas}
                onChange={(event) => setHeader({ notas: event.target.value })}
                disabled={disabled}
              />
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Emisor e impuestos">
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Perfil emisor"
              placeholder={
                isLoadingRefs ? 'Cargando perfiles…' : 'Seleccione un perfil'
              }
              value={header.profileId ? String(header.profileId) : ''}
              onChange={(event) =>
                setHeader({
                  profileId: event.target.value
                    ? Number(event.target.value)
                    : '',
                })
              }
              options={profiles.map((profile) => ({
                value: String(profile.id),
                label: `${profile.nombre} — ${profile.cargo}`,
              }))}
              error={headerFieldErrors.profileId}
              required
              disabled={disabled}
            />

            {selectedProfile && (
              <div className="rounded-md border border-brand-gray/15 bg-[#fafafa] p-4 text-left text-sm text-brand-gray">
                <p className="font-semibold text-brand-wine">{selectedProfile.nombre}</p>
                <p className="mt-1">{selectedProfile.cargo}</p>
                {selectedProfile.registroSenescyt && (
                  <p className="mt-1 text-xs text-brand-gray/70">
                    Reg. SENESCYT: {selectedProfile.registroSenescyt}
                  </p>
                )}
                {(selectedProfile.telefono || selectedProfile.correo) && (
                  <p className="mt-1 text-xs text-brand-gray/70">
                    {[selectedProfile.telefono, selectedProfile.correo]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}

            <div className="sm:col-span-2">
              <Switch
                label="Aplica IVA"
                hint="El backend recalculará el IVA al guardar la proforma completa."
                checked={header.appliesIva}
                onChange={(event) =>
                  setHeader({ appliesIva: event.target.checked })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </Card>
      </Section>
    </div>
  )
}
