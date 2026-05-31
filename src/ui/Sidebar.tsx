import { useLocation } from 'preact-iso'
import { Button } from '@unoff/ui'
import type { IconList } from '@unoff/ui'

const NAV_ITEMS: Array<{ path: string; icon: IconList; label: string }> = [
  { path: '/manage',  icon: 'colors',    label: 'Manage'   },
  { path: '/gen',     icon: 'ai',        label: 'Generate' },
  { path: '/extract', icon: 'image',     label: 'Extract'  },
  { path: '/wheel',   icon: 'list-tile', label: 'Wheel'    },
  { path: '/explore', icon: 'explore',   label: 'Explore'  },
]

export function Sidebar() {
  const { path, route } = useLocation()

  return (
    <nav class="web-sidebar" aria-label="Services">
      {NAV_ITEMS.map(({ path: href, icon, label }) => {
        const isActive = path === href || (href === '/manage' && path === '/')

        return (
          <Button
            key={href}
            type="icon"
            icon={icon}
            state={isActive ? 'selected' : 'default'}
            helper={{ label }}
            action={() => route(href)}
          />
        )
      })}
    </nav>
  )
}
