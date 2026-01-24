import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './pages/auth/AuthContext'
import UserLayout from './layouts/UserLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Index from './pages/index/Index'
import CookRouter from './pages/cook/Router'
import AdminRouter from './pages/admin/Router'
import PersonalPage from './pages/auth/PersonalPage'


function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route element={<UserLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/cook/*" element={<CookRouter/>}/>
            <Route path="/admin/*" element={<AdminRouter/>}/>
            <Route path="/personal" element={<PersonalPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Router
