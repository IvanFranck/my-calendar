import { FC, useEffect } from 'react'
import { AgentCalendar } from './components/agent-calendar/AgentCalendar'
import { useCalendarStore } from './stores/calendarStore'

const App: FC = () => {
  // Initialiser quelques agents de test
  const { addAgent } = useCalendarStore()

  // Ajouter des agents de test si nécessaire
  useEffect(() => {
    addAgent({ id: '1', name: 'Agent 1' })
    addAgent({ id: '2', name: 'Agent 2' })
    addAgent({ id: '3', name: 'Agent 3' })
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Calendrier des Agents
          </h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <AgentCalendar />
      </main>
    </div>
  )
}

export default App