import { Routes, Route, Link, Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import RightPanel from './components/RightPanel'
import Publish from './pages/Publish'
import Profile from './pages/Profile'
import Following from './pages/Following'
import Followers from './pages/Followers'
import mockPosts from './data/mockPosts'

import './styles/App.css'
import './styles/Auth.css'

function MainLayout() {
  const [posts, setPosts] = useState(mockPosts)

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Outlet context={{ posts, setPosts }} />
      </main>

      <RightPanel />
    </div>
  )
}

function Home() {
  return <Feed />
}

function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Iniciar sesión</h1>
        <p>Bienvenido de nuevo a X.</p>

        <form className="auth-form">
          <label htmlFor="loginUsername">Nombre de usuario</label>
          <input
            id="loginUsername"
            name="username"
            type="text"
            placeholder="Tu nombre de usuario"
            required
          />

          <label htmlFor="loginPassword">Contraseña</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Tu contraseña"
            required
          />

          <button type="submit">Iniciar sesión</button>
        </form>

        <p>
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </section>
    </main>
  )
}

function Register() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Crear tu cuenta</h1>
        <p>Únete a la conversación.</p>

        <form className="auth-form">
          <label htmlFor="fullName">Nombre completo</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Tu nombre completo"
            required
          />

          <label htmlFor="username">Nombre de usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Elige un nombre de usuario"
            required
          />

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nombre@correo.com"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Crea una contraseña"
            required
          />

          <button type="submit">Crear cuenta</button>
        </form>

        <p>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/users/:username" element={<Profile />} />
        <Route path="/users/:username/following" element={<Following />} />
        <Route path="/users/:username/followers" element={<Followers />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="*"
        element={<main><h1>Página no encontrada</h1></main>}
      />
    </Routes>
  )
}

export default App