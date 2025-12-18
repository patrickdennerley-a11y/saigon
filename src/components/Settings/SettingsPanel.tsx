import { useState } from 'react'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { ThemeSettings } from './ThemeSettings'
import { useSettingsStore } from '../../store/settingsStore'
import { useNavigationStore } from '../../store/navigationStore'
import type { AppSettings } from '../../types'

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore()
  const { navigate } = useNavigationStore()

  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [model, setModel] = useState(settings.model)
  const [prefetchDepth, setPrefetchDepth] = useState(settings.prefetchDepth)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'theme'>('general')

  const handleSave = () => {
    updateSettings({
      apiKey: apiKey.trim(),
      model,
      prefetchDepth,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const modelOptions: { value: AppSettings['model']; label: string; description: string }[] = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', description: 'Most capable, best for complex explanations' },
    { value: 'claude-haiku-4-20250514', label: 'Claude Haiku 4', description: 'Fast and cost-effective (recommended)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Previous generation, still excellent' },
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Settings</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('home')}>
          Back
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'general' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'theme' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        >
          Theme & Colors
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-8">
          {/* API Key Section */}
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--color-background-alt)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Anthropic API Key
            </h3>
            <Input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Your API key is stored locally and never sent to our servers.
              Get your key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-accent)' }}
                className="hover:underline"
              >
                Anthropic Console
              </a>
            </p>
          </section>

          {/* Model Selection */}
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--color-background-alt)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Claude Model
            </h3>
            <div className="space-y-3">
              {modelOptions.map((option) => (
                <label
                  key={option.value}
                  className="block p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    backgroundColor: model === option.value
                      ? `color-mix(in srgb, var(--color-primary) 20%, transparent)`
                      : 'var(--color-surface)',
                    border: `2px solid ${model === option.value ? 'var(--color-primary)' : 'transparent'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="model"
                    value={option.value}
                    checked={model === option.value}
                    onChange={(e) => setModel(e.target.value as AppSettings['model'])}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {option.label}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {option.description}
                      </div>
                    </div>
                    {model === option.value && (
                      <svg
                        className="w-5 h-5"
                        style={{ color: 'var(--color-primary)' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Prefetch Settings */}
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--color-background-alt)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Performance
            </h3>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Prefetch Depth: {prefetchDepth} layers
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={prefetchDepth}
                onChange={(e) => setPrefetchDepth(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  accentColor: 'var(--color-primary)',
                }}
              />
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Higher values pre-generate more explanation layers in the background.
                This uses more API calls but makes flipping feel instant.
              </p>
            </div>
          </section>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full" size="lg">
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved!
              </span>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      ) : (
        <section
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--color-background-alt)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Theme & Colors
          </h3>
          <ThemeSettings />
        </section>
      )}
    </div>
  )
}
