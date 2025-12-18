import { useNavigationStore } from '../../store/navigationStore'
import { useSettingsStore } from '../../store/settingsStore'

export function Navbar() {
  const { currentView, navigate } = useNavigationStore()
  const { hasApiKey } = useSettingsStore()

  return (
    <nav
      className="backdrop-blur-sm border-b sticky top-0 z-50"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-background-alt) 80%, transparent)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text)' }}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: 'var(--color-primary)' }}
            >
              <path d="M4 5a2 2 0 012-2h8a2 2 0 012 2v14l-6-3-6 3V5z" />
            </svg>
            Recursive Flashcards
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <NavButton
              active={currentView === 'home'}
              onClick={() => navigate('home')}
            >
              Home
            </NavButton>
            <NavButton
              active={currentView === 'course-search'}
              onClick={() => navigate('course-search')}
            >
              Course Search
            </NavButton>
            <NavButton
              active={currentView === 'settings'}
              onClick={() => navigate('settings')}
              hasWarning={!hasApiKey()}
            >
              Settings
            </NavButton>
          </div>
        </div>
      </div>
    </nav>
  )
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hasWarning?: boolean;
}

function NavButton({ active, onClick, children, hasWarning }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)'
          e.currentTarget.style.color = 'var(--color-text)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }
      }}
    >
      {children}
      {hasWarning && !active && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
      )}
    </button>
  )
}
