
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { register } from '../services/api'
import '../styles/Auth.css'

function Register() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const fullName = formData.get('fullName').trim()
    const username = formData.get('username').trim()
    const email = formData.get('email').trim().toLowerCase()
    const password = formData.get('password')

    if (!fullName || !username || !email || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      setError('Ingresa un correo electrónico válido.')
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
      setError(error.message || 'No fue posible crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <Link to="/register" className="auth-brand" aria-label="TdeA X">
            <span className="auth-brand__icon">𝕏</span>
            <span>TdeA X</span>
          </Link>

          <div className="auth-intro__content">
            <span className="auth-eyebrow">UNA NUEVA CONVERSACIÓN TE ESPERA</span>

            <h2>
              Tu voz merece
              <span> ser escuchada.</span>
            </h2>

            <p className="auth-intro__description">
              Crea tu cuenta, encuentra personas con tus intereses y comparte
              aquello que te mueve.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <span className="auth-benefit__icon">↗</span>
                <div>
                  <h3>Conecta</h3>
                  <p>Sigue a personas con ideas interesantes.</p>
                </div>
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit__icon">◎</span>
                <div>
                  <h3>Comparte</h3>
                  <p>Expresa tus opiniones en tus publicaciones.</p>
                </div>
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit__icon">✧</span>
                <div>
                  <h3>Descubre</h3>
                  <p>Explora nuevas perspectivas y comunidades.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-intro__footer">
            Las grandes ideas empiezan con una conversación.
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__heading">
            <span className="auth-eyebrow">EMPIEZA ALGO NUEVO</span>
            <h1>Crear tu cuenta</h1>
            <p>Únete a la conversación.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="fullName">Nombre completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Tu nombre completo"
              autoComplete="name"
              required
            />

            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Elige un nombre de usuario"
              autoComplete="username"
              required
            />

            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@correo.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Contraseña</label>

            <div className="auth-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crea una contraseña"
                autoComplete="new-password"
                minLength={8}
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

            <p className="auth-hint">
              Usa una contraseña de al menos 8 caracteres.
            </p>

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
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-divider">
            <span>O</span>
          </div>

          <p className="auth-switch">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login">Inicia sesión</Link>
          </p>

          <p className="auth-terms">
            Crea tu perfil y comienza a compartir tus ideas con la comunidad.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Register
