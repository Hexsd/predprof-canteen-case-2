import { Routes, Route, Navigate } from 'react-router-dom'
import CheckCook from './Check'
import Menu from './Menu'
import Products from './Products'

export default function CookRouter() {
    return (
            <Route element={<CheckCook/>}>
                <Route path="/cook/products" element={<Products/>}/>
                <Route path="/cook/menu" element={<Menu/>}/>
            </Route> 
        
    )
   
}