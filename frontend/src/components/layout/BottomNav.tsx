import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { NavIcon } from './NavIcon'
import { mainNavItems } from './navItems'

/** Navegación inferior fija para móvil y tablet (< lg). */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-gray/15 bg-white lg:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {mainNavItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-start justify-center px-2 py-3 text-left transition-colors',
                  isActive ? 'text-brand-wine' : 'text-brand-gray/70',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon
                    name={item.icon}
                    className={cn(
                      'mb-0.5 h-5 w-5',
                      isActive ? 'text-brand-coral' : 'text-brand-gray/60',
                    )}
                  />
                  <span
                    className={cn(
                      'w-full truncate text-[10px] font-semibold leading-tight sm:text-xs',
                      isActive && 'text-brand-wine',
                    )}
                  >
                    {item.shortLabel}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
