import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { NavIcon } from './NavIcon'
import { mainNavItems } from './navItems'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors',
    isActive
      ? 'bg-brand-coral/15 text-brand-wine'
      : 'text-brand-gray hover:bg-brand-gray/5',
  )

/** Navegación lateral para escritorio (lg+). */
export function SidebarNav() {
  return (
    <nav
      className="hidden w-60 shrink-0 border-r border-brand-gray/15 bg-white lg:flex lg:flex-col"
      aria-label="Navegación principal"
    >
      <div className="px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray/60">
          Menú
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-1 px-3 pb-6">
        {mainNavItems.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={linkClass}>
              <NavIcon name={item.icon} className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
