import { Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import RightPanel from './components/RightPanel'
import './styles/App.css'
import Publish from './pages/Publish'
import './styles/Auth.css'
import Profile from './pages/Profile'
import Following from './pages/Following'
import Followers from './pages/Followers'

function Home() {
  return (
    <div className="layout">
      <Sidebar />
      <Feed />
      <RightPanel />
    </div>
  )
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
          ¿No tienes una cuenta? <a href="/register">Regístrate</a>
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
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </section>
    </main>
  )
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/publish" element={<Publish />} />
      <Route path="/users/:username" element={<Profile />} />
      <Route path="/users/:username/following" element={<Following />} />
      <Route path="/users/:username/followers" element={<Followers />}/>
    </Routes>
  )
}

export default App