import { Routes, Route, Navigate } from 'react-router-dom'
import CheckCook from './Check'
import Menu from './Menu'
import Products from './Products'

export default function CookRouter() {
    return (
        <Routes>
            <Route element={<CheckCook/>}>
                <Route path="products" element={<Products/>}/>
                <Route path="menu" element={<Menu/>}/>
            </Route> 
        </Routes>
            
        
    )
   
}