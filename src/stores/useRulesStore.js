import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'excel-cleanup-rules'
const PROFILES_KEY = 'excel-cleanup-profiles'

export const useRulesStore = defineStore('rules', () => {
  // ─── State ───────────────────────────────────────────────
  const rules = ref([])
  const activeProfile = ref('Default')
  const profiles = ref(['Default'])

  // ─── Actions ─────────────────────────────────────────────
  const loadRules = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved)) {
          rules.value = saved
        }
      }

      // Hydrate profiles + active profile
      const profilesRaw = localStorage.getItem(PROFILES_KEY)
      if (profilesRaw) {
        const savedProfiles = JSON.parse(profilesRaw)
        if (Array.isArray(savedProfiles.profiles) && savedProfiles.profiles.length > 0) {
          profiles.value = savedProfiles.profiles
        }
        if (typeof savedProfiles.activeProfile === 'string' && savedProfiles.activeProfile) {
          // Only set active if it still exists in the profiles list
          if (profiles.value.includes(savedProfiles.activeProfile)) {
            activeProfile.value = savedProfiles.activeProfile
          }
        }
      }
    } catch (e) {
      console.warn('[RulesStore] Failed to load from localStorage:', e)
    }
  }

  const addRule = (rule) => {
    const newRule = {
      id: rule.id || crypto.randomUUID(),
      ...rule,
    }
    // Stamp profile — default to the currently active profile if not specified
    if (!newRule.profile) {
      newRule.profile = activeProfile.value
    }
    rules.value.push(newRule)
    return newRule
  }

  const updateRule = (id, updatedRule) => {
    const index = rules.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      rules.value[index] = { ...rules.value[index], ...updatedRule, id }
      // Preserve profile if not explicitly provided in the update
      if (!rules.value[index].profile) {
        rules.value[index].profile = activeProfile.value
      }
    }
  }

  const deleteRule = (id) => {
    const index = rules.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      rules.value.splice(index, 1)
    }
  }

  // Replace the entire rules array (used for reordering)
  const setRules = (newRulesArray) => {
    if (Array.isArray(newRulesArray)) {
      rules.value = newRulesArray
    }
  }

  // ─── Profile Management ─────────────────────────────────
  const addProfile = (profileName, setActive = false) => {
    if (!profileName || typeof profileName !== 'string') return
    const name = profileName.trim()
    if (!name) return

    if (!profiles.value.includes(name)) {
      profiles.value.push(name)
    }

    if (setActive) {
      activeProfile.value = name
    }
  }

  const setActiveProfile = (profileName) => {
    if (typeof profileName === 'string' && profiles.value.includes(profileName)) {
      activeProfile.value = profileName
    }
  }

  const deleteProfile = (profileName) => {
    if (profileName === 'Default') return // Protect the default profile
    if (!profiles.value.includes(profileName)) return

    // Remove the profile
    profiles.value = profiles.value.filter((p) => p !== profileName)

    // Reassign rules that belonged to the deleted profile to 'Default'
    for (const rule of rules.value) {
      if (rule.profile === profileName) {
        rule.profile = 'Default'
      }
    }

    // If we just deleted the active profile, fall back to 'Default'
    if (activeProfile.value === profileName) {
      activeProfile.value = 'Default'
    }
  }

  // Import rules from an external JSON file
  // Generates fresh UUIDs to prevent ID collisions with existing rules
  const importRules = (importedRules) => {
    if (!Array.isArray(importedRules)) {
      console.warn('[RulesStore] importRules expects an array')
      return 0
    }

    let addedCount = 0

    for (const rule of importedRules) {
      // Only import rules that have the minimum required fields
      if (rule && typeof rule === 'object' && rule.name && rule.matchField) {
        const newRule = {
          id: crypto.randomUUID(), // Always generate fresh ID
          name: String(rule.name),
          matchField: String(rule.matchField),
          matchType: rule.matchType ? String(rule.matchType) : 'Contains',
          matchValue: String(rule.matchValue || ''),
          outputColumn: rule.outputColumn ? String(rule.outputColumn) : 'Remark 1',
          outputValue: String(rule.outputValue || ''),
          // Stamp with imported profile if valid, otherwise current active profile
          profile: (typeof rule.profile === 'string' && rule.profile.trim())
            ? rule.profile.trim()
            : activeProfile.value,
        }
        rules.value.push(newRule)
        addedCount++
      }
    }

    return addedCount
  }

  // ─── Persistence: rules array ───────────────────────────
  watch(
    rules,
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules.value))
      } catch (e) {
        console.warn('[RulesStore] Failed to save to localStorage:', e)
      }
    },
    { deep: true }
  )

  // ─── Persistence: profiles + active profile ─────────────
  watch(
    [activeProfile, profiles],
    () => {
      try {
        localStorage.setItem(
          PROFILES_KEY,
          JSON.stringify({
            activeProfile: activeProfile.value,
            profiles: profiles.value,
          })
        )
      } catch (e) {
        console.warn('[RulesStore] Failed to save profiles to localStorage:', e)
      }
    },
    { deep: true }
  )

  return {
    rules,
    activeProfile,
    profiles,
    addRule,
    updateRule,
    deleteRule,
    setRules,
    addProfile,
    setActiveProfile,
    deleteProfile,
    importRules,
    loadRules,
  }
})