import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './theme/ThemeProvider'
import { Navbar } from './components/Navigation/Navbar'
import { HomeView } from './components/Home/HomeView'
import { StudyView } from './components/Study/StudyView'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { CourseInput } from './components/CourseSearch/CourseInput'
import { useNavigationStore } from './store/navigationStore'
import { cleanupExpired } from './services/cache/indexedDB'

function App() {
  const { currentView } = useNavigationStore()

  // Cleanup expired cache entries on mount
  useEffect(() => {
    cleanupExpired().catch(console.error)
  }, [])

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'study':
        return <StudyView />
      case 'settings':
        return <SettingsPanel />
      case 'course-search':
        return <CourseInput />
      default:
        return <HomeView />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="py-4 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <p>Recursive Flashcards - AI-powered learning with infinite depth</p>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App
