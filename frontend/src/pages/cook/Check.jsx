import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEffect } from 'react'

export default function CheckCook() {
    const location = useLocation();
    const navigate = useNavigate(); 
    const { user: currentUser } = useAuth();
    useEffect(() => { 
        if (currentUser?.role!='cook')
        {
            navigate('/');
        }
    }, [currentUser, navigate, location]); 

    return (<Outlet/>)
    
}