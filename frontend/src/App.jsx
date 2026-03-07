import React from 'react';
import "./App.css"
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import { LoginPage, RegisterPage } from './pages/AuthPages';

const App = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
            </Routes>
        </>
    )
}

export default App