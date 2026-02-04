import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEffect } from 'react'

export default function CheckAdmin() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            navigate('/')
        }
    }, [currentUser, navigate, location])

    return <Outlet />
}
