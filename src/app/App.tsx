import { HashRouter as Router } from 'react-router-dom'
import { AppRoutes } from './routes'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CommandPalette } from '@/components/command/CommandPalette'

const queryClient = new QueryClient()

import { useEffect } from 'react'
import { companyService } from '@/services/companyService'

export function App() {
    useEffect(() => {
        companyService.initTheme()
    }, [])

    return (
        <Router>
            <QueryClientProvider client={queryClient}>
                <AppRoutes />
                <CommandPalette />
                <Toaster position="top-right" richColors closeButton />
            </QueryClientProvider>
        </Router>
    )
}

export default App
