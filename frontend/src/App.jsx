import React from 'react';
import "./App.css"
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';

const App = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route path='/dashboard' element={<DashboardPage />} />
                <Route path='/settings' element={<SettingsPage />} />
            </Routes>
        </>
    )
}

export default App