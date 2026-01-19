import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './pages/auth/AuthContext'
import UserLayout from './layouts/UserLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Index from './pages/index/Index'
import UserList from './pages/auth/UserList'
import CookRouter from './pages/cook/Router'
import CheckCook from './pages/cook/Check'
import Menu from './pages/cook/Menu'
import Products from './pages/cook/Products'


function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route element={<UserLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/users" element={<UserList />} />
            <Route element={<CheckCook/>}>
                            <Route path="/cook/products" element={<Products/>}/>
                            <Route path="/cook/menu" element={<Menu/>}/>
                        </Route> 
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Router
