import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'excel-cleanup-settings'

export const useSettingsStore = defineStore('settings', () => {
  // ─── State ───────────────────────────────────────────────
  const isDark = ref(false)
  const defaultDateFormat = ref('US') // 'US' | 'INTL'
  const isHelpOpen = ref(false)      // Ephemeral — not persisted

  // ─── Actions ─────────────────────────────────────────────
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  const setDateFormat = (format) => {
    if (format === 'US' || format === 'INTL') {
      defaultDateFormat.value = format
    }
  }

  const toggleHelp = () => {
    isHelpOpen.value = !isHelpOpen.value
  }

  const initializeTheme = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)

        if (typeof saved.isDark === 'boolean') {
          isDark.value = saved.isDark
        }
        if (saved.defaultDateFormat === 'US' || saved.defaultDateFormat === 'INTL') {
          defaultDateFormat.value = saved.defaultDateFormat
        }

        document.documentElement.classList.toggle('dark', isDark.value)
      }
    } catch (e) {
      console.warn('[SettingsStore] Failed to load from localStorage:', e)
    }
  }

  // ─── Persistence: auto-save on any state change ──────────
  // Note: isHelpOpen is intentionally excluded — it's ephemeral UI state
  watch(
    [isDark, defaultDateFormat],
    () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            isDark: isDark.value,
            defaultDateFormat: defaultDateFormat.value,
          })
        )
      } catch (e) {
        console.warn('[SettingsStore] Failed to save to localStorage:', e)
      }
    }
  )

  return {
    isDark,
    defaultDateFormat,
    isHelpOpen,
    toggleDarkMode,
    setDateFormat,
    toggleHelp,
    initializeTheme,
  }
})