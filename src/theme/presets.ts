import type { ThemeColors, ThemePreset } from '../types'

export const themePresets: Record<ThemePreset, ThemeColors> = {
  ocean: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#1e40af',
    background: '#0f172a',
    backgroundAlt: '#1e293b',
    surface: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#475569',
    accent: '#60a5fa',
  },
  purple: {
    primary: '#a855f7',
    primaryHover: '#9333ea',
    secondary: '#7c3aed',
    background: '#0c0a1d',
    backgroundAlt: '#1a1533',
    surface: '#2d2250',
    text: '#faf5ff',
    textMuted: '#c4b5fd',
    border: '#4c1d95',
    accent: '#c084fc',
  },
  monochrome: {
    primary: '#ffffff',
    primaryHover: '#e5e5e5',
    secondary: '#a3a3a3',
    background: '#000000',
    backgroundAlt: '#0a0a0a',
    surface: '#171717',
    text: '#ffffff',
    textMuted: '#a3a3a3',
    border: '#404040',
    accent: '#d4d4d4',
  },
  terminal: {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    secondary: '#15803d',
    background: '#000000',
    backgroundAlt: '#0a0f0a',
    surface: '#0f1a0f',
    text: '#22c55e',
    textMuted: '#4ade80',
    border: '#166534',
    accent: '#86efac',
  },
  sunset: {
    primary: '#f97316',
    primaryHover: '#ea580c',
    secondary: '#c2410c',
    background: '#1c1412',
    backgroundAlt: '#292018',
    surface: '#3d2c20',
    text: '#fff7ed',
    textMuted: '#fdba74',
    border: '#9a3412',
    accent: '#fb923c',
  },
  forest: {
    primary: '#10b981',
    primaryHover: '#059669',
    secondary: '#047857',
    background: '#0a1612',
    backgroundAlt: '#12211a',
    surface: '#1a3025',
    text: '#ecfdf5',
    textMuted: '#6ee7b7',
    border: '#065f46',
    accent: '#34d399',
  },
  custom: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#1e40af',
    background: '#0f172a',
    backgroundAlt: '#1e293b',
    surface: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#475569',
    accent: '#60a5fa',
  },
}

export const presetInfo: Record<ThemePreset, { name: string; description: string }> = {
  ocean: { name: 'Ocean Blue', description: 'Cool blue tones, professional look' },
  purple: { name: 'Purple Night', description: 'Rich purple with dark accents' },
  monochrome: { name: 'Monochrome', description: 'Pure black and white' },
  terminal: { name: 'Terminal', description: 'Hacker/Matrix green on black' },
  sunset: { name: 'Sunset', description: 'Warm orange and amber tones' },
  forest: { name: 'Forest', description: 'Natural green and earth tones' },
  custom: { name: 'Custom', description: 'Create your own color scheme' },
}

export function getThemeColors(preset: ThemePreset, customColors?: ThemeColors): ThemeColors {
  if (preset === 'custom' && customColors) {
    return customColors
  }
  return themePresets[preset]
}
