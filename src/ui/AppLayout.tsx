import type { ComponentChildren } from 'preact'
// Plugin app styles (preview, contrast, layout resets, etc.)
import 'ui-ui-color-palette/ui/stylesheets/app.css'
// Web-specific layout classes
import './web-layout.css'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children?: ComponentChildren
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    // id="app" picks up :root[data-theme='figma'] #app background from app.css
    <div id="app" class="web-app">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
