import { useState } from 'react'
import './index.css'
import type { City, Event } from './types'
import { useSavedEvents } from './hooks/useSavedEvents'
import CitySelectScreen from './screens/CitySelectScreen'
import FeedScreen from './screens/FeedScreen'
import DetailScreen from './screens/DetailScreen'
import WeekScreen from './screens/WeekScreen'
import SearchScreen from './screens/SearchScreen'
import SavedScreen from './screens/SavedScreen'
import TabBar from './components/TabBar'

type Tab = 'feed' | 'week' | 'saved' | 'search'

function App() {
  const [city, setCity] = useState<City | null>(() => {
    return (localStorage.getItem('eventful_city') as City) || null
  })
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showCitySelect, setShowCitySelect] = useState(false)
  const { saved, toggle, isSaved } = useSavedEvents()

  const handleCitySelect = (c: City) => {
    setCity(c)
    localStorage.setItem('eventful_city', c)
    setShowCitySelect(false)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleBack = () => {
    setSelectedEvent(null)
  }

  // City select screen
  if (!city || showCitySelect) {
    return <CitySelectScreen onSelect={handleCitySelect} />
  }

  // Event detail overlay
  if (selectedEvent) {
    return (
      <DetailScreen
        event={selectedEvent}
        saved={isSaved(selectedEvent.id)}
        onBack={handleBack}
        onSave={() => toggle(selectedEvent.id)}
      />
    )
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <FeedScreen
            city={city}
            onCityChange={() => setShowCitySelect(true)}
            onEventClick={handleEventClick}
            onSearchClick={() => setActiveTab('search')}
          />
        )
      case 'week':
        return (
          <WeekScreen
            city={city}
            onBack={() => setActiveTab('feed')}
            onEventClick={handleEventClick}
          />
        )
      case 'search':
        return (
          <SearchScreen
            onBack={() => setActiveTab('feed')}
            onEventClick={handleEventClick}
          />
        )
      case 'saved':
        return (
          <SavedScreen
            savedIds={saved}
            onBack={() => setActiveTab('feed')}
            onEventClick={handleEventClick}
          />
        )
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      <div className="flex-1 pb-20">
        {renderScreen()}
      </div>
      <TabBar active={activeTab} onChange={setActiveTab} savedCount={saved.length} />
    </div>
  )
}

export default App
