
import { Link, NavLink, useNavigate } from 'react-router-dom'
import '../styles/Sidebar.css'
import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const navigate = useNavigate()

  const { user, signOut } = useAuth()
  const currentUser = { fullName: user?.fullName || 'Usuario', username: user?.username || 'usuario' }

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <Link
        to="/"
        className="sidebar__logo"
        aria-label="TdeA X, inicio"
      >
        <span className="sidebar__logo-mark">𝕏</span>
        <span className="sidebar__logo-text">TdeA X</span>
      </Link>

      <nav className="sidebar__nav" aria-label="Navegación principal">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span aria-hidden="true">⌂</span>
          <span className="sidebar__link-label">Inicio</span>
        </NavLink>

        <NavLink
          to={`/users/${currentUser.username}`}
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span aria-hidden="true">♙</span>
          <span className="sidebar__link-label">Perfil</span>
        </NavLink>

        <NavLink
          to={`/users/${currentUser.username}/following`}
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span aria-hidden="true">♧</span>
          <span className="sidebar__link-label">Siguiendo</span>
        </NavLink>

        <NavLink
          to={`/users/${currentUser.username}/followers`}
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span aria-hidden="true">♧</span>
          <span className="sidebar__link-label">Seguidores</span>
        </NavLink>
      </nav>

      <Link to="/publish" className="sidebar__button">
        Publicar
      </Link>

      <div className="sidebar__auth">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar" aria-hidden="true">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar__user-info">
            <strong>{currentUser.fullName}</strong>
            <span>@{currentUser.username}</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__auth-link"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
