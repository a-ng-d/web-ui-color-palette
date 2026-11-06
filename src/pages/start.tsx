import { useLocation } from 'preact-iso'
import { useEffect, useRef } from 'preact/hooks'
import chroma from 'chroma-js'
import { uid } from 'uid'
import { makeDefaultShift } from '@yelbolt/engine-ui-color-palette'
import { doScale, FeatureStatus } from '@unoff/utils'
import { $creditsCount, getDefaultPreset, getPresets } from '@ui-lib/stores'
import { getClosestColorName } from '@ui-lib/utils/colorNameHelper'
import isValidPaletteConfiguration from '@ui-lib/utils/isValidPaletteConfiguration'
import { trackActionEvent } from '@ui-lib/external/tracking'
import { useTranslate } from '@tolgee/react'
import webConfig from '../data/webConfig'
import createPalette from '../data/bridge/creations/createPalette'
import { getAllPalettes } from '../data/bridge/db'
import { useAppState } from '../data/AppStateContext'
import type { Service } from '@ui-lib/types'
import type { SourceColorConfiguration } from '@yelbolt/engine-ui-color-palette'

const FALLBACK_PATH = '/palettes/local'

const feature = (name: string, planStatus: string, editor: string) =>
  new FeatureStatus({
    features: webConfig.features,
    featureName: name,
    planStatus,
    currentService: 'MANAGE' as Service,
    currentEditor: editor,
  } as ConstructorParameters<typeof FeatureStatus>[0])

export default function StartPage() {
  const { route } = useLocation()
  const { state } = useAppState()
  const { t } = useTranslate()
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!state.isLoaded || hasStarted.current) return
    hasStarted.current = true

    const run = async () => {
      const createFeature = feature(
        'CREATE_PALETTE',
        state.planStatus,
        state.editor
      )
      const localFeature = feature(
        'LOCAL_PALETTES',
        state.planStatus,
        state.editor
      )
      const count = (await getAllPalettes()).filter(
        isValidPaletteConfiguration
      ).length

      if (!createFeature.isActive() || localFeature.isReached(count))
        return route(FALLBACK_PATH, true)

      const limit =
        feature('COLORS_ADD', state.planStatus, state.editor).limit ?? 5
      const sourceColors: Array<SourceColorConfiguration> = Array.from(
        { length: limit },
        () => {
          const hex = chroma.random().hex()
          const gl = chroma(hex).gl()
          return {
            name: getClosestColorName(hex),
            rgb: { r: gl[0], g: gl[1], b: gl[2] },
            source: 'DEFAULT' as const,
            id: uid(),
            isRemovable: false,
          }
        }
      )

      const preset =
        getPresets(t).find((p) => p.id === 'CUSTOM_10_100') ??
        getDefaultPreset(t)
      const id = await createPalette({
        data: {
          sourceColors,
          exchange: {
            id: '',
            name: t('settings.global.name.default'),
            description: '',
            preset,
            scale: doScale(preset.stops, preset.min, preset.max, preset.easing),
            shift: {
              chroma: makeDefaultShift('CHROMA'),
              hue: makeDefaultShift('HUE'),
            },
            areSourceColorsLocked: false,
            colors: [],
            colorSpace: 'OKLCH',
            visionSimulationMode: 'NONE',
            algorithmVersion: webConfig.versions.algorithmVersion,
            textColorsTheme: { lightColor: '#FFFFFF', darkColor: '#000000' },
          },
        },
      } as Parameters<typeof createPalette>[0])

      trackActionEvent(
        webConfig.env.isMixpanelEnabled,
        state.userSession.userId,
        state.userIdentity.id,
        state.planStatus,
        state.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'CREATE_PALETTE',
          colors: sourceColors.length,
          stops: preset.stops.length,
        }
      )

      route(`/palettes/${encodeURIComponent(id)}`, true)
    }

    run().catch((error) => {
      console.error('[start] Palette creation failed:', error)
      route(FALLBACK_PATH, true)
    })
  }, [state.isLoaded])

  return null
}
