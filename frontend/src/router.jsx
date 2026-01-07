import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth_router from './pages/auth/App'
import UserLayout from './layouts/UserLayout'
import { AuthProvider } from './pages/auth/AuthContext'
import Index from './pages/index/Index'

function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route path="auth/*" element={<Auth_router />} />
            <Route index element={<Navigate to="index" />} />
            <Route path="index" element={<Index/>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Router