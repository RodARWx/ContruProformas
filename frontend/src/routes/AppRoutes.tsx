import { Navigate, Route, Routes } from 'react-router-dom'
import { AccessPage } from '../pages/AccessPage'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { DesignSystemDemoPage } from '../pages/DesignSystemDemoPage'
import { EditProformaPage } from '../pages/proformas/EditProformaPage'
import { ImportProformaRoutePage } from '../pages/proformas/ImportProformaPage'
import { NewProformaPage } from '../pages/proformas/NewProformaPage'
import { ProformaHistoryPage } from '../pages/proformas/ProformaHistoryPage'
import { ProfilesPage } from '../pages/profiles/ProfilesPage'
import { RequireAccess } from './RequireAccess'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/acceso" element={<AccessPage />} />

      <Route element={<RequireAccess />}>
        <Route index element={<Navigate to="/proformas" replace />} />
        <Route path="proformas/nueva" element={<NewProformaPage />} />
        <Route path="proformas/importar" element={<ImportProformaRoutePage />} />
        <Route path="proformas/:id/editar" element={<EditProformaPage />} />
        <Route path="proformas" element={<ProformaHistoryPage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="perfiles" element={<ProfilesPage />} />
        <Route path="design-system" element={<DesignSystemDemoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/proformas" replace />} />
    </Routes>
  )
}
