import { Link, NavLink, useNavigate } from 'react-router-dom'
import '../styles/Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()

  const storedUser = localStorage.getItem('user')

  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : {
        fullName: 'Usuario',
        username: 'usuario'
      }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <Link
        to="/"
        className="sidebar__logo"
        aria-label="Ir al inicio"
      >
        𝕏
      </Link>

      <nav className="sidebar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>⌂</span> Inicio
        </NavLink>

        <NavLink
          to={`/users/${currentUser.username}`}
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>♙</span> Perfil
        </NavLink>

        <NavLink
          to={`/users/${currentUser.username}/following`}
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>♧</span> Siguiendo
        </NavLink>

        <NavLink
          to={`/users/${currentUser.username}/followers`}
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span>♧</span> Seguidores
        </NavLink>
      </nav>

      <Link
        to="/publish"
        className="sidebar__button"
      >
        Publicar
      </Link>

      <div className="sidebar__auth">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
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