import React from 'react'
import { Route, Routes , Navigate} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import {Toaster} from "react-hot-toast"
import { useContext } from 'react';
import { AuthContext } from '../context/Auth';
const App = () => {
const {authUser}= useContext(AuthContext)

  return (
    <div className="bg-[url('./src/assets/bg.jpg')] bg-cover">
      <Toaster />
      <Routes>
        <Route path="/" element={authUser? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser? <LoginPage />: <Navigate to="/"/>}/>
        <Route path="/profile" element={authUser? <ProfilePage />: <Navigate to="/login"/>}/>
        <Route/>
      </Routes>
    </div>
  )
}

export default App