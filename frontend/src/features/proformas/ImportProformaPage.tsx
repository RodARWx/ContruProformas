import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Input, Section, Select, Switch, TextArea } from '../../components/ui'
import { useSync } from '../../context/SyncContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { fetchCustomers } from '../customers/customersApi'
import { fetchProfiles } from '../profiles/profilesApi'
import { getApiErrorMessage, isApiConflict } from '../../lib/api'
import { formatCurrency } from '../../lib/format'
import { notify } from '../../lib/toast'
import type { Customer } from '../../types/customer'
import type { ImportPreviewResult } from '../../types/import'
import { createEmptyHeaderDraft, type ProformaHeaderDraft } from '../../types/proforma'
import type { Profile } from '../../types/profile'
import {
  ExcelParseError,
  INSTITUTIONAL_TEMPLATE_ERROR,
  parseInstitutionalExcel,
  type ParsedExcelMetadata,
} from './excelParser'
import {
  editableLinesToRubros,
  ImportProformaDetailTable,
  previewDetailsToEditableLines,
  type ImportEditableLine,
} from './ImportProformaDetailTable'
import { ImportProformaTotals } from './ImportProformaTotals'
import { draftToCreatePayload } from './proformaMappers'
import { validateProformaDetalles, validateProformaHeader } from './proformaValidation'
import {
  checkProformaIdAvailability,
  createProforma,
  fetchNextProformaId,
  getIdConflictMessage,
  importPreviewProforma,
} from './proformasApi'
import { createDetailLine } from '../../types/proforma-detail'

type ImportStep = 'upload' | 'preview'

function metadataToHeaderDraft(
  metadata: ParsedExcelMetadata,
  suggestedId: string,
  appliesIva: boolean,
): ProformaHeaderDraft {
  const header = createEmptyHeaderDraft(suggestedId)
  return {
    ...header,
    idProforma: metadata.idProforma || suggestedId,
    suggestedId,
    nombreProyecto: metadata.nombreProyecto ?? '',
    fecha: metadata.fecha?.slice(0, 10) || header.fecha,
    tiempoEjecucion: metadata.tiempoEjecucion ?? '',
    nombreCliente: metadata.nombreCliente ?? '',
    rucCedula: metadata.rucCedula ?? '',
    direccion: metadata.direccion ?? '',
    notas: metadata.notas ?? '',
    appliesIva,
  }
}

function matchCustomerId(
  customers: Customer[],
  metadata: ParsedExcelMetadata,
): number | '' {
  if (metadata.rucCedula) {
    const byRuc = customers.find(
      (item) => item.rucCedula.trim() === metadata.rucCedula?.trim(),
    )
    if (byRuc) return byRuc.id
  }

  if (metadata.nombreCliente) {
    const normalizedName = metadata.nombreCliente.trim().toLowerCase()
    const byName = customers.find(
      (item) => item.nombreCliente.trim().toLowerCase() === normalizedName,
    )
    if (byName) return byName.id
  }

  return ''
}

function matchProfileId(
  profiles: Profile[],
  metadata: ParsedExcelMetadata,
): number | '' {
  if (!metadata.nombreEmisor) return ''

  const normalizedName = metadata.nombreEmisor.trim().toLowerCase()
  const byName = profiles.find(
    (item) => item.nombre.trim().toLowerCase() === normalizedName,
  )
  return byName?.id ?? ''
}

function previewLinesToDetailLines(lines: ImportEditableLine[]) {
  return lines.map((line) =>
    createDetailLine({
      codigo: line.codigo ?? '',
      descripcion: line.descripcion,
      unidad: line.unidad,
      cantidad: line.cantidad,
      costoUnitario: line.costoUnitario,
      tiempo: line.tiempo,
    }),
  )
}

export function ImportProformaPage() {
  const navigate = useNavigate()
  const { queueDraftForSync } = useSync()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<ImportStep>('upload')
  const [isParsing, setIsParsing] = useState(false)
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fileName, setFileName] = useState('')

  const [customers, setCustomers] = useState<Customer[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [header, setHeader] = useState<ProformaHeaderDraft>(createEmptyHeaderDraft())
  const [headerFieldErrors, setHeaderFieldErrors] = useState<
    Partial<Record<keyof ProformaHeaderDraft, string>>
  >({})
  const [detailFieldError, setDetailFieldError] = useState<string | undefined>()

  const [lines, setLines] = useState<ImportEditableLine[]>([])
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [savedProformaId, setSavedProformaId] = useState<string | null>(null)

  const debouncedRubros = useDebouncedValue(
    useMemo(
      () =>
        editableLinesToRubros(lines).map((line) => ({
          codigo: line.codigo?.trim() || undefined,
          descripcion: line.descripcion.trim(),
          tiempo: line.tiempo?.trim() || undefined,
          unidad: line.unidad.trim(),
          cantidad: line.cantidad,
          costoUnitario: line.costoUnitario,
        })),
      [lines],
    ),
    400,
  )

  const debouncedAppliesIva = useDebouncedValue(header.appliesIva, 400)

  const refreshPreview = useCallback(
    async (rubros: typeof debouncedRubros, appliesIva: boolean) => {
      if (rubros.length === 0) return null

      const invalidLine = rubros.find(
        (line) =>
          !line.descripcion ||
          !line.unidad ||
          !Number.isFinite(line.cantidad) ||
          line.cantidad <= 0 ||
          !Number.isFinite(line.costoUnitario) ||
          line.costoUnitario < 0,
      )
      if (invalidLine) return null

      setIsRefreshingPreview(true)
      try {
        const result = await importPreviewProforma({ appliesIva, rubros })
        setPreview(result)
        setLines((current) =>
          current.map((line, index) => ({
            ...line,
            ...result.detalles[index],
            localId: line.localId,
          })),
        )
        return result
      } catch (error) {
        notify.error(
          'No se pudo actualizar la vista previa',
          getApiErrorMessage(error),
        )
        return null
      } finally {
        setIsRefreshingPreview(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (step !== 'preview') return
    void refreshPreview(debouncedRubros, debouncedAppliesIva)
  }, [debouncedRubros, debouncedAppliesIva, refreshPreview, step])

  async function handleFileSelected(file: File | null) {
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      notify.error(
        'Formato no válido',
        'Solo se admiten archivos Excel (.xlsx). La importación desde PDF u OCR no está soportada.',
      )
      return
    }

    setIsParsing(true)
    setFileName(file.name)
    setSavedProformaId(null)

    try {
      const buffer = await file.arrayBuffer()
      const parsed = await parseInstitutionalExcel(buffer)

      const [customerList, profileList, nextId] = await Promise.all([
        fetchCustomers(),
        fetchProfiles(),
        fetchNextProformaId(),
      ])

      setCustomers(customerList)
      setProfiles(profileList)

      const draftHeader = metadataToHeaderDraft(
        parsed.metadata,
        nextId.suggestedId,
        parsed.appliesIva,
      )

      const customerId = matchCustomerId(customerList, parsed.metadata)
      const profileId = matchProfileId(profileList, parsed.metadata)

      if (customerId) {
        const selected = customerList.find((item) => item.id === customerId)
        if (selected) {
          draftHeader.customerId = selected.id
          draftHeader.nombreCliente = selected.nombreCliente
          draftHeader.rucCedula = selected.rucCedula
          draftHeader.direccion = selected.direccion ?? ''
        }
      }

      if (profileId) {
        draftHeader.profileId = profileId
      }

      setHeader(draftHeader)
      setHeaderFieldErrors({})
      setDetailFieldError(undefined)

      const previewResult = await importPreviewProforma({
        appliesIva: parsed.appliesIva,
        rubros: parsed.rubros,
      })

      setPreview(previewResult)
      setLines(previewDetailsToEditableLines(previewResult.detalles))
      setStep('preview')

      notify.success(
        'Archivo importado',
        `${previewResult.detalles.length} rubro(s) listos para revisión.`,
      )
    } catch (error) {
      const description =
        error instanceof ExcelParseError
          ? error.message
          : INSTITUTIONAL_TEMPLATE_ERROR

      notify.error('No se pudo importar el Excel', description)
      setStep('upload')
      setPreview(null)
      setLines([])
    } finally {
      setIsParsing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function applyCustomer(customerId: string) {
    const selected = customers.find((item) => String(item.id) === customerId)
    if (!selected) {
      setHeader((current) => ({
        ...current,
        customerId: '',
        nombreCliente: '',
        rucCedula: '',
        direccion: '',
      }))
      return
    }

    setHeader((current) => ({
      ...current,
      customerId: selected.id,
      nombreCliente: selected.nombreCliente,
      rucCedula: selected.rucCedula,
      direccion: selected.direccion ?? '',
    }))
  }

  function handleUpdateLine(localId: string, patch: Partial<ImportEditableLine>) {
    setLines((current) =>
      current.map((line) =>
        line.localId === localId ? { ...line, ...patch } : line,
      ),
    )
  }

  function handleAddLine() {
    setLines((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        codigo: '',
        descripcion: '',
        tiempo: '',
        unidad: '',
        cantidad: 1,
        costoUnitario: 0,
        total: 0,
      },
    ])
  }

  function handleRemoveLine(localId: string) {
    setLines((current) => current.filter((line) => line.localId !== localId))
  }

  function isConnectivityError(error: unknown): boolean {
    if (!navigator.onLine) return true
    return axios.isAxiosError(error) && !error.response
  }

  async function handleSaveAsNew() {
    const headerErrors = validateProformaHeader(header)
    const detailError = validateProformaDetalles(previewLinesToDetailLines(lines))

    setHeaderFieldErrors(headerErrors)
    setDetailFieldError(detailError)

    if (Object.keys(headerErrors).length > 0 || detailError) {
      const messages = [
        ...Object.values(headerErrors).filter(Boolean),
        detailError,
      ].filter(Boolean)
      notify.error('Complete los campos obligatorios', messages.slice(0, 2).join(' · '))
      return
    }

    const availability = await checkProformaIdAvailability(header.idProforma)
    if (availability !== 'available') {
      const message = getIdConflictMessage(
        header.idProforma,
        availability,
        header.suggestedId,
      )
      setHeaderFieldErrors({ idProforma: message })
      notify.warning('ID no disponible', message)
      return
    }

    setIsSaving(true)
    try {
      const createPayload = draftToCreatePayload(
        header,
        previewLinesToDetailLines(lines),
      )
      const saved = await createProforma(createPayload)
      setSavedProformaId(saved.idProforma)
      notify.success(
        'Proforma guardada',
        `${saved.idProforma} — total ${formatCurrency(saved.totalGeneral)}`,
      )
      navigate(`/proformas/${encodeURIComponent(saved.idProforma)}/editar`)
    } catch (error) {
      if (isApiConflict(error)) {
        const message = getApiErrorMessage(error)
        setHeaderFieldErrors({ idProforma: message })
        notify.warning('ID no disponible', message)
      } else if (isConnectivityError(error)) {
        await queueDraftForSync(
          draftToCreatePayload(header, previewLinesToDetailLines(lines)),
          getApiErrorMessage(error),
        )
        notify.warning(
          'Sin conexión: importación guardada localmente',
          'Se sincronizará cuando vuelva la conexión. Puede reintentar manualmente desde el indicador.',
        )
      } else {
        notify.error('No se pudo guardar la proforma', getApiErrorMessage(error))
      }
    } finally {
      setIsSaving(false)
    }
  }

  function resetImport() {
    setStep('upload')
    setPreview(null)
    setLines([])
    setFileName('')
    setSavedProformaId(null)
    setHeader(createEmptyHeaderDraft())
    setHeaderFieldErrors({})
    setDetailFieldError(undefined)
  }

  return (
    <div className="space-y-10 text-left">
      <header className="border-l-4 border-brand-coral pl-4">
        <h1 className="font-heading text-2xl uppercase text-brand-wine sm:text-3xl">
          Importar proforma anterior
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-gray/80">
          Suba un archivo Excel (.xlsx) exportado desde Construproformas. El sistema
          leerá los rubros, enviará una vista previa al servidor y podrá guardar como
          nueva proforma. No se admite importación desde PDF u OCR.
        </p>
        <Link
          to="/proformas"
          className="app-text-link mt-3 inline-block text-sm"
        >
          ← Volver al historial
        </Link>
      </header>

      {step === 'upload' && (
        <Section title="Seleccionar archivo">
          <Card className="space-y-4">
            <p className="text-sm text-brand-gray/80">
              El archivo debe seguir la plantilla institucional: cabecera
              «CONSTRUMÉTRICA — PROFORMA», datos de proyecto/cliente y tabla de rubros
              con columnas Código, Descripción, Tiempo, Unidad, Cantidad y Costo Unit.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="text-sm text-brand-gray file:mr-3 file:rounded file:border-0 file:bg-brand-coral file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-red"
                onChange={(event) => void handleFileSelected(event.target.files?.[0] ?? null)}
                disabled={isParsing}
              />
              {isParsing && (
                <span className="text-sm text-brand-gray/70">Leyendo archivo…</span>
              )}
            </div>
          </Card>
        </Section>
      )}

      {step === 'preview' && preview && (
        <>
          <Section title="Archivo cargado">
            <Card>
              <p className="text-sm text-brand-gray">
                <span className="font-semibold">{fileName}</span>
                {' · '}
                {lines.length} rubro(s) en vista previa
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={resetImport}>
                  Elegir otro archivo
                </Button>
              </div>
            </Card>
          </Section>

          <Section
            title="Cabecera de la nueva proforma"
            description="Complete o ajuste los datos antes de guardar. Cliente y perfil emisor deben existir en el catálogo."
          >
            <Card className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="ID de proforma"
                  value={header.idProforma}
                  error={headerFieldErrors.idProforma}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      idProforma: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Proyecto"
                  value={header.nombreProyecto}
                  error={headerFieldErrors.nombreProyecto}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      nombreProyecto: event.target.value,
                    }))
                  }
                />
                <Select
                  label="Cliente"
                  placeholder="Seleccione un cliente"
                  value={header.customerId === '' ? '' : String(header.customerId)}
                  error={headerFieldErrors.customerId}
                  onChange={(event) => applyCustomer(event.target.value)}
                  options={customers.map((customer) => ({
                    value: String(customer.id),
                    label: customer.nombreCliente,
                  }))}
                />
                <Select
                  label="Perfil emisor"
                  placeholder="Seleccione un perfil"
                  value={header.profileId === '' ? '' : String(header.profileId)}
                  error={headerFieldErrors.profileId}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      profileId: event.target.value
                        ? Number(event.target.value)
                        : '',
                    }))
                  }
                  options={profiles.map((profile) => ({
                    value: String(profile.id),
                    label: `${profile.nombre} — ${profile.cargo}`,
                  }))}
                />
                <Input
                  label="Fecha"
                  type="date"
                  value={header.fecha}
                  error={headerFieldErrors.fecha}
                  onChange={(event) =>
                    setHeader((current) => ({ ...current, fecha: event.target.value }))
                  }
                />
                <Input
                  label="Tiempo de ejecución"
                  value={header.tiempoEjecucion}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      tiempoEjecucion: event.target.value,
                    }))
                  }
                />
              </div>

              <Switch
                label="Aplica IVA"
                checked={header.appliesIva}
                onChange={(event) =>
                  setHeader((current) => ({
                    ...current,
                    appliesIva: event.target.checked,
                  }))
                }
              />

              <TextArea
                label="Notas"
                value={header.notas}
                onChange={(event) =>
                  setHeader((current) => ({ ...current, notas: event.target.value }))
                }
              />
            </Card>
          </Section>

          <ImportProformaDetailTable
            lines={lines}
            onChange={handleUpdateLine}
            onAddLine={handleAddLine}
            onRemoveLine={handleRemoveLine}
          />

          {detailFieldError && (
            <p className="text-sm text-brand-red" role="alert">
              {detailFieldError}
            </p>
          )}

          <ImportProformaTotals
            preview={preview}
            isRefreshing={isRefreshingPreview}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleSaveAsNew()}
              disabled={isSaving || isRefreshingPreview}
            >
              {isSaving ? 'Guardando…' : 'Guardar como nueva proforma'}
            </Button>
            <p className="text-sm text-brand-gray/70">
              Envía cabecera y rubros con POST /proformas. Los totales definitivos los
              recalcula el backend al guardar.
            </p>
          </div>

          {savedProformaId && (
            <p className="text-sm text-brand-gray/80">
              Última proforma guardada:{' '}
              <span className="font-semibold">{savedProformaId}</span>
            </p>
          )}
        </>
      )}
    </div>
  )
}
