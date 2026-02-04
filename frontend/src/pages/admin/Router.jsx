import { Routes, Route, Navigate } from 'react-router-dom'
import CheckAdmin from './Check'
import Stats from './Stats'
import UserList from './UserList'
import ManageApplications from './ManageApplications'

export default function AdminRouter() {
    return (
        <Routes>
            <Route element={<CheckAdmin/>}>
                <Route path="/stats" element={<Stats/>} />
                <Route path="/users" element={<UserList/>} />
                <Route path="/applications" element={<ManageApplications/>}/>
            </Route>
        </Routes>
    )
}
