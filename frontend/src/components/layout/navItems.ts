export type NavIconName = 'plus' | 'history' | 'catalog' | 'profiles'

export interface NavItem {
  to: string
  label: string
  shortLabel: string
  icon: NavIconName
  end?: boolean
}

export const mainNavItems: NavItem[] = [
  {
    to: '/proformas/nueva',
    label: 'Nueva proforma',
    shortLabel: 'Nueva',
    icon: 'plus',
  },
  {
    to: '/proformas',
    label: 'Historial',
    shortLabel: 'Historial',
    icon: 'history',
    end: true,
  },
  {
    to: '/catalogo',
    label: 'Catálogo de rubros',
    shortLabel: 'Catálogo',
    icon: 'catalog',
  },
  {
    to: '/perfiles',
    label: 'Perfiles',
    shortLabel: 'Perfiles',
    icon: 'profiles',
  },
]
