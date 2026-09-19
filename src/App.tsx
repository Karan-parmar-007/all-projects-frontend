import React from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { SkillsPage } from '@/pages/SkillsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { AuthProvider } from '@/context/AuthContext'
import { AdminGate } from '@/pages/admin/AdminGate'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage'
import { AdminProjectFormPage } from '@/pages/admin/AdminProjectFormPage'
import { AdminSkillsPage } from '@/pages/admin/AdminSkillsPage'
import { AdminStatusesPage } from '@/pages/admin/AdminStatusesPage'
import { LiveAppPage } from '@/pages/LiveAppPage'

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a192f] text-[#8892b0]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/apps/:projectSlug" element={<LiveAppPage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminGate>
                <AdminLayout />
              </AdminGate>
            }
          >
            <Route index element={<AdminProjectsPage />} />
            <Route path="projects/new" element={<AdminProjectFormPage />} />
            <Route path="projects/:id" element={<AdminProjectFormPage />} />
            <Route path="statuses" element={<AdminStatusesPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
