import { motion } from 'framer-motion'
import { useSettingsStore } from '../../store/settingsStore'
import { themePresets, presetInfo } from '../../theme/presets'
import type { ThemePreset, ThemeColors } from '../../types'

const colorLabels: Record<keyof ThemeColors, string> = {
  primary: 'Primary',
  primaryHover: 'Primary Hover',
  secondary: 'Secondary',
  background: 'Background',
  backgroundAlt: 'Background Alt',
  surface: 'Surface',
  text: 'Text',
  textMuted: 'Text Muted',
  border: 'Border',
  accent: 'Accent',
}

export function ThemeSettings() {
  const { settings, setThemePreset, setCustomColor, getActiveTheme } = useSettingsStore()
  const activeTheme = getActiveTheme()

  const presetKeys = Object.keys(themePresets) as ThemePreset[]

  return (
    <div className="space-y-6">
      {/* Theme Presets */}
      <div>
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Theme Presets
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presetKeys.map((preset) => {
            const colors = themePresets[preset]
            const info = presetInfo[preset]
            const isActive = settings.themePreset === preset

            return (
              <motion.button
                key={preset}
                onClick={() => setThemePreset(preset)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative p-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: isActive ? `${activeTheme.primary}20` : 'var(--color-surface)',
                  border: `2px solid ${isActive ? activeTheme.primary : 'transparent'}`,
                }}
              >
                {/* Color preview */}
                <div className="flex gap-1 mb-2">
                  {[colors.primary, colors.secondary, colors.accent, colors.background].map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  {info.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {info.description}
                </div>
                {isActive && (
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeTheme.primary }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Custom Colors
          </h4>
          {settings.themePreset === 'custom' && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text)' }}
            >
              Active
            </span>
          )}
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Click any color to customize. Modifying colors will switch to Custom theme.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(colorLabels) as Array<keyof ThemeColors>).map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 p-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <input
                type="color"
                value={settings.customColors[key]}
                onChange={(e) => setCustomColor(key, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                  {colorLabels[key]}
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {settings.customColors[key]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Live Preview
        </h4>
        <div
          className="p-4 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.background}, ${activeTheme.backgroundAlt})`,
            border: `1px solid ${activeTheme.border}`,
          }}
        >
          <div
            className="p-4 rounded-lg mb-3"
            style={{ backgroundColor: activeTheme.surface }}
          >
            <h5 style={{ color: activeTheme.text }} className="font-medium mb-1">
              Sample Card Title
            </h5>
            <p style={{ color: activeTheme.textMuted }} className="text-sm">
              This is how your content will look with the current theme.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTheme.primary,
                color: activeTheme.text,
              }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTheme.surface,
                color: activeTheme.text,
                border: `1px solid ${activeTheme.border}`,
              }}
            >
              Secondary
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="text-sm"
              style={{ color: activeTheme.accent }}
            >
              Accent text
            </span>
            <span
              className="text-sm"
              style={{ color: activeTheme.textMuted }}
            >
              Muted text
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
