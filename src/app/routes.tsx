import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Dashboard } from '@/features/dashboard/Dashboard'
import { Inventory } from '@/features/inventory/Inventory'
import { Sales } from '@/features/sales/Sales'
import { Reports } from '@/features/reports/Reports'
import { Settings } from '@/features/settings/Settings'
import { About } from '@/features/about/About'
import { Suppliers } from '@/features/suppliers/Suppliers'
import { Clients } from '@/features/clients/Clients'

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="sales" element={<Sales />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="clients" element={<Clients />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="about" element={<About />} />
            </Route>
        </Routes>
    )
}
