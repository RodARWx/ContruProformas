import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ProformaDraftProvider } from './context/ProformaDraftContext'
import { SyncProvider } from './context/SyncContext'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <AppProvider>
      <SyncProvider>
        <ProformaDraftProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ProformaDraftProvider>
      </SyncProvider>
    </AppProvider>
  )
}

export default App
