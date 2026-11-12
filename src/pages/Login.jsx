
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login } from '../services/api'
import '../styles/Auth.css'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const successMessage = location.state?.message

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username').trim()
    const password = formData.get('password')

    if (!username || !password) {
      setError('Ingresa tu nombre de usuario y contraseña.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await login(username, password)

      signIn(data.token, data.user)

      navigate('/', { replace: true })
    } catch (error) {
      setError(error.message || 'No fue posible iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <Link to="/login" className="auth-brand" aria-label="TdeA X">
            <span className="auth-brand__icon">𝕏</span>
            <span>TdeA X</span>
          </Link>

          <div className="auth-intro__content">
            <span className="auth-eyebrow">TU COMUNIDAD, TU VOZ</span>

            <h2>
              Las conversaciones
              <span> empiezan aquí.</span>
            </h2>

            <p className="auth-intro__description">
              Conecta con personas, comparte tus ideas y descubre qué está
              pasando en el mundo.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <span className="auth-benefit__icon">↗</span>
                <div>
                  <h3>Conecta</h3>
                  <p>Sigue a las personas que te interesan.</p>
                </div>
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit__icon">◎</span>
                <div>
                  <h3>Comparte</h3>
                  <p>Publica tus ideas y participa en conversaciones.</p>
                </div>
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit__icon">✧</span>
                <div>
                  <h3>Descubre</h3>
                  <p>Encuentra nuevas perspectivas cada día.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-intro__footer">
            Una idea puede iniciar una gran conversación.
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__heading">
            <span className="auth-eyebrow">QUÉ BUENO TENERTE DE VUELTA</span>
            <h1>Inicia sesión</h1>
            <p>Continúa donde lo dejaste.</p>
          </div>

          {successMessage && (
            <p className="auth-success" role="status">
              {successMessage}
            </p>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="loginUsername">Nombre de usuario</label>
            <input
              id="loginUsername"
              name="username"
              type="text"
              placeholder="Tu nombre de usuario"
              autoComplete="username"
              required
            />

            <div className="auth-label-row">
              <label htmlFor="loginPassword">Contraseña</label>
            </div>

            <div className="auth-password-wrapper">
              <input
                id="loginPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />

              <button
                className="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="auth-divider">
            <span>O</span>
          </div>

          <p className="auth-switch">
            ¿Todavía no tienes una cuenta?{' '}
            <Link to="/register">Regístrate gratis</Link>
          </p>

          <p className="auth-terms">
            Al continuar, aceptas participar en una comunidad basada en el
            respeto y las buenas conversaciones.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Login
