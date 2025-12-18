import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, ThemeColors, ThemePreset } from '../types'
import { themePresets, getThemeColors } from '../theme/presets'

interface SettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  hasApiKey: () => boolean;
  setThemePreset: (preset: ThemePreset) => void;
  setCustomColor: (key: keyof ThemeColors, value: string) => void;
  getActiveTheme: () => ThemeColors;
}

const defaultSettings: AppSettings = {
  apiKey: '',
  model: 'claude-haiku-4-20250514',
  prefetchDepth: 2,
  themePreset: 'ocean',
  customColors: { ...themePresets.ocean },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      hasApiKey: () => {
        const settings = get().settings
        return settings?.apiKey?.length > 0
      },
      setThemePreset: (preset) =>
        set((state) => ({
          settings: {
            ...defaultSettings,
            ...state.settings,
            themePreset: preset,
            // When switching to a non-custom preset, update customColors to match
            customColors: preset !== 'custom'
              ? { ...themePresets[preset] }
              : state.settings?.customColors ?? themePresets.ocean,
          },
        })),
      setCustomColor: (key, value) =>
        set((state) => ({
          settings: {
            ...defaultSettings,
            ...state.settings,
            themePreset: 'custom',
            customColors: {
              ...(state.settings?.customColors ?? themePresets.ocean),
              [key]: value,
            },
          },
        })),
      getActiveTheme: () => {
        const settings = get().settings
        // Handle case where settings might be partially loaded from old localStorage
        const themePreset = settings?.themePreset ?? 'ocean'
        const customColors = settings?.customColors ?? themePresets.ocean
        return getThemeColors(themePreset, customColors)
      },
    }),
    {
      name: 'flashcard-settings',
      // Merge function to handle migration from old settings format
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SettingsState> | undefined
        return {
          ...currentState,
          settings: {
            ...defaultSettings,
            ...persisted?.settings,
            // Ensure theme settings exist
            themePreset: persisted?.settings?.themePreset ?? 'ocean',
            customColors: persisted?.settings?.customColors ?? themePresets.ocean,
          },
        }
      },
    }
  )
)
