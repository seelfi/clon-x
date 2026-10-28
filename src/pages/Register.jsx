import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { register } from '../services/api'
import '../styles/Auth.css'

function Register() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const fullName = formData.get('fullName').trim()
    const username = formData.get('username').trim()
    const email = formData.get('email').trim()
    const password = formData.get('password')

    if (!fullName || !username || !email || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await register(fullName, username, email, password)

      navigate('/login', {
        state: {
          message: '¡Cuenta creada! Ahora puedes iniciar sesión.',
        },
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Crear tu cuenta</h1>
        <p>Únete a la conversación.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
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
            minLength={8}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  )
}

export default Register