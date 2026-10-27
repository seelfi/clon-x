import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login } from '../services/api'
import '../styles/Auth.css'

function Login() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    setError('')
    setLoading(true)

    try {
      const data = await login(username, password)

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Iniciar sesión</h1>
        <p>Bienvenido de nuevo a X.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="loginUsername">
            Nombre de usuario
          </label>

          <input
            id="loginUsername"
            name="username"
            type="text"
            placeholder="Tu nombre de usuario"
            required
          />

          <label htmlFor="loginPassword">
            Contraseña
          </label>

          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Tu contraseña"
            required
          />

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p>
          ¿No tienes una cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
      </section>
    </main>
  )
}

export default Login