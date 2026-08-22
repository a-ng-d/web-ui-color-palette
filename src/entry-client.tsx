import { hydrate } from 'preact-iso'
import { App } from './App'
import { initExternals } from "./data/externals";

initExternals();

hydrate(<App />, document.getElementById('root')!)
