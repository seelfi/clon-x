
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function Login() {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')

    if (!username || !username.trim()) {
      return
    }

    navigate('/')
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

          <button type="submit">
            Iniciar sesión
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
