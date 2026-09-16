import { hydrate } from 'preact-iso'
import { initExternals } from './data/externals'
import { App } from './App'

initExternals()

hydrate(<App />, document.getElementById('root')!)
