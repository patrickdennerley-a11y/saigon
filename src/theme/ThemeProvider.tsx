import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { themePresets } from './presets'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getActiveTheme = useSettingsStore((state) => state.getActiveTheme)
  const themePreset = useSettingsStore((state) => state.settings?.themePreset)
  const customColors = useSettingsStore((state) => state.settings?.customColors)

  useEffect(() => {
    // Get theme with fallback to ocean preset
    const theme = getActiveTheme?.() ?? themePresets.ocean

    if (!theme) return

    const root = document.documentElement

    // Apply CSS variables
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-primary-hover', theme.primaryHover)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-background', theme.background)
    root.style.setProperty('--color-background-alt', theme.backgroundAlt)
    root.style.setProperty('--color-surface', theme.surface)
    root.style.setProperty('--color-text', theme.text)
    root.style.setProperty('--color-text-muted', theme.textMuted)
    root.style.setProperty('--color-border', theme.border)
    root.style.setProperty('--color-accent', theme.accent)

    // Compute a readable text color for primary buttons (on-primary).
    // Choose between `theme.text` and `theme.background` based on contrast with primary.
    const hexToRgb = (hex?: string) => {
      if (!hex) return { r: 0, g: 0, b: 0 }
      const h = hex.replace('#', '')
      const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
      const int = parseInt(full, 16)
      return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255,
      }
    }

    const lum = (c: { r: number; g: number; b: number }) => {
      const srgb = [c.r, c.g, c.b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
      return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
    }

    const contrastRatio = (a: string, b: string) => {
      const La = lum(hexToRgb(a))
      const Lb = lum(hexToRgb(b))
      const L1 = Math.max(La, Lb)
      const L2 = Math.min(La, Lb)
      return (L1 + 0.05) / (L2 + 0.05)
    }

    const onPrimaryCandidates = [theme.text, theme.background]
    let best = onPrimaryCandidates[0]
    let bestRatio = contrastRatio(theme.primary, best)
    for (let i = 1; i < onPrimaryCandidates.length; i++) {
      const c = onPrimaryCandidates[i]
      const r = contrastRatio(theme.primary, c)
      if (r > bestRatio) {
        best = c
        bestRatio = r
      }
    }

    root.style.setProperty('--color-on-primary', best)
    // Also provide an explicit on-surface fallback
    root.style.setProperty('--color-on-surface', theme.text)
    // Update body background
    document.body.style.background = `linear-gradient(to bottom right, ${theme.background}, ${theme.backgroundAlt}, ${theme.background})`
  }, [themePreset, customColors, getActiveTheme])

  return <>{children}</>
}
