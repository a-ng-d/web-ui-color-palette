import { hydrate } from 'preact-iso'
import { initExternals } from './data/externals'
import { App } from './App'

initExternals()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

hydrate(<App />, root)
