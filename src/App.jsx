import { React } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home/HomePage.jsx'
import AuthenticationPage from './pages/Authentication/AuthenticationPage.jsx'
import SignUpPage from './pages/Authentication/SignUpPage.jsx'
import Goals from './pages/Goals/Goals.jsx'
import PostPage from './pages/Posts/PostPage.jsx'

function App() {

  return (
    <Routes>
      <Route path='/' element={< HomePage />} />
      <Route path='/home' element={< HomePage />} />
      <Route path='/auth' element={< AuthenticationPage />} />
      <Route path='/signup' element={< SignUpPage />} />
      <Route path='/goal' element={< Goals />} />
      <Route path='/post' element={< PostPage />} />
    </Routes>
  )
}

export default App