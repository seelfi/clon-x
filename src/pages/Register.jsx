
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function Register() {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const fullName = formData.get('fullName')
    const username = formData.get('username')
    const email = formData.get('email')
    const password = formData.get('password')

    if (
      !fullName?.trim() ||
      !username?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return
    }

    navigate('/')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Crear tu cuenta</h1>
        <p>Únete a la conversación.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">
            Nombre completo
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Tu nombre completo"
            required
          />

          <label htmlFor="username">
            Nombre de usuario
          </label>

          <input
            id="username"
            name="username"
            type="text"
            placeholder="Elige un nombre de usuario"
            required
          />

          <label htmlFor="email">
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="nombre@correo.com"
            required
          />

          <label htmlFor="password">
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Crea una contraseña"
            required
          />

          <button type="submit">
            Crear cuenta
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
