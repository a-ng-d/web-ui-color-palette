import { Button, SemanticMessage } from '@unoff/ui'
import { $isSuggestedLanguageDisplayed } from '@ui-lib/stores'
import { useTolgee, useTranslate } from '@tolgee/react'
import { useStore } from '@nanostores/preact'
import { useAppState } from '../data/AppStateContext'
import type { Language } from '@ui-lib/types'

const LANGUAGE_SUGGESTION_KEYS: Partial<Record<Language, string>> = {
  'en-US': 'en',
  'pt-BR': 'pt',
  'fr-FR': 'fr',
  'zh-Hans-CN': 'zh',
  'es-ES': 'es',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
}

export function LanguageSuggestionBanner() {
  const { state, setState } = useAppState()
  const isDisplayed = useStore($isSuggestedLanguageDisplayed)
  const tolgee = useTolgee()
  const { t } = useTranslate()

  if (!isDisplayed || !state.suggestedLanguage) return null

  const langCode = LANGUAGE_SUGGESTION_KEYS[state.suggestedLanguage]
  if (!langCode) return null

  const dismiss = () => {
    setState({ suggestedLanguage: null })
    $isSuggestedLanguageDisplayed.set(false)
    window.localStorage.setItem('is_suggested_language_displayed', 'false')
  }

  const accept = () => {
    const language = state.suggestedLanguage
    if (!language) return

    tolgee.changeLanguage(language).then(() => {
      document.documentElement.setAttribute('lang', language)
    })
    window.localStorage.setItem('user_language', language)
    dismiss()
  }

  return (
    <SemanticMessage
      type="INFO"
      message={t(`user.language.suggestion.${langCode}.message`)}
      actionsSlot={
        <>
          <Button
            type="secondary"
            label={t(`user.language.suggestion.${langCode}.cta`)}
            action={accept}
          />
          <Button
            type="icon"
            icon="close"
            action={dismiss}
          />
        </>
      }
      isAnchored
    />
  )
}
