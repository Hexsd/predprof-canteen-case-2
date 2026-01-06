import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth_router from './pages/auth/App'
import UserLayout from './layouts/UserLayout'
import { AuthProvider } from './pages/auth/AuthContext'

function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route path="auth/*" element={<Auth_router />} />
            <Route index element={<Navigate to="auth/login" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Router