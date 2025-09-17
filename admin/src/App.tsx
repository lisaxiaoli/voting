import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/Layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import IdentityManagement from './pages/IdentityManagement'
import SBTManagement from './pages/SBTManagement'
import UserManagement from './pages/UserManagement'
import SystemSettings from './pages/SystemSettings'

const App: React.FC = () => {
    return (
        <AdminLayout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/identity" element={<IdentityManagement />} />
                <Route path="/sbt" element={<SBTManagement />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<SystemSettings />} />
            </Routes>
        </AdminLayout>
    )
}

export default App
