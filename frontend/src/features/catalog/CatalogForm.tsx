import { type FormEvent, useEffect, useState } from 'react'
import { Button, Card, Input } from '../../components/ui'
import type { CatalogItem } from '../../types/catalog'
import type {
  CreateCatalogItemPayload,
  UpdateCatalogItemPayload,
} from '../../types/catalog'

export interface CatalogFormValues {
  codigoSugerido: string
  descripcion: string
  unidad: string
  costoUnitario: string
}

const emptyValues: CatalogFormValues = {
  codigoSugerido: '',
  descripcion: '',
  unidad: '',
  costoUnitario: '',
}

interface CatalogFormProps {
  editingItem: CatalogItem | null
  isSubmitting: boolean
  onSubmit: (
    payload: CreateCatalogItemPayload | UpdateCatalogItemPayload,
  ) => Promise<void>
  onCancelEdit: () => void
}

export function CatalogForm({
  editingItem,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}: CatalogFormProps) {
  const [values, setValues] = useState<CatalogFormValues>(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<keyof CatalogFormValues, string>>>(
    {},
  )

  useEffect(() => {
    if (editingItem) {
      setValues({
        codigoSugerido: editingItem.codigoSugerido ?? '',
        descripcion: editingItem.descripcion,
        unidad: editingItem.unidad,
        costoUnitario: String(editingItem.costoUnitario),
      })
      setErrors({})
    } else {
      setValues(emptyValues)
      setErrors({})
    }
  }, [editingItem])

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof CatalogFormValues, string>> = {}

    if (!values.descripcion.trim()) {
      nextErrors.descripcion = 'La descripción es obligatoria'
    }
    if (!values.unidad.trim()) {
      nextErrors.unidad = 'La unidad es obligatoria'
    }
    if (!values.costoUnitario.trim()) {
      nextErrors.costoUnitario = 'El costo unitario es obligatorio'
    } else {
      const cost = Number(values.costoUnitario)
      if (Number.isNaN(cost) || cost < 0) {
        nextErrors.costoUnitario = 'Ingrese un número válido mayor o igual a 0'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      codigoSugerido: values.codigoSugerido.trim() || undefined,
      descripcion: values.descripcion.trim(),
      unidad: values.unidad.trim(),
      costoUnitario: Number(values.costoUnitario),
    }

    await onSubmit(payload)
    if (!editingItem) {
      setValues(emptyValues)
      setErrors({})
    }
  }

  return (
    <Card>
      <h2 className="font-subheading text-lg text-brand-wine">
        {editingItem ? 'Editar rubro' : 'Nuevo rubro'}
      </h2>
      <p className="mt-1 text-sm text-brand-gray/80">
        {editingItem
          ? `Modificando: ${editingItem.descripcion}`
          : 'Agregue un ítem al catálogo reutilizable.'}
      </p>

      <form className="mt-5 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <Input
          label="Código sugerido"
          placeholder="Ej. 01.02"
          value={values.codigoSugerido}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              codigoSugerido: event.target.value,
            }))
          }
          hint="Opcional. Se usa como código al insertar en una proforma."
        />

        <Input
          label="Unidad"
          placeholder="Ej. m², m³, gl"
          value={values.unidad}
          onChange={(event) =>
            setValues((current) => ({ ...current, unidad: event.target.value }))
          }
          error={errors.unidad}
          required
        />

        <div className="sm:col-span-2">
          <Input
            label="Descripción"
            placeholder="Descripción del rubro"
            value={values.descripcion}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                descripcion: event.target.value,
              }))
            }
            error={errors.descripcion}
            required
          />
        </div>

        <Input
          label="Costo unitario"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          placeholder="0"
          value={values.costoUnitario}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              costoUnitario: event.target.value,
            }))
          }
          error={errors.costoUnitario}
          required
        />

        <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {editingItem ? 'Guardar cambios' : 'Crear rubro'}
          </Button>
          {editingItem && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancelar edición
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
